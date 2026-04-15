# agent.md — Repository Agent Guide (SDD + OpenSpec)

This document guides coding agents working in this repository.

## Project Overview (CURRENT)
- Project: **coletare-web**
- Type: **Next.js (App Router) web application**
- Language: **TypeScript / React**
- Runtime: **Node.js 18+**
- Package manager: **Yarn**
- Backend today: **Firebase** (Auth + Realtime Database + Storage) + a few Next.js API routes.

### Current “source of truth” (what is implemented)
- Firebase client init: `src/config/firebase.ts`
- Firebase Admin (server): `src/config/firebaseAdmin.ts`
- Auth/session state: `src/store/providers/AuthProvider.tsx`, `src/store/services/auth.ts`, `src/hooks/useAuth.ts`
- Data access (RTDB): `src/store/services/firebase.ts`
- Storage: `src/store/services/storage.ts`
- Next API routes: `src/app/api/*`

## Build & Run
### Commands
- Install: `yarn install`
- Dev: `yarn dev`
- Lint: `yarn lint`
- Build: `yarn build`
- Start (prod locally): `yarn start`

### Environment
`.env.local` is required for Firebase and Google Maps keys (see README).

## Repository Rules
### R1 — Brownfield specification rule (MANDATORY)
Specifications **MUST document current behavior** of the system.
- Specs are not where we describe “the future backend”.
- Future behavior changes MUST go through the OpenSpec workflow (proposal → specs → design → tasks).

### R2 — Avoid lingering compatibility layers
- Prefer **direct modification** of code and updating all call sites.
- Temporary migration abstractions MAY be used only if explicitly justified in the OpenSpec proposal and removed within the same change series.

### R3 — Secrets hygiene
- Secrets MUST NOT be committed.
- `.env.local` MUST remain untracked.

### R4 — Verification required
Any non-trivial change MUST include a verification section in tasks and MUST run at least:
- `yarn lint`
- `yarn build`

## OpenSpec + SDD Workflow (Full mode)
This repo uses **OpenSpec** to manage the change lifecycle.

### Artifact workflow
All changes live under:
- `openspec/changes/<change-id>/`

Each change contains:
- `proposal.md` — why/what/impact
- `specs/` — delta specs describing CURRENT behavior and required behavior changes
- `design.md` — architecture and decisions
- `tasks.md` — ordered checklist; MUST end with a **Verification** group

### Writing rules
- Requirements MUST use **RFC 2119** keywords: MUST, MUST NOT, SHOULD, MAY.
- Scenarios MUST be written in **WHEN/THEN/AND** format.
- Invariants MUST use IDs like: `INV-<DOM>-<NN>`
  - Domains: `BLD` (build), `DEP` (dependencies), `CFG` (configuration), plus optional `ARC`, `COD`, `PRJ`.

### Task rules
- `tasks.md` MUST include a final **Verification** group.
- Where helpful, annotate skill/tool invocations as checkbox items, e.g.:
  - [ ] Run `yarn lint`
  - [ ] Run `yarn build`

## Migration Context (informational)
There is an ongoing modernization initiative (Firebase backend → Spring Boot modular monolith + MongoDB). The documents in `docs/` describe the intended target architecture and testing strategy; they are **planning artifacts**, not “current behavior specs”.
