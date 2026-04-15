## Purpose

Manage student evaluations per class across defined metas.
An evaluations page MUST show a table with student name and one column per meta.

## Data Contracts

### Input
- `classId: string` — target class
- `studentId: string` — target student
- `meta: string` — one of `requisitos|testes|backend|frontend|security`
- `status: string` — one of `MANA|MPA|MA`

### Output
- `classId: string`
- `studentId: string`
- `meta: string`
- `status: string`
- `updatedAt: string` — ISO date-time

### Side-Effects
- **[Persistence]**: evaluations MUST be persisted to JSON.
- **[Notifications]**: evaluation changes MUST emit outbox events for digest.

### Error
- `ValidationError` — invalid meta/status
- `NotFoundError` — class or student not found

## Invariants

- **INV-EVL-01**: Meta MUST be one of: `requisitos`, `testes`, `backend`, `frontend`, `security`.
- **INV-EVL-02**: Status MUST be one of: `MANA`, `MPA`, `MA`.
- **INV-EVL-03**: Evaluations MUST only exist for students enrolled in the class.
- **INV-EVL-04**: For an enrolled student, the default status for any meta with no explicit evaluation MUST be `MANA`.

## ADDED Requirements

### Requirement: View evaluations table
The system MUST provide an evaluations table **per class** with one row per enrolled student and one column per meta.

#### Scenario: Evaluations table contains all metas
- **WHEN** class "Introdução à Programação" has students enrolled
- **THEN** the evaluations table MUST include columns for `Requisitos`, `testes`, `backend`, `frontend`, `security`
- **AND** each student MUST appear as a row with their current statuses

#### Scenario: Missing evaluations default to MANA
- **WHEN** student "Ana" is enrolled in "Introdução à Programação"
- **AND** no explicit evaluation has been set for "Ana" in that class
- **THEN** the evaluations table MUST show `MANA` for all metas for "Ana"

### Requirement: Update evaluation
The system MUST allow the teacher to fill or modify an evaluation status for any meta.

#### Scenario: Update backend meta
- **WHEN** student "Ana" is enrolled in "Introdução à Programação"
- **AND** the teacher sets meta `backend` to `MA` for "Ana" in that class
- **THEN** the system MUST persist the evaluation
- **AND** the evaluations table MUST show `backend=MA` for "Ana"

#### Scenario: Reject update for non-enrolled student
- **WHEN** student "Ana" exists
- **AND** "Ana" is NOT enrolled in "Introdução à Programação"
- **AND** the teacher attempts to set meta `backend` to `MA` for "Ana" in that class
- **THEN** the system MUST reject the update with `ConflictError`

#### Scenario: Reject invalid meta
- **WHEN** student "Ana" is enrolled in "Introdução à Programação"
- **AND** the teacher attempts to set meta `performance` to `MA` for "Ana" in that class
- **THEN** the system MUST reject the update with `ValidationError`

#### Scenario: Reject invalid status
- **WHEN** student "Ana" is enrolled in "Introdução à Programação"
- **AND** the teacher attempts to set meta `backend` to `OK` for "Ana" in that class
- **THEN** the system MUST reject the update with `ValidationError`

### Requirement: Persist evaluations
The system MUST persist evaluations in JSON.

#### Scenario: Evaluation persists after restart (conceptual)
- **WHEN** an evaluation is updated for "Ana" in "Introdução à Programação"
- **THEN** after a backend restart, reading evaluations MUST return the same stored status
