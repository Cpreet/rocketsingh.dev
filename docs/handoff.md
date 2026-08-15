# rckt.dev — Product Planning and Implementation Handoff

You are the lead engineer responsible for planning and implementing **rckt.dev**.

Do not immediately start building features.

First inspect the provided prototype/assets, understand the product model below, propose the architecture, identify unresolved decisions, and create an incremental implementation plan. Once the plan is coherent, begin implementation feature-by-feature.

The resulting application should be production-oriented, extensible, and intentionally simple from the user's perspective.

---

# 1. Product

**rckt.dev** is a general-purpose resolution desk for small everyday problems.

A person should be able to arrive with a vague, practical problem such as:

* "My printer isn't working."
* "What information should I fill in this form?"
* "Am I eligible for this programme?"
* "How do I move my domain?"
* "Can you help me configure my router?"
* "Convert these files for me."
* "Why isn't my Wi-Fi working?"
* "Can someone just do this for me?"

The system should turn that request into a path toward completing the underlying objective.

The product should NOT behave primarily like:

* a chatbot,
* a search engine,
* a developer tools directory,
* an FAQ website,
* or a conventional support portal.

The core model is:

```text
Person has an objective
        ↓
Something blocks them
        ↓
rckt understands the case
        ↓
diagnosis / information / procedure / tool / human help
        ↓
step-by-step resolution
        ↓
objective completed
```

The primary promise is:

> Tell rckt what you're trying to get done.

Internally, think:

> Question → Case → Resolution → Outcome

The user should rarely need to understand the machinery underneath.

---

# 2. Core Product Principle

Optimize for:

# DONE

Do not optimize merely for producing an answer.

A successful interaction should move the person toward completion of the original objective.

For example, instead of answering:

> "Here are common reasons printers stop working."

rckt should eventually provide:

```text
Goal
Get your printer working from this laptop.

What you'll need
- Printer powered on
- Laptop
- Wi-Fi password

Step 1
Check whether the laptop can see the printer.

Expected result
HP LaserJet M234 appears under printers.

If it doesn't
...

Step 2
...

Done when
A test page successfully prints.
```

---

# 3. Use the Existing Prototype

The project includes a supplied visual prototype and asset bundle.

Expected assets include approximately:

```text
rckt-dev-assets/
├── index.html
├── README.txt
└── assets/
    ├── styles.css
    ├── app.js
    └── avatar.png
```

Use this prototype as the starting point for the visual direction.

Do NOT blindly convert the HTML into components.

First identify:

* reusable layout primitives,
* typography,
* palette,
* card treatments,
* paper/scrapbook treatments,
* avatar usage,
* responsive behavior,
* interaction patterns.

Rebuild those intentionally within the application architecture.

---

# 4. Visual Direction

The website should feel like:

> A friendly digital question desk assembled from paper notes, answer cards, instructions and a helpful human presence.

Use the provided avatar prominently.

Visual characteristics:

* light sky-blue backgrounds,
* deep navy typography,
* off-white paper surfaces,
* warm tan accents,
* muted brown secondary accents,
* taped-paper details,
* pinned notes,
* subtle card rotation,
* marker-like underlines,
* ruled-paper details,
* stamps such as `ASK`, `FOLLOW`, `DONE`,
* scrapbook/bulletin-board composition.

The design should feel handcrafted without feeling messy or childish.

Avoid:

* generic SaaS gradient blobs,
* crypto aesthetics,
* excessive glassmorphism,
* heavy 3D illustration,
* generic AI branding,
* neon developer tooling aesthetics,
* excessive animation,
* visual clutter.

The scrapbook treatment is a visual layer.

The underlying interface should still be:

* highly readable,
* accessible,
* fast,
* responsive,
* predictable.

---

# 5. Homepage

The homepage is primarily an intake desk.

Above the fold should contain:

```text
rckt.dev

Got stuck?
Bring it here.

[ What are you trying to get done?                  ]
[                                                   ]
[                                                   ]

+ Screenshot
+ File

                       [ Get me unstuck → ]
```

Example prompts can rotate unobtrusively:

```text
"My printer won't connect to my laptop."

"What am I supposed to fill in this form?"

"Am I eligible for this programme?"

"I need to move my domain without breaking email."

"Can you make this spreadsheet usable?"
```

Do not force the user to classify their request.

The system should classify it later.

---

# 6. Contact Channels

The system will eventually accept conversations originating from:

* Web
* WhatsApp
* Instagram
* Telegram
* Email
* other channels later

