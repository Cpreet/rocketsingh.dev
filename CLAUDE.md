# CLAUDE.md

Follow `AGENTS.md` as the canonical repository guidance.

## Working context

rckt.dev turns an unstructured objective into a Case and then a structured, checkable path to completion. Chat is supporting infrastructure. Do not redesign the experience as a full-screen chatbot, support directory, or category picker.

## Implementation notes

- Read the product and architecture documents before substantial changes.
- Preserve the supplied sky/navy/paper/tan scrapbook direction while prioritizing accessibility and mobile intake.
- Use Tailwind utilities and tokens for layout/visual work. Use the shadcn-style controls under `src/components/ui` rather than ad hoc buttons and form controls.
- Maintain service boundaries around intake, files, persistence, external channels, model calls, payments, and analytics.
- Never imply that prototype submissions, uploads, or alternate contact links are operational unless their backing service exists.
- Validate with `bun run build` and `bun run lint`.

Key documents: `docs/product.md`, `docs/architecture.md`, `docs/domain-model.md`, `docs/implementation-plan.md`, and `docs/decisions/`.
