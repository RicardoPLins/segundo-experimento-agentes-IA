## Purpose

Notify students when their evaluations change.
The system MUST send at most **one email per day per student** containing all evaluation changes for that day, across all of the student’s classes.

## Data Contracts

### Input
- `evaluationChangeEvent`:
  - `studentId: string`
  - `classId: string`
  - `meta: string`
  - `oldStatus: string | null`
  - `newStatus: string`
  - `changedAt: string` (ISO date-time)

### Output
- `dailyDigestEmail`:
  - `to: string` — student email
  - `subject: string`
  - `body: string`

### Side-Effects
- **[Outbox]**: events MUST be appended to an outbox JSON file.
- **[Email]**: a daily job MUST send digest emails and mark events as sent.

### Error
- `EmailSendError` — sending fails; events MUST remain unsent for retry

## Invariants

- **INV-EML-01**: For a given student and calendar day, the system MUST send at most one digest email.
- **INV-EML-02**: A digest email MUST include all unsent evaluation changes for that student in that day.

## ADDED Requirements

### Requirement: Emit outbox event on evaluation change
When an evaluation is created or modified, the system MUST record a change event in the outbox.

#### Scenario: Outbox event created on update
- **WHEN** the teacher changes "Ana" meta `backend` from `MPA` to `MA` in class "Introdução à Programação"
- **THEN** the system MUST append an outbox event recording old and new status

### Requirement: Send one digest per day
A daily job MUST aggregate changes and send one email per student per day.

#### Scenario: Multiple changes in one day produce one email
- **WHEN** "Ana" has two evaluation changes on the same day in any classes
- **THEN** running the digest job MUST send exactly one email to "Ana"
- **AND** the email MUST include both changes

### Requirement: Retry on failure
If email sending fails, events MUST remain unsent.

#### Scenario: Failed send does not mark events as sent
- **WHEN** the digest job fails to send an email to "Ana"
- **THEN** the outbox events for that digest MUST remain unsent
- **AND** a subsequent retry MUST attempt to send again
