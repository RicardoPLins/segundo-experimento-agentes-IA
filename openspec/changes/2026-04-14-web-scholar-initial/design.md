## Context

This repository will implement **Web Scholar** per `docs/requirements.md`.

Constraints:
- Frontend MUST be React + TypeScript.
- Backend MUST be Node.js + TypeScript.
- Persistence MUST use JSON.
- Development MUST be driven by Cucumber (Gherkin) acceptance tests.

Resolved decisions (to remove ambiguity before implementation):
- Evaluations are **per class** and the evaluations management page operates on a **selected class**.
- Default evaluation status for an enrolled student is `MANA` for all metas.
- Student deletion is blocked if the student has enrollments.
- Class deletion is blocked if the class has enrollments.
- Digest “per day” boundary uses timezone `America/Recife` by default (configurable).

## Architecture

### High-level
- `apps/frontend`: React SPA
- `apps/backend`: Node REST API
- Acceptance tests:
  - API: Cucumber + supertest (fast, stable)
  - UI smoke: Cucumber + Playwright

### Key Components

| Component | Responsibility | Input | Output |
|----------|---------------|-------|--------|
| `backend.routes.*` | HTTP routing + request/response mapping | HTTP requests | HTTP responses |
| `backend.services.StudentService` | Student CRUD rules + validation | DTOs | Domain entities |
| `backend.services.ClassService` | Class CRUD + enrollment rules | DTOs | Domain entities |
| `backend.services.EvaluationService` | Evaluation updates + invariants + change detection | DTOs | Evaluations + outbox events |
| `backend.repositories.JsonStore` | Atomic read/write JSON persistence | File path + data | Persisted JSON |
| `backend.email.DigestService` | Group outbox events and build daily digests | Outbox events | Email messages |
| `backend.email.EmailSender` | Send email via adapter | Message | Delivery result |

## Mapping: Spec -> Implementation -> Test

| Requirement | Implementation | Test |
|-------------|---------------|------|
| Students CRUD | `StudentService` + `StudentsRepository` | Cucumber API: `students.feature` |
| Classes CRUD + enrollments | `ClassService` + repositories | Cucumber API: `classes.feature` |
| Evaluations table + update | `EvaluationService` | Cucumber API: `evaluations.feature` |
| Daily digest rule | `DigestService` + job trigger | Cucumber API: `email-digest.feature` |
| INV-DAT-01 Atomic JSON writes | `JsonStore.writeAtomic()` | unit test `json_store_atomic_write` |

## Goals / Non-Goals

**Goals:**
- Provide a spec baseline that can be implemented incrementally.
- Make acceptance tests the “source of truth”.
- Keep persistence intentionally simple (JSON) but safe enough for coursework use.

**Non-Goals:**
- Authentication/authorization.
- Multi-instance backend scalability.
- Production-grade email infrastructure.

## Decisions

1. **Domain model**
   - Evaluations are per `(classId, studentId, meta)`.
   - Meta set is fixed: `requisitos`, `testes`, `backend`, `frontend`, `security`.
   - Status set is fixed: `MANA | MPA | MA`.

1.1 **Defaults**
   - For an enrolled student, metas with no explicit evaluation MUST default to `MANA` in table views.

1.2 **Deletion policy**
   - Deleting a student/class with enrollments is rejected with `ConflictError`.

2. **Email digest approach**
   - Use an outbox JSON log of evaluation-change events.
   - A daily job groups per student and sends one digest.

2.1 **Digest day boundary**
   - “Calendar day” is computed in a configured timezone (default: `America/Recife`).

3. **Testing strategy**
   - Most behavior is validated through API-level Cucumber tests (fast, deterministic).
   - UI tests are kept to a minimal smoke suite to avoid flakiness.

## API Design

### Students
- `GET /students`
- `POST /students`
- `GET /students/:id`
- `PUT /students/:id`
- `DELETE /students/:id`

### Classes + enrollment
- `GET /classes`
- `POST /classes`
- `GET /classes/:id`
- `PUT /classes/:id`
- `DELETE /classes/:id`
- `GET /classes/:id/students`
- `POST /classes/:id/students/:studentId`
- `DELETE /classes/:id/students/:studentId`

### Evaluations
- `GET /classes/:id/evaluations`
- `PUT /classes/:id/evaluations/:studentId`

### Digest job (test/dev)
- `POST /jobs/send-daily-digests`

## Data Flow

1. Teacher updates an evaluation.
2. `EvaluationService` diffs old vs new statuses.
3. For each change, write an outbox event.
4. Daily job groups outbox events per student and sends one email.
5. Outbox events are marked as sent.

## Error Handling

| Error | Source | Strategy | Recovery |
|------|--------|----------|----------|
| `ValidationError` | DTO validation | Return 400 with details | Fix request input |
| `NotFoundError` | Missing resource | Return 404 | Fix ID |
| `ConflictError` | Uniqueness / invariant violation | Return 409 | Resolve conflict |
| `PersistenceError` | JSON read/write fails | Return 500 + log | Retry or restore data |
| `EmailSendError` | Sender adapter fails | Keep outbox unsent | Retry job |

## Risks / Trade-offs

- JSON storage does not support concurrent writers → assume single backend process.
- Email digest “per day” depends on timezone definition → define timezone in config.

## Testing Strategy

| Layer | What to test | How | Count |
|-------|-------------|-----|-------|
| Acceptance (API) | CRUD rules, enrollment rules, evaluation rules, digest rule | Cucumber + supertest | ~20–40 |
| Unit | JSON store atomic writes, digest grouping, diffing evaluations | Vitest | ~20 |
| UI smoke | Pages render and basic user flows | Cucumber + Playwright | ~5 |

## Open Questions

- (none for baseline; future changes should be captured via proposal)
