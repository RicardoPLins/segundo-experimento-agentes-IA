## Purpose

Provide CRUD management of students. Each student MUST have `name`, `cpf`, and `email`.
This capability underpins classes (enrollments) and evaluation tables.

## Data Contracts

### Input
- `name: string` — student full name (teacher provided)
- `cpf: string` — Brazilian CPF identifier (teacher provided)
- `email: string` — student email address (teacher provided)

### Output
- `id: string` — student identifier
- `name: string`
- `cpf: string`
- `email: string`
- `createdAt: string` — ISO date-time
- `updatedAt: string` — ISO date-time

### Side-Effects
- **[Persistence]**: student records MUST be persisted to JSON.

### Error
- `ValidationError` — when required fields are missing/invalid
- `ConflictError` — when uniqueness constraints are violated (if enforced)
- `NotFoundError` — when student does not exist

## Invariants

- **INV-DAT-01**: Student records MUST be persisted using atomic JSON writes (write temp → rename).
- **INV-DAT-02**: A student MUST have non-empty `name`, `cpf`, and `email`.
- **INV-STD-01**: `cpf` MUST be unique across all students.
- **INV-STD-02**: `email` MUST be unique across all students.

## ADDED Requirements

### Requirement: Create student
The system MUST allow a teacher to create a student with `name`, `cpf`, and `email`.

#### Scenario: Create a student successfully
- **WHEN** the teacher creates student `{ name: "Ana", cpf: "111.222.333-44", email: "ana@example.com" }`
- **THEN** the system MUST persist the student and return a generated `id`
- **AND** the student MUST appear in the students list

#### Scenario: Reject duplicate CPF
- **WHEN** the teacher creates student `{ name: "Ana", cpf: "111.222.333-44", email: "ana@example.com" }`
- **AND** the teacher creates student `{ name: "Bruno", cpf: "111.222.333-44", email: "bruno@example.com" }`
- **THEN** the system MUST reject the second creation with `ConflictError`

#### Scenario: Reject duplicate email
- **WHEN** the teacher creates student `{ name: "Ana", cpf: "111.222.333-44", email: "ana@example.com" }`
- **AND** the teacher creates student `{ name: "Bruno", cpf: "555.666.777-88", email: "ana@example.com" }`
- **THEN** the system MUST reject the second creation with `ConflictError`

### Requirement: List students
The system MUST provide a students list suitable for rendering a dedicated students page.

#### Scenario: Students list includes created student
- **WHEN** students exist in the system
- **THEN** listing students MUST return those students with `name`, `cpf`, and `email`

### Requirement: Update student
The system MUST allow updating an existing student.

#### Scenario: Update a student email
- **WHEN** the teacher updates student "Ana" email from "ana@example.com" to "ana2@example.com"
- **THEN** the system MUST persist the change
- **AND** subsequent reads MUST return the new email

### Requirement: Delete student
The system MUST allow deleting an existing student.

#### Scenario: Delete a student
- **WHEN** the teacher deletes student "Ana"
- **THEN** the student MUST no longer appear in the students list

#### Scenario: Reject deletion of enrolled student
- **WHEN** student "Ana" is enrolled in at least one class
- **AND** the teacher attempts to delete "Ana"
- **THEN** the system MUST reject the deletion with `ConflictError`
