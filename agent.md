# AGENT.md — Repository Agent Guide (Web Scholar)

This repository is used to build **Web Scholar**, a web system for students/classes/evaluations.

## Project Overview (TARGET)
- Frontend: **React + TypeScript** (SPA)
- Backend: **Node.js + TypeScript** (REST API)
- Persistence: **JSON files** (local, single-process)
- Testing strategy: **TDD driven by Cucumber (Gherkin) acceptance tests**
  - API acceptance: `@cucumber/cucumber` + `supertest`
  - UI acceptance (smoke): Cucumber + Playwright

## Repository Layout (planned)
- `apps/frontend/` — React app
- `apps/backend/` — Node API
- `openspec/` — OpenSpec (proposal → specs → design → tasks)
- `docs/` — planning inputs (requirements)

## Golden Rules
### R1 — Spec-first workflow (MANDATORY)
Changes MUST follow OpenSpec under `openspec/changes/<change-id>/`:
- `proposal.md` (why/what/impact)
- `specs/` (requirements + scenarios)
- `design.md` (architecture + decisions + open questions)
- `tasks.md` (ordered tasks, ending with verification)

### R2 — Acceptance tests define “done”
For every user-visible behavior change, add/adjust **Gherkin scenarios** first.
Implementation is complete only when scenarios pass.

### R3 — Keep business rules out of UI
Rules like evaluation state transitions, digest aggregation, uniqueness constraints, and invariants MUST live in backend services (unit-testable).

### R4 — JSON persistence discipline
- Writes MUST be atomic (write temp → rename).
- Repositories MUST be the only layer that reads/writes JSON files.
- Assume single backend instance unless a lock mechanism is explicitly added.

### R5 — Secrets hygiene
- Secrets MUST NOT be committed.
- Prefer `.env` files ignored by git.

### R6 — Verification required
Non-trivial changes MUST include a **Verification** section in tasks and run at least:
- backend: lint + typecheck + unit tests + cucumber API suite
- frontend: lint + typecheck + build + cucumber UI smoke suite

## Agent “skills” guidance (how to work effectively here)
- Start by updating OpenSpec artifacts and feature files (Gherkin).
- Implement backend behavior first until API scenarios pass.
- Add frontend views/components last, keeping UI scenarios minimal.
- When adding a new entity or invariant:
  - add invariant ID (e.g., `INV-DAT-01`) in spec
  - add failing scenario
  - implement service + repository
  - add unit tests for the service

## Preferred Technical Choices (defaults; can be changed via proposal)
- Backend framework: Fastify (or Express if preferred)
- Validation: Zod
- IDs: UUID
- Unit tests: Vitest
- UI tests: Playwright

## Notes
- `agent-template.md` is a historical/template document from another project. The source of truth for this repository is this file (AGENT.md) plus OpenSpec artifacts under `openspec/`.