These channels are implementation infrastructure.

**Do not advertise "omnichannel support" as a product feature.**

On the website, alternate contact methods can exist quietly beneath the main CTA.

Example:

```text
Prefer another place?

WhatsApp · Telegram · Email
```

The value proposition remains getting the problem resolved.

---

# 7. Canonical Ingestion Architecture

Design the backend so transport-specific payloads do not leak into domain logic.

Conceptually:

```text
WhatsApp ────────┐
Instagram ───────┤
Telegram ────────┤
Email ───────────┤
Web ─────────────┤
                 ▼
           Channel Gateway
                 ↓
         Message Normalizer
                 ↓
          Identity Resolver
                 ↓
             Case
                 ↓
        Resolution Router
```

Define a canonical message structure similar to:

```ts
interface IncomingMessage {
  id: string
  conversationId: string
  participantId: string

  channel:
    | "web"
    | "whatsapp"
    | "instagram"
    | "telegram"
    | "email"

  type:
    | "text"
    | "image"
    | "file"
    | "audio"
    | "video"

  content: MessageContent

  timestamp: string

  replyTo?: string

  channelMetadata?: unknown
}
```

Channel adapters should translate provider-specific events into this representation.

Do not tightly couple application logic to Meta, Telegram, etc.

---

# 8. Core Domain Object: Case

The primary domain entity should be a **Case**.

A question creates or updates a case.

Conceptually:

```ts
Case {
  id

  objective

  status

  customer

  conversations[]

  attachments[]

  classification

  context

  constraints[]

  diagnosis

  recipe

  evidence[]

  humanInterventions[]

  toolExecutions[]

  pricing

  outcome

  createdAt
  updatedAt
}
```

Possible statuses:

```text
NEW

CLARIFYING

DIAGNOSING

RECIPE_READY

IN_PROGRESS

WAITING_FOR_USER

NEEDS_REVIEW

HUMAN_ASSIGNED

RESOLVED

CLOSED
```

Do not over-engineer the initial status machine, but create boundaries that permit extension.

---

# 9. Resolution Types

Internally classify cases into one or more resolution modes.

Initial categories:

```text
EXPLAIN
GUIDE
EVALUATE
DIAGNOSE
EXECUTE
```

Examples:

### EXPLAIN

> What does this field mean?

### GUIDE

> How do I reconnect my printer?

### EVALUATE

> Am I eligible for this programme?

### DIAGNOSE

> Why isn't this working?

### EXECUTE

> Can you just do this for me?

Users must NOT have to select one of these themselves.

---

# 10. Recipes

A **Recipe** is a first-class product entity.

Avoid storing a recipe as merely one Markdown blob.

Design it as structured data.

Conceptually:

```ts
Recipe {
  id
  title
  objective

  prerequisites[]

  steps[]

  caveats[]

  evidence[]

  successCriteria[]

  escalationConditions[]

  version

  sourceCaseIds[]
}
```

A step might contain:

```ts
RecipeStep {
  id

  title
  instruction

  expectedResult

  validation

  alternatives[]

  caveats[]

  failurePaths[]

  nextStep
}
```

This structure should support future interactive execution.

---

# 11. Recipes Are Decision Graphs

Not every procedure is linear.

Support the idea that:

```text
Step
 ↓
Did expected result happen?
 ├── yes → next step
 └── no
      ↓
 diagnostic branch
```

The data model does not need an advanced graph engine on day one.

However, do not design the Recipe model in a way that makes branching impossible later.

---

# 12. Resolution Knowledge

Keep three concepts separate.

## Knowledge

Facts.

Example:

> This printer model supports Wi-Fi Direct.

## Procedures

Reusable instructions.

Example:

> How to reset the printer's wireless configuration.

## Resolutions

What worked in actual previous cases.

Example:

```text
Windows 11
HP M234
Airtel router

Attempt 1:
Restart print spooler ❌

Attempt 2:
Reinstall HP Smart ❌

Attempt 3:
Reset printer networking
Reconnect
Re-add printer

✓ Resolved
```

Long-term, previous successful resolutions should improve future recipes.

Architect storage boundaries so these can evolve independently.

---

# 13. Human Oversight

Human involvement is a central capability.

Possible internal levels:

```text
L0 — known deterministic answer

L1 — generated recipe

L2 — generated recipe with evidence validation

L3 — human reviews answer

L4 — human communicates directly with customer

L5 — human performs the task
```

This does not need to be displayed exactly this way to customers.

