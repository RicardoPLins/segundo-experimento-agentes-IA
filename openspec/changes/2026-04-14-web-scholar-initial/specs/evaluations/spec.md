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

## ADDED Requirements

### Requirement: View evaluations table
The system MUST provide an evaluations table with one row per student and one column per meta.

#### Scenario: Evaluations table contains all metas
- **WHEN** class "Introdução à Programação" has students enrolled
- **THEN** the evaluations table MUST include columns for `Requisitos`, `testes`, `backend`, `frontend`, `security`
- **AND** each student MUST appear as a row with their current statuses

### Requirement: Update evaluation
The system MUST allow the teacher to fill or modify an evaluation status for any meta.

#### Scenario: Update backend meta
- **WHEN** student "Ana" is enrolled in "Introdução à Programação"
- **AND** the teacher sets meta `backend` to `MA` for "Ana" in that class
- **THEN** the system MUST persist the evaluation
- **AND** the evaluations table MUST show `backend=MA` for "Ana"

### Requirement: Persist evaluations
The system MUST persist evaluations in JSON.

#### Scenario: Evaluation persists after restart (conceptual)
- **WHEN** an evaluation is updated for "Ana" in "Introdução à Programação"
- **THEN** after a backend restart, reading evaluations MUST return the same stored status
