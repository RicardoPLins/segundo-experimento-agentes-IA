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

## ADDED Requirements

### Requirement: Create class
The system MUST allow a teacher to create a class with topic, year, and semester.

#### Scenario: Create a class successfully
- **WHEN** the teacher creates class `{ topic: "Introdução à Programação", year: 2026, semester: 1 }`
- **THEN** the system MUST persist the class and return a generated `id`

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