The system should be capable of escalating a case while preserving:

* original request,
* conversation history,
* uploaded files,
* recipe attempts,
* diagnostics,
* failures,
* relevant evidence.

A user should never need to explain the entire problem again after escalation.

---

# 14. Confidence and Escalation

Create space for resolution confidence.

Example internal representation:

```ts
confidence: 0.64
```

Potential triggers for human review:

* low model confidence,
* contradictory information,
* unsuccessful recipe execution,
* ambiguous eligibility criteria,
* regulated/high-risk domain,
* user explicitly requests a person,
* potentially destructive technical action,
* insufficient evidence.

Do not present fabricated certainty to the user.

---

# 15. High-Stakes Questions

Questions involving areas such as:

* medical advice,
* legal decisions,
* financial decisions,
* government eligibility,
* immigration,
* regulated applications,

need different treatment.

The application architecture should support:

* stronger source/evidence requirements,
* prominent caveats,
* human review requirements,
* refusal to make determinations when inappropriate,
* differentiation between explaining official criteria and making professional decisions.

Do not build detailed professional-domain workflows yet.

Just ensure the architecture allows policy/risk classification.

---

# 16. Ticketing

Users should be able to escalate unresolved cases into a human ticket.

Do NOT create a disconnected support-ticket database.

A ticket should be associated with the existing Case.

Conceptually:

```ts
HumanTicket {
  id
  caseId

  status

  priority

  assignedTo

  estimatedCost

  quotedPrice

  notes[]

  resolution

  timestamps
}
```

The human desk should see the accumulated context.

---

# 17. Human Dashboard

Create an internal operator interface eventually.

Initial dashboard requirements:

### Inbox

```text
New
Needs review
Waiting
Assigned
Resolved
```

Each case summary should show:

```text
objective

classification

channel

confidence

risk level

last message

time waiting
```

Case detail should expose:

```text
conversation

attachments

classification

generated diagnosis

current recipe

user progress

previous attempts

evidence

internal notes

escalation history
```

Do not prioritize this above the customer intake flow, but include it in the architecture.

---

# 18. Payments

The business model will likely involve small transactional payments.

Potential categories:

```text
Free

Micro-tool fee

Guided resolution fee

Human review fee

Human execution fee

Quoted work
```

Do not hard-code these categories deeply into UI logic.

Create an abstraction around:

```ts
PriceQuote
Payment
CaseCharge
```

The MVP does not necessarily need a completed payment provider integration unless explicitly requested later.

Pricing should be associated with the case/resolution, not a SaaS subscription assumption.

---

# 19. Authentication

Do not force account creation before asking a question.

Ideal initial flow:

```text
Landing page
     ↓
Submit problem
     ↓
Create anonymous case/session
     ↓
Ask clarification if necessary
     ↓
User may identify themselves later
```

Support eventual account linking.

Potential identities:

```text
Person
 ├── Web session
 ├── Email
 ├── WhatsApp
 ├── Instagram
 └── Telegram
```

Do not automatically merge identities based on weak assumptions.

Prefer explicit linking using secure one-time links.

---

# 20. Attachments

The intake interface needs support for:

* screenshots,
* PDFs,
* images,
* spreadsheets,
* documents.

Design an attachment abstraction.

Example:

```ts
Attachment {
  id
  caseId

  filename
  mimeType
  size

  storageKey

  sourceChannel

  processingStatus

  metadata
}
```

Do not make the frontend dependent on any particular storage provider.

---

# 21. Website Sections

Initial public site:

```text
/
├── Hero / intake desk
├── How it works
├── Example question wall
├── Example recipe
├── Human escalation CTA
└── Footer
```

Likely future routes:

```text
/case/:id

/case/:id/recipe

/case/:id/files

/help/:slug

/tools/:slug

/account

/operator
```

Avoid building an enormous navigation hierarchy.

Search/intake should remain the primary entry point.

---

# 22. Hero Interaction

The hero submission should eventually:

1. validate input,
2. create a Case,
3. upload attachments,
4. create the first Conversation Message,
5. classify the objective,
6. decide whether clarification is needed,
7. route the user into the case interface.

For the first implementation, these may be mocked behind a service boundary.

Do not wire fake logic directly into UI components.

---

# 23. Case Interface

Once a user submits a question, avoid presenting a generic chat UI as the entire product.

The case page can combine:

```text
Case objective

Conversation

What rckt understands

Missing information

Current path

Recipe

Progress

Attachments

Need help?
```

Chat may be one component of a case.

