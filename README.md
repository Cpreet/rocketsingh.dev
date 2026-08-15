# rckt.dev

A friendly resolution desk for everyday problems. The current repository contains the production-oriented design foundation and public intake homepage described in `docs/handoff.md`.

## Run locally

```bash
bun install
bun run dev
```

## Verify

```bash
bun run lint
bun run build
```

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- local shadcn-style primitives with Radix behaviour where needed
- Lucide icons

## Project context

Start with `AGENTS.md`, then read:

- `docs/product.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/implementation-plan.md`
- `docs/decisions/`

The homepage currently acknowledges intake through a prototype service boundary. It does not persist cases or upload files yet; those are deliberately deferred until the backend, privacy, storage, and identity decisions are made.
