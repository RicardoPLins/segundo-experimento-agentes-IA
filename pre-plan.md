# Pre-Plan — Web Scholar (Students, Classes, Evaluations)

## 0) Goal
Build a web system called **Web Scholar** to manage:
- Students (CRUD)
- Classes (CRUD) with enrollments
- Student evaluations per class across metas (Requisitos, testes, backend, frontend, security)
- Email notification digest to students when evaluations change

Frontend MUST be **React + TypeScript**.
Backend MUST be **Node.js + TypeScript**.
Development MUST be **test-driven** with **Cucumber (Gherkin) acceptance tests** as the primary definition of “done”.

## 1) Scope
### In-scope (MUST)
- Student management UI + API (CRUD)
- Classes management UI + API (CRUD)
- Enroll/unenroll students in classes
- Class detail view showing:
  - enrolled students
  - evaluations per student per meta
- Evaluations management page showing a table:
  - first column: student name
  - columns: metas (Requisitos, testes, backend, frontend, security)
  - values: `MANA | MPA | MA`
- Persistence via JSON (students and evaluations at minimum)
- Email digest: when teacher fills/modifies any evaluation meta, student receives at most **one email per day** containing all changes across the student’s classes

### Out-of-scope (initially)
- Authentication/authorization (teacher login)
- Multi-tenant / multiple schools
- Advanced reporting/analytics
- Real-time collaboration
- Migrating to SQL/NoSQL database

## 2) Key Assumptions (explicit)
- System starts as **single-tenant** (one teacher/admin user) unless auth is later added.
- Evaluations are defined as **per (class, student, meta)**.
- “One email per day” means **per student per calendar day** in a single configured timezone.
- JSON persistence runs in a **single backend process** (no multi-instance writes).

## 3) Decisions (resolved before implementation)
1. The evaluations management page operates on a **selected class** (not a cross-class aggregate).
2. `CPF` MUST be unique across students; `email` MUST be unique across students.
3. Deletion policy:
  - Deleting a student with enrollments MUST be rejected (teacher must unenroll first).
  - Deleting a class with enrollments MUST be rejected.
4. Missing evaluations default to `MANA` in table views.

## 4) Open Questions (remaining)
1. What is the email delivery mechanism for dev (SMTP, local mail catcher, or console)?

## 4) Architecture Direction (initial)
A small **monorepo** with two apps:
- `apps/backend`: Node.js + TypeScript REST API
- `apps/frontend`: React + TypeScript SPA

Testing layers:
- **Acceptance (primary):** Cucumber
  - API-level: `@cucumber/cucumber` + `supertest` against backend
  - UI-level: `@cucumber/cucumber` + Playwright
- **Unit tests (supporting):** Vitest/Jest as appropriate

Persistence:
- JSON files under `apps/backend/data/` with atomic writes (`write tmp -> rename`).

Email digest:
- Outbox pattern: evaluation changes append an event to an outbox JSON file.
- A daily job groups changes per student and sends one digest email.
- In CI/tests, the job is triggered via a test-only endpoint or direct service invocation.

## 5) Risks & Mitigations
- **JSON file corruption/concurrency** → atomic writes + single-writer assumption; add file-locking if needed.
- **Flaky UI tests** → keep Cucumber UI suite small; push most rules into API acceptance tests.
- **Ambiguous requirements** → capture as OpenSpec scenarios; resolve open questions before implementing.

## 6) Definition of Done (DoD)
A capability is “done” when:
- It has OpenSpec requirements + scenarios
- It has passing Cucumber acceptance tests (API and/or UI as appropriate)
- It has a minimal UI implementation meeting the scenario
- It persists data in JSON (when applicable)
- It includes a verification checklist in tasks