It is not the whole product.

---

# 24. UX Principle

Continuously answer three questions for the user:

### What do I need to do?

### What happens next?

### How will I know this is finished?

Avoid dumping large unstructured responses.

Prefer:

* numbered steps,
* checkboxes,
* expected outcomes,
* concise explanations,
* troubleshooting branches,
* progress state.

---

# 25. Accessibility

Meet sensible WCAG expectations.

Ensure:

* semantic HTML,
* keyboard navigation,
* visible focus states,
* accessible forms,
* sufficient contrast,
* meaningful labels,
* reduced-motion support,
* responsive text sizing,
* touch-friendly interactions.

Scrapbook aesthetics must never compromise readability.

---

# 26. Responsive Design

Design mobile-first where appropriate.

The mobile version is particularly important because many users may arrive from messaging platforms.

The intake experience should work extremely well on:

```text
320–480px
```

Do not simply scale down desktop collage layouts.

Recompose them.

Desktop can be more editorial.

Mobile should prioritize:

```text
question
↓
CTA
↓
avatar/context
↓
examples
```

---

# 27. Performance

The homepage should remain lightweight.

Targets:

* minimal JavaScript for public marketing sections,
* optimized avatar/image assets,
* lazy-loading below-the-fold imagery,
* no unnecessary animation libraries,
* avoid giant frontend bundles,
* excellent Core Web Vitals.

Prefer CSS for lightweight decorative effects.

---

# 28. Suggested Technical Direction

Unless the existing repository dictates otherwise, consider:

### Frontend

```text
React
TypeScript
Vite or an appropriate modern React meta-framework
```

If SSR/SEO/public recipe pages become important, evaluate a framework such as Next.js rather than assuming a pure SPA.

### Styling

Prefer:

```text
CSS variables
CSS Modules / Tailwind / structured utility system
```

Choose one approach and document the rationale.

Preserve the distinctive scrapbook system as reusable design primitives.

### Validation

```text
Zod
```

### Forms

```text
React Hook Form
```

if complexity warrants it.

### Backend

Use a typed backend architecture.

Node.js/TypeScript is preferred unless repository constraints suggest otherwise.

### Database

PostgreSQL is a sensible initial choice.

### ORM

Choose between:

```text
Drizzle
Prisma
```

based on project requirements and explain why.

### File storage

Use an S3-compatible abstraction.

### Queues

Do not introduce queue infrastructure unless asynchronous jobs require it.

Keep service boundaries ready for it.

---

# 29. Proposed Service Boundaries

Aim toward conceptual modules like:

```text
IdentityService

CaseService

ConversationService

AttachmentService

ClassificationService

RecipeService

ResolutionService

EvidenceService

HumanReviewService

TicketService

PricingService

ChannelGateway
```

These do not all need to become microservices.

They should initially be domain modules inside one deployable application.

Avoid premature distributed systems.

---

# 30. Channel Adapter Pattern

Create an interface roughly like:

```ts
interface ChannelAdapter {
  normalizeIncoming(payload: unknown): IncomingMessage

  sendMessage(
    destination: ChannelDestination,
    message: OutgoingMessage
  ): Promise<void>
}
```

Implement Web first.

Future adapters might include:

```text
WhatsAppAdapter

TelegramAdapter

InstagramAdapter

EmailAdapter
```

Do not implement all external integrations immediately unless credentials/APIs are available.

Build the contracts and mock adapters first.

---

# 31. Event Model

Consider domain events such as:

```text
CaseCreated

MessageReceived

AttachmentAdded

CaseClassified

ClarificationRequested

RecipeGenerated

RecipeStepCompleted

ResolutionFailed

HumanReviewRequested

TicketAssigned

CaseResolved
```

Do not necessarily introduce an event broker.

An application-level event model can help prevent tight coupling.

---

# 32. Analytics

Instrument meaningful product events.

Examples:

```text
case_started

question_submitted

attachment_uploaded

clarification_answered

recipe_started

recipe_step_completed

recipe_abandoned

human_help_requested

quote_accepted

case_resolved
```

The primary product metric should eventually resemble:

```text
successful resolutions / cases started
```

Useful secondary metrics:

```text
time to resolution

steps to resolution

human escalation rate

recipe reuse rate

cost per resolution

repeated problem frequency
```

Do not optimize around page views alone.

---

# 33. Privacy

Cases may contain sensitive personal information.

Treat:

* uploads,
* conversations,
* form screenshots,
* identity data,

as private by default.

Architecture should include:

