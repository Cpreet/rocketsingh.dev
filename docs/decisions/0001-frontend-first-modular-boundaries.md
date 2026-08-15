# ADR 0001: Frontend-first slice with modular service boundaries

- Status: accepted
- Date: 2026-08-15

## Context

The repository contains only a Vite/React starter and a homepage prototype. Backend hosting, database, storage, identity, AI provider, evidence policy, and retention requirements are unresolved. The requested deliverable is the Tailwind/shadcn implementation of the supplied direction.

## Decision

Implement the design foundation and homepage in the existing Vite application. Keep intake behind a typed client service contract and do not simulate persistence or claim that uploads/cases are operational. Adopt Tailwind v4 and local shadcn-style components. Document a future modular-monolith architecture with PostgreSQL/Drizzle and S3-compatible storage, but defer those dependencies.

## Consequences

- The public experience can be reviewed and iterated immediately.
- UI code will not depend on future provider payloads.
- The submit acknowledgement is explicitly a prototype outcome.
- A real end-to-end Case flow, security review, file processing, and backend tests remain future work.
