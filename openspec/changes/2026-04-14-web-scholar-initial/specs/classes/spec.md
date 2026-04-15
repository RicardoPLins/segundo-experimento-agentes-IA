## Purpose

Provide CRUD management of classes and manage enrollment of students into classes.
Classes MUST have topic description, year, and semester.

## Data Contracts

### Input
- `topic: string` — class topic/description (e.g., "Introdução à Programação")
- `year: number` — academic year
- `semester: number` — academic semester (typically 1 or 2)

### Output
- `id: string` — class identifier
- `topic: string`
- `year: number`
- `semester: number`

### Side-Effects
- **[Persistence]**: classes and enrollments MUST be persisted to JSON.

### Error
- `ValidationError` — invalid year/semester/topic
- `NotFoundError` — class or student not found
- `ConflictError` — duplicate enrollment

## Invariants

- **INV-DAT-03**: Enrollment MUST be unique per `(classId, studentId)`.
- **INV-CLS-01**: `semester` MUST be either `1` or `2`.
- **INV-CLS-02**: A class with enrollments MUST NOT be deletable.

## ADDED Requirements

### Requirement: Create class
The system MUST allow a teacher to create a class with topic, year, and semester.

#### Scenario: Create a class successfully
- **WHEN** the teacher creates class `{ topic: "Introdução à Programação", year: 2026, semester: 1 }`
- **THEN** the system MUST persist the class and return a generated `id`

### Requirement: List classes
The system MUST allow listing classes for a dedicated classes page.

#### Scenario: Classes list includes created class
- **WHEN** class "Introdução à Programação" exists
- **THEN** listing classes MUST include "Introdução à Programação" with year and semester

### Requirement: Update class
The system MUST allow updating an existing class.

#### Scenario: Update class topic
- **WHEN** class "Introdução à Programação" exists
- **AND** the teacher updates its topic to "Programação 1"
- **THEN** subsequent reads MUST return topic "Programação 1"

### Requirement: Delete class
The system MUST allow deleting an existing class that has no enrollments.

#### Scenario: Delete empty class
- **WHEN** class "Introdução à Programação" exists
- **AND** the class has no enrolled students
- **AND** the teacher deletes the class
- **THEN** the class MUST no longer appear in the classes list

#### Scenario: Reject deletion of class with enrollments
- **WHEN** student "Ana" is enrolled in "Introdução à Programação"
- **AND** the teacher attempts to delete class "Introdução à Programação"
- **THEN** the system MUST reject the deletion with `ConflictError`

### Requirement: Enroll student
The system MUST allow enrolling an existing student into an existing class.

#### Scenario: Enroll a student in a class
- **WHEN** class "Introdução à Programação" exists
- **AND** student "Ana" exists
- **AND** the teacher enrolls "Ana" into "Introdução à Programação"
- **THEN** the class roster MUST include "Ana"

### Requirement: Unenroll student
The system MUST allow removing an enrollment.

#### Scenario: Unenroll a student from a class
- **WHEN** "Ana" is enrolled in "Introdução à Programação"
- **THEN** after unenrolling, the class roster MUST NOT include "Ana"

### Requirement: View class detail
The system MUST allow viewing a class with students and evaluations separated (as distinct sections).

#### Scenario: Class detail shows roster section
- **WHEN** the teacher opens class "Introdução à Programação" detail
- **THEN** the system MUST show the list of enrolled students
- **AND** the system MUST show a separate section for evaluations
