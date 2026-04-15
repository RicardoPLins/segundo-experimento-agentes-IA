# Plan — Web Scholar (React TS + Node TS + Cucumber TDD)

## Milestone 0 — Project Baseline (Spec-first)
**Outcome:** repository is ready for TDD implementation.
- Deliverables:
  - Initial OpenSpec change set under `openspec/changes/`
  - Agreed domain model + invariants
  - Initial Gherkin feature files (acceptance criteria)
- Acceptance criteria:
  - Open questions are either resolved or explicitly tracked as `Open Questions` in design/specs

## Milestone 1 — Students Capability (CRUD)
**Outcome:** student management works end-to-end.
- Backend:
  - REST endpoints for students CRUD
  - JSON persistence for students
  - Validation rules (CPF/email format and uniqueness as decided)
- Frontend:
  - `/students` page: list + create/edit/delete
- Tests:
  - Cucumber API scenarios for CRUD
  - Minimal UI Cucumber scenario for list view rendering

## Milestone 2 — Classes Capability (CRUD + Enrollment)
**Outcome:** classes and enrollments work end-to-end.
- Backend:
  - Classes CRUD
  - Enroll/unenroll endpoints
  - JSON persistence for classes + enrollments
- Frontend:
  - `/classes` page: list + CRUD
  - class detail view: roster
- Tests:
  - Cucumber API scenarios for CRUD + enrollment rules

## Milestone 3 — Evaluations Capability (per class + metas)
**Outcome:** teacher can fill/modify evaluations and view tables.
- Backend:
  - Store evaluations keyed by (classId, studentId, meta)
  - Expose class evaluations table API
  - Expose update endpoint (single meta or batch update per student)
- Frontend:
  - `/evaluations` page (as specified) and/or per-class evaluation view (per decision)
  - class detail view shows evaluations section
- Tests:
  - Cucumber API scenarios covering:
    - default values behavior
    - updating a meta
    - table view contains expected columns and values

## Milestone 4 — Email Digest Notifications (daily, per student)
**Outcome:** evaluation changes produce one daily digest email.
- Backend:
  - Create outbox events whenever evaluations change
  - Daily digest job groups events per student
  - Sender adapter with dev implementation (console or local SMTP)
- Tests:
  - Cucumber API scenarios:
    - multiple changes in one day produce one digest
    - changes across multiple classes are included
    - no duplicate digest within the same day

## Milestone 5 — Quality Gate + Packaging
**Outcome:** predictable builds and CI.
- Repo hygiene:
  - consistent formatting + lint
  - typecheck for both apps
- CI:
  - run unit tests
  - run Cucumber API suite
  - run a small Cucumber UI smoke suite

## Implementation Structure (recommended)
- `apps/backend`
  - `src/routes/*` (HTTP)
  - `src/services/*` (business rules)
  - `src/repositories/*` (JSON persistence)
  - `src/email/*` (digest/outbox)
  - `data/*.json`
- `apps/frontend`
  - `src/pages/*` or router-based views
  - `src/api/*` (typed client)
  - `src/components/*`

## Project Conventions
- RFC 2119 keywords in specs: MUST / MUST NOT / SHOULD / MAY
- Scenarios written as WHEN/THEN/AND (mirrored in Gherkin)
- Invariants ID format: `INV-<DOM>-<NN>`
  - Suggested domains: `ARC`, `COD`, `CFG`, `DAT`, `EML`, `TST`

## Verification Checklist (per milestone)
- `typecheck` passes (frontend + backend)
- lints pass
- unit tests pass
- cucumber suites pass
- build artifacts generate successfully