* access controls,
* secure upload URLs,
* retention strategy,
* deletion capability,
* auditability around human access.

Do not expose cases through guessable public URLs.

---

# 34. Design System

Extract the prototype into reusable primitives such as:

```text
PaperCard

Tape

PinnedNote

StampLabel

ScribbleUnderline

QuestionInput

RecipeSheet

RecipeStep

StatusStamp

AvatarDesk

NoticeBoard

HumanHelpCard
```

Decorative variation should be intentional.

Avoid random rotations on every render that cause layout shifting.

If rotation variants are required, use deterministic variants.

---

# 35. Animation

Animation should support the metaphor.

Good:

* note settling into place,
* stamp appearing,
* checkbox completing,
* gentle paper movement,
* subtle paper-airplane movement,
* progress transition.

Bad:

* constant bouncing,
* parallax everywhere,
* distracting particles,
* long page transitions.

Respect:

```css
prefers-reduced-motion
```

---

# 36. Testing

At minimum plan for:

### Unit tests

Domain logic:

```text
case state changes
recipe branching
routing
pricing boundaries
channel normalization
```

### Component tests

Important UI:

```text
question intake
attachments
recipe steps
ticket escalation
```

### Integration tests

Critical flow:

```text
submit question
→ create case
→ clarification
→ recipe
→ mark complete
```

### E2E tests

At least one happy path and one escalation path.

---

# 37. Repository Expectations

Before implementing features, create:

```text
/docs
```

with at least:

```text
docs/
├── product.md
├── architecture.md
├── domain-model.md
├── implementation-plan.md
└── decisions/
```

Use lightweight ADRs for meaningful architecture decisions.

---

# 38. Incremental Development

Do not implement everything in one commit.

Use logical vertical slices.

Recommended sequence:

### Phase 0 — Discovery

* inspect prototype
* inspect repository
* document assumptions
* identify risks
* create architecture plan

### Phase 1 — Design Foundation

* tokens
* typography
* layout primitives
* scrapbook components
* responsive shell

### Phase 2 — Public Homepage

* hero
* intake UI
* attachment affordances
* question wall
* recipe preview
* escalation CTA

### Phase 3 — Domain Foundation

* Case
* Conversation
* Attachment
* Recipe
* User/Identity

### Phase 4 — Case Intake

```text
question
→ case
→ conversation
```

### Phase 5 — Case Workspace

* case status
* messages
* context
* clarification questions

### Phase 6 — Recipe Execution

* structured recipe rendering
* step completion
* progress
* branching

### Phase 7 — Human Escalation

* create ticket
* preserve case context
* operator inbox

### Phase 8 — External Channels

* adapter contracts
* Web adapter
* one external channel as proof of architecture

### Phase 9 — Payments

* quote
* charge
* receipt

Do not jump to Phase 8 before the Case model works properly.

---

# 39. Commit Discipline

Use semantic commits.

Examples:

```text
chore: initialize application scaffold

docs: define rckt case domain

feat(ui): add scrapbook design primitives

feat(intake): add homepage question desk

feat(case): persist anonymous cases

feat(recipe): render structured resolution steps

feat(ticket): add human escalation flow

test(case): cover case lifecycle transitions
```

Commits should represent coherent increments.

---

# 40. Questions to Resolve Before Implementation

Before writing significant code, determine or document assumptions for:

1. Is the first release frontend-only or full-stack?
2. Is there an existing deployment target?
3. Which database is preferred?
4. Which file-storage provider is preferred?
5. Which payment provider will eventually be used?
6. Which messaging platform should be integrated first?
7. Is anonymous case creation acceptable?
8. How long should anonymous cases persist?
9. What information can human operators access?
10. Which domains should trigger mandatory human review?
11. Which AI provider/model will initially perform classification and recipe generation?
12. Are generated recipes persisted and versioned?
13. Can recipes become public reusable pages?
14. What should constitute a verified successful resolution?

When decisions are unknown, select a reasonable MVP default and document it rather than blocking all work.

---

# 41. Important Product Constraint

Do not turn the product into:

```text
homepage
→ full-screen chatbot
```

The AI conversation is infrastructure.

The product experience is:

```text
objective

understanding

path

steps

progress

resolution
```

---

# 42. MVP Success Scenario

A useful first vertical slice should demonstrate:

