# Agent instructions

## Product invariant

rckt.dev is a resolution desk, not a generic chatbot. Optimize every feature for a clear objective, next action, expected result, progress, and verifiable completion. Preserve Case context across automation and human escalation.

## Read first

Before changing product behaviour or architecture, read:

- `docs/product.md`
- `docs/architecture.md`
- `docs/domain-model.md`
- `docs/implementation-plan.md`
- relevant ADRs in `docs/decisions/`

The supplied visual reference remains in `docs/rckt-dev-prototype.html` and `docs/rckt-dev-assets/`.

## Engineering conventions

- Use React + TypeScript + Vite, Tailwind CSS, and local shadcn-style primitives.
- Reuse `src/components/ui` for generic controls and create explicit, deterministic scrapbook variants for decorative components.
- Keep provider, persistence, analytics, and upload logic behind typed services. Never wire fake backend state directly into view components.
- Keep recipes structured; do not collapse them into one Markdown string.
- Do not require identity before intake or expose transport classifications to customers.
- Treat case content and uploads as private. Never log raw user content into analytics.
- Prefer semantic HTML, labelled controls, visible focus, touch-sized targets, and mobile-first recomposition.
- Respect `prefers-reduced-motion`; avoid random rotations and layout-shifting decoration.

## Commands

- `bun run dev` — local development
- `bun run build` — TypeScript and production bundle
- `bun run lint` — Oxlint

Run build and lint before handing off implementation changes. Add tests alongside domain logic once the test harness is introduced.
