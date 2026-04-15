## 1. OpenSpec Baseline (Foundation)

- [ ] 1.1 Confirm open questions (CPF uniqueness, evaluations scope, digest timezone)
- [ ] 1.2 Finalize capability specs under `openspec/changes/2026-04-14-web-scholar-initial/specs/`
- [ ] 1.3 Create initial Gherkin features mirroring scenarios

## 2. Repository Scaffolding

- [ ] 2.1 Create monorepo structure: `apps/backend` and `apps/frontend`
- [ ] 2.2 Add backend skeleton (Node TS REST API)
- [ ] 2.3 Add frontend skeleton (React TS SPA)
- [ ] 2.4 Add shared tooling (formatter/linter/typecheck)

## 3. Acceptance Test Harness

- [ ] 3.1 Add Cucumber runner for API tests
- [ ] 3.2 Add Cucumber runner for UI smoke tests (Playwright)
- [ ] 3.3 Add example step definitions and world/context

## 4. Capability Implementation (outside-in)

- [ ] 4.1 Implement Students (API first) until cucumber scenarios pass
- [ ] 4.2 Implement Students UI page and minimal UI smoke scenario
- [ ] 4.3 Implement Classes + enrollment (API first) until cucumber scenarios pass
- [ ] 4.4 Implement Classes UI pages
- [ ] 4.5 Implement Evaluations (API first) until cucumber scenarios pass
- [ ] 4.6 Implement Evaluations UI
- [ ] 4.7 Implement Digest outbox + daily job until cucumber scenarios pass

## 5. Verification

- [ ] 5.1 Run backend lint + typecheck
- [ ] 5.2 Run backend unit tests
- [ ] 5.3 Run cucumber API suite
- [ ] 5.4 Run frontend lint + typecheck + build
- [ ] 5.5 Run cucumber UI smoke suite