```text
User visits rckt.dev

↓

User enters:
"My printer won't connect to Wi-Fi"

↓

A Case is created

↓

System asks:
"What printer model are you using?"

↓

User replies:
"HP LaserJet M234"

↓

System presents a structured recipe

↓

User checks off steps

↓

A step fails

↓

User selects:
"That didn't happen"

↓

Case records the failure

↓

System offers another branch

OR

"Get a human to look at this"

↓

Human receives the existing case context
```

If this workflow feels excellent, the foundation is correct.

---

# 43. Final Implementation Philosophy

Prefer:

```text
simple interface
+
strong domain model
+
structured resolution data
+
human fallback
```

over:

```text
complex AI interface
+
weak application model
```

The defensible part of rckt.dev should eventually become the accumulated mapping:

```text
problem
+
context
+
attempts
+
procedure
+
outcome
```

That allows future cases to be resolved faster and more reliably.

The system should therefore be designed from the beginning to learn from completed cases without requiring the public product to expose any of that complexity.

---

# Your First Task

Do NOT begin with implementation.

First produce:

1. a concise interpretation of the product;
2. repository/prototype observations;
3. proposed system architecture;
4. proposed domain model;
5. recommended technology stack with rationale;
6. route structure;
7. component/design-system structure;
8. backend module boundaries;
9. database schema draft;
10. MVP scope;
11. phased implementation plan;
12. technical risks and unresolved questions.

Then create the documentation files.

Only after that should implementation begin with the design foundation and homepage intake flow.

---

# 44. Current Implementation Update

**Updated: 2026-08-15**

## Discovery and planning — complete

The requested Phase 0 documentation has been created:

```text
docs/
├── product.md
├── architecture.md
├── domain-model.md
├── implementation-plan.md
└── decisions/
    └── 0001-frontend-first-modular-boundaries.md
```

These documents record the product interpretation, prototype observations, target modular-monolith architecture, initial relational schema, route map, current MVP boundary, phased plan, risks, and unresolved decisions. Root-level `AGENTS.md` and `CLAUDE.md` point future contributors to those decisions.

## Design foundation — complete

The existing Vite + React + TypeScript application now uses:

```text
Tailwind CSS v4
shadcn-style local primitives
Radix Checkbox
Lucide icons
```

Tailwind semantic tokens preserve the supplied sky / navy / paper / tan palette. Local primitives include `Button`, `Textarea`, `Checkbox`, and `Progress`. The scrapbook system uses deterministic tape, pin, ruled-paper, scribble, and notice-board treatments; it does not use runtime-randomized layout or animation.

## Public homepage intake — complete

The public route (`/`) now implements the supplied prototype direction with a responsive, accessible composition:

```text
Hero / question desk
  ├── rotating example prompts (paused while editing and when reduced motion is requested)
  ├── objective validation
  ├── screenshot and file selection affordances
  ├── prototype intake acknowledgement
  └── quiet alternate-contact placeholders

How it works
Example question wall
Interactive structured recipe preview
Human escalation CTA
Footer
```

The mobile composition intentionally prioritizes objective → CTA → avatar/context. The supplied avatar has been optimized into a 32 KB WebP derivative.

## Business card route — feature branch

The `feature/business-card` branch adds a compact `/card` route that introduces the product without turning the experience into a generic contact page or task tracker. Its content follows the product doctrine in `docs/vision.md`:

```text
ASK   — name the finish
MOVE  — take one clear next step
DONE  — verify an observable result
```

The card keeps the established taped-paper composition and palette. Its compact objective widget carries the visitor's text into the homepage intake at `/#ask`, while WhatsApp, Telegram, Instagram, and email starters provide alternate entry points without presenting channels as the product. The route does not persist objectives or pretend to create a Case before the backend boundary exists.

## Current service boundary

Homepage submission is routed through a typed `IntakeService` contract and currently reaches a deliberate prototype adapter only. It does **not** create a persistent Case, upload a file, or contact an external channel. This is intentional until deployment, privacy/retention, storage, authentication, and API decisions are made.

## Verification — complete

The implementation has passed:

```text
bun run build
bun run lint
```

Visual verification was performed with headless Chrome at 1440px desktop, 390px mobile, and the 320px minimum viewport. The desktop intake positioning and the mobile intake-before-avatar ordering were specifically checked.

## Next recommended vertical slice

Implement Phase 3–4 as a typed backend boundary rather than adding more landing-page surface area:

```text
submit objective
→ create anonymous Case + first web Message atomically
→ return a non-guessable case route
→ render objective and a single clarification question
```

Before accepting real uploads, resolve retention/deletion, type and size limits, malware scanning, private storage, and operator-access policy.
