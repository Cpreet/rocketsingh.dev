# Implementation plan

## Repository and prototype observations

- The repository began as the standard Vite React demo with no domain or component structure.
- The supplied prototype establishes a strong palette, paper surfaces, tape, ruled inputs, deterministic card rotation, notice-board notes, avatar placement, lightweight toasts, and interactive recipe progress.
- The original desktop composition overlays the intake and avatar. Mobile must recompose the intake before decorative imagery so the form remains the first useful interaction.
- The supplied avatar is visually prominent but large; ship an optimized derivative before production.
- Netlify hosts the static app and a small serverless intake boundary. The current boundary creates Kanbn tickets from a question and required reply email, and accepts signed Kanbn webhooks; it does not persist Cases or webhook events locally.

## Phases

1. **Discovery and decisions** — product, architecture, domain schema, risks, agent guidance, and the frontend-first ADR.
2. **Design foundation** — Tailwind/shadcn setup, semantic tokens, accessible controls, focus/reduced-motion rules, scrapbook primitives.
3. **Homepage intake** — responsive hero, attachments, mock service boundary, process cards, notes, interactive recipe, escalation CTA and footer.
4. **Domain foundation** — typed Case/Message/Attachment/Recipe modules plus lifecycle unit tests.
5. **Persistent intake** — typed API, anonymous secure session, atomic case/message creation, presigned uploads.
6. **Case workspace** — objective, understood context, clarification, progress and conversation as supporting UI.
7. **Recipe execution** — versioned decision paths, expected-result checks, attempts and success criteria.
8. **Human escalation** — ticket on Case, operator inbox, context-preserving handoff.
9. **External channels and payments** — one adapter proof, then quote/charge boundaries.

## MVP defaults

- The public UI uses a Netlify serverless boundary for Kanbn intake; no Case database, identity, attachment storage, or automated webhook processing exists yet.
- Anonymous intake is allowed. The question and required reply email are sent to the configured private Kanbn Incoming list; files are not sent or persisted in this slice.
- Web is the first channel.
- External contact links are quiet placeholders until destinations exist.
- High-risk classification, retention, operator access, recipe generation provider, and verified-resolution rules remain backend decisions.

## Risks and unresolved decisions

- The avatar copy (“10x Developer of the Year”) is developer-specific while the product is general-purpose; confirm whether a broader illustration should replace it.
- Decide hosting/runtime before choosing the API deployment shape.
- Decide retention/deletion rules before receiving real files or screenshots.
- Define upload limits, accepted types, scanning, and storage provider.
- Define mandatory human-review domains and who may access high-risk cases.
- Select model/provider, evidence policy, prompt/version audit needs, and fallback behaviour.
- Decide what evidence qualifies a Case as resolved and whether customers can reopen it.
- Choose the first external channel only after webhook operations and identity-linking rules exist.
- Confirm whether reusable recipes can ever be public and how they are reviewed/versioned.
- Provide real WhatsApp, Telegram, email, privacy, and terms destinations before launch.

## Verification for the homepage slice

- production build and lint pass;
- keyboard-visible focus and labelled controls;
- intake validation and acknowledgement work without direct transport logic in the component;
- recipe progress reaches an explicit complete state;
- layout is checked at 320px, tablet, and desktop widths;
- reduced-motion preference disables non-essential motion.
