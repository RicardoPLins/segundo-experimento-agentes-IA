## Why

The project needs a clear, test-driven path to implement the **Web Scholar** system described in `docs/requirements.md`.
The requirements include CRUD flows, per-class evaluations, JSON persistence, and a daily email digest rule that can easily become ambiguous without an explicit specification.

This change establishes the initial **spec-first baseline** for the system and defines the acceptance criteria that will drive implementation using **Cucumber (Gherkin)**.

## What Changes

- Introduce initial system capabilities:
  - Students (CRUD)
  - Classes (CRUD) + enrollments
  - Evaluations (per class, per student, per meta)
  - Email digest notifications (daily per student)
- Define invariants and error behaviors.
- Define acceptance scenarios (WHEN/THEN/AND) suitable to be mirrored in Gherkin.

No production code is added by this change; this is a planning/specification baseline.

## Capabilities

### New Capabilities
- `students`: Manage students (CRUD) with CPF and email.
- `classes`: Manage classes (CRUD) and enroll/unenroll students.
- `evaluations`: Manage evaluations per class across defined metas with statuses `MANA|MPA|MA`.
- `notifications-email-digest`: Aggregate evaluation changes and send at most one email per day per student.

### Modified Capabilities
- (none)

## Impact

- Defines the target architecture shape (React TS frontend + Node TS backend).
- Defines the testing contract: Cucumber acceptance tests are the primary definition of done.
- Defines persistence constraints: JSON persistence is acceptable only with atomic writes and single-writer assumptions.
