# Architecture

## Current slice

The current application is a frontend-first React 19 + TypeScript + Vite application. Tailwind CSS v4 provides tokens and utilities, while local shadcn-style primitives provide accessible, composable controls without imposing a generic visual theme.

```text
Homepage and card UI
  -> IntakeService contract
  -> Netlify intake function
  -> Kanbn incoming-list card

Get it done CTA
  -> external Buy Me a Chai page
  -> customer self-confirmation
  -> Netlify intake function
  -> Kanbn incoming-list card with Get it done label

Future API
  -> channel gateway
  -> message normalizer
  -> identity resolver
  -> case service
  -> classification / resolution routing
```

UI components do not know Kanbn payloads or credentials. The browser calls the typed intake service; the Netlify function owns the external API contract and keeps credentials server-side. The Get it done CTA renders a QR code for the public Buy Me a Chai page and records only a customer self-confirmation; it must not be presented as verified payment. A signed Kanbn webhook is acknowledged at a separate function endpoint and intentionally has no persistence or workflow side effects yet.

## Target system shape

Start as a modular monolith with a typed HTTP boundary and PostgreSQL. Keep these application modules separate:

- `IdentityService`: people, sessions, verified channel identities, explicit linking.
- `CaseService`: lifecycle, objective, state transitions, risk and outcome.
- `ConversationService`: canonical incoming/outgoing messages.
- `AttachmentService`: metadata, storage abstraction, processing state.
- `ClassificationService`: resolution mode, confidence, risk policy.
- `RecipeService`: versioned structured recipes and decision branches.
- `EvidenceService`: sources and validation records.
- `ResolutionService`: execution attempts and outcomes.
- `HumanReviewService` / `TicketService`: escalation on the existing Case.
- `PricingService`: quotes and case charges independent of providers.
- `ChannelGateway`: web first, then provider-specific adapters.

These are module boundaries, not independently deployed services.

## Recommended stack

- Frontend: React, TypeScript, Vite for the existing lightweight SPA.
- Styling: Tailwind v4 plus CSS variables for the distinctive design system.
- UI primitives: shadcn component patterns, Radix only when a control needs its behaviour.
- Forms/validation: native React state for the simple homepage; add React Hook Form + Zod when intake becomes multi-step or API-backed.
- API: typed Node.js/TypeScript application.
- Data: PostgreSQL with Drizzle for a small, explicit schema and migration surface.
- Files: presigned uploads behind an S3-compatible `FileStore` interface.
- Async work: database-backed jobs first; introduce queue infrastructure only for demonstrated workloads.
- Testing: Vitest + Testing Library for domain/components and Playwright for the intake happy and escalation paths.

## Routes

```text
/                         public intake and explanation
/case/:caseId             objective, context, current path and conversation
/case/:caseId/recipe      interactive recipe execution
/case/:caseId/files       case attachments
/help/:slug               future evidence-backed reusable guidance
/account                  optional identity/account management
/operator                 protected human desk
```

Case identifiers must be non-guessable, and authorization must never rely on identifier entropy alone.

## Design-system structure

```text
components/ui/            shadcn primitives (Button, Textarea, Checkbox, Progress)
components/scrapbook/     Tape, StampLabel, PaperCard, PinnedNote, ScribbleUnderline
components/home/          IntakeDesk, ProcessSteps, QuestionWall, RecipePreview, HumanHelpCard
services/                 intake and future API boundaries
domain/                   Case, Message, Attachment, Recipe contracts
```

The first homepage keeps small, one-off sections together until reuse is demonstrated. Rotations are fixed variants, never random at render time.

## Operational and security requirements

- private-by-default cases and uploads;
- explicit access control and auditable operator access;
- MIME/type/size validation and malware scanning for uploads;
- evidence and mandatory review rules for high-stakes domains;
- idempotency for channel webhooks and verified payments;
- retention and deletion policies before storing real customer content;
- meaningful product events, avoiding sensitive raw content in analytics.
