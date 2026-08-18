# rocketsingh.dev — Vision, Product Doctrine & Guiding Principles

**Status:** Living product doctrine
**Audience:** Engineers, coding agents, designers, product agents, operators
**Purpose:** Define what rocketsingh.dev is, what it is trying to become, and how implementation decisions should be judged.

---

# 1. The Vision

**rocketsingh.dev exists to help people finish the small things they get stuck on.**

People regularly encounter problems that are too small to hire a specialist for, too specific for generic documentation, too contextual for search results, and too annoying to spend hours investigating.

Examples:

* a printer will not connect,
* a form asks for something unclear,
* an application has confusing eligibility requirements,
* a domain needs moving,
* a spreadsheet needs cleaning,
* a device needs configuring,
* a file needs transforming,
* an error message makes no sense,
* a process has ten steps and the user does not know where to begin.

Most existing systems optimize for giving people **information**.

rocketsingh.dev should optimize for getting people to **done**.

The product should feel like a small, approachable question desk on the internet where someone can arrive with:

> "I need to get this done, but I don't know how."

and leave with:

> "It's done."

---

# 2. The Fundamental Unit Is Not a Question

A user may ask a question, but a question is only the surface representation of a larger thing.

The fundamental unit of rocketsingh.dev is an **objective**.

Examples:

```text
Question:
Why won't my printer connect?

Objective:
Print a document from this laptop.
```

```text
Question:
What does box 16 mean?

Objective:
Correctly complete and submit this form.
```

```text
Question:
Am I eligible?

Objective:
Determine whether applying is worthwhile and what must be submitted.
```

Whenever possible, the system should understand and preserve the objective behind the question.

The product model should therefore be:

```text
Objective
   ↓
Blocker
   ↓
Case
   ↓
Resolution path
   ↓
Execution
   ↓
Outcome
```

---

# 3. The Product Is a Resolution Desk

rocketsingh.dev is not primarily:

* a chatbot,
* a search engine,
* a directory of utilities,
* a support ticketing product,
* an AI assistant,
* a developer-tool collection,
* an FAQ system,
* or an agency website.

Those may all exist as implementation components.

The product is a:

# Resolution Desk

A resolution desk accepts an imperfect real-world problem and helps carry it to completion.

The system should be capable of resolving problems through any appropriate combination of:

* explanation,
* research,
* diagnosis,
* structured instructions,
* generated procedures,
* software tools,
* automation,
* human judgment,
* human execution.

The user should not need to decide which mechanism is appropriate.

That routing is rocketsingh's responsibility.

---

# 4. The North-Star Principle

Every product and engineering decision should be tested against:

> **Does this move the user closer to completing their objective?**

If a feature produces more information but does not improve resolution, it is secondary.

If a feature produces fewer words but significantly improves completion, it is valuable.

This is the core distinction:

```text
Search optimizes for finding information.

Chat optimizes for producing an answer.

rocketsingh optimizes for completing an objective.
```

---

# 5. "Done" Must Be Observable

A case should have a meaningful success condition.

Avoid vague completion states such as:

```text
Answer delivered.
```

Prefer:

```text
Printer successfully produced a test page.
```

```text
Application has all required fields completed.
```

```text
DNS propagation verified.
```

```text
File converted and downloaded successfully.
```

```text
User confirmed eligibility criteria are satisfied.
```

Whenever possible, each resolution should define:

* the user's objective,
* expected result,
* success criteria,
* verification method,
* failure conditions.

The system should distinguish:

```text
answered
```

from:

```text
resolved
```

They are not the same thing.

---

# 6. rocketsingh Should Accept Messy Inputs

Users should not be expected to formulate technically correct questions.

Valid inputs include:

> "This thing isn't working."

> "What goes here?"

> "Can I apply?"

> "It was working yesterday."

> "I clicked this and everything disappeared."

> "Can someone just fix this?"

The interface should make people comfortable giving incomplete information.

The system should progressively structure the problem.

The user should not have to learn rocketsingh's internal taxonomy before receiving help.

---

# 7. Ask the Minimum Necessary Questions

Every clarification has a cost.

Do not interrogate the user simply because more context might be useful.

Ask only for information that materially changes the next action.

Bad:

```text
Please provide:
OS version
printer firmware
router model
IP address
network topology
driver version
...
```

before knowing whether any of those matter.

Better:

```text
What printer model is it?
```

Then ask the next question only if required.

rocketsingh should feel like talking to a competent person who knows what to ask next.

---

# 8. Recipes, Not Essays

For procedural problems, the primary output should be a **Recipe**.

A Recipe is an executable human procedure.

It should usually contain:

```text
Objective

What you need

Before you start

Step 1
Expected result

Step 2
Expected result

If this doesn't happen

Caveats

Done when
```

The system should favor a concise, executable path over a comprehensive explanation.

Long explanations can exist behind:

```text
Why?
More detail
Source
```

They should not obstruct action.

---

# 9. Recipes Are Living Procedures

A Recipe is not simply generated prose.

It is structured operational knowledge.

A useful conceptual structure is:

```text
Recipe
├── Objective
├── Prerequisites
├── Steps
│   ├── Instruction
│   ├── Expected result
│   ├── Validation
│   ├── Failure condition
│   └── Next action
├── Caveats
├── Evidence
├── Escalation conditions
└── Success criteria
```

This structure should allow recipes to evolve into:

* interactive guides,
* decision trees,
* checklists,
* automated tools,
* reusable templates,
* executable workflows.

---

# 10. Reality Branches

Real-world procedures frequently fail.

The product must assume that instructions and reality will occasionally diverge.

Therefore:

```text
Instruction
    ↓
Expected result?
   / \
 yes  no
 |     |
next   diagnose
```

A user should be able to say:

> "That didn't happen."

and the system should understand what failed.

Do not respond by restarting the conversation or dumping another generic answer.

The failure itself becomes useful case information.

---

# 11. Preserve Context

Once the user has told rocketsingh something, avoid asking them to repeat it.

A Case should accumulate:

* original objective,
* messages,
* answers to clarifications,
* files,
* screenshots,
* attempts,
* failures,
* generated recipes,
* evidence,
* human comments,
* outcomes.

When responsibility moves from AI to human, context must move with it.

The user should never experience:

> "Please explain the issue again."

simply because the internal resolver changed.

---

# 12. Human Help Is Not Failure

Human intervention is a designed capability.

rocketsingh should not attempt to automate every case.

There will always be situations where:

* evidence is ambiguous,
* physical inspection is needed,
* a policy requires judgment,
* credentials must be handled carefully,
* the problem is unusual,
* automation failed,
* the user simply prefers a person.

The correct product behavior may be:

> "This one needs a human."

That is a successful routing decision.

The user's objective matters more than the system proving it can automate something.

---

# 13. Human Oversight Should Be Progressive

Think of resolution as a spectrum:

```text
Known deterministic procedure
        ↓
Generated procedure
        ↓
Evidence-verified procedure
        ↓
Human-reviewed procedure
        ↓
Human conversation
        ↓
Human execution
```

The system should use the least expensive level capable of producing a reliable outcome.

This creates an important long-term economic principle:

> Automate repetition, not uncertainty.

---

# 14. Solve First, Productize Later

New categories of problems should initially be allowed to enter the human desk.

Do not wait until a perfect automated workflow exists.

A healthy evolution is:

```text
Unknown request
    ↓
Human resolves it
    ↓
Similar requests appear
    ↓
Common procedure identified
    ↓
Reusable recipe created
    ↓
Interactive workflow
    ↓
Automation where justified
```

Every repeated human resolution is potentially a future product feature.

---

# 15. Completed Cases Are Product Knowledge

The most valuable long-term dataset is not simply documentation.

It is:

```text
Problem
+
Context
+
Attempts
+
Procedure
+
Outcome
```

For example:

```text
Problem:
Printer visible but offline

Environment:
Windows 11
HP M234
Airtel router

Attempt:
Restart spooler
Result:
Failed

Attempt:
Reinstall application
Result:
Failed

Attempt:
Reset printer networking and re-add device
Result:
Succeeded
```

This is much more useful than a generic article titled:

> "10 ways to fix an offline printer."

Completed cases should improve future resolutions.

---

# 16. Keep Knowledge Types Separate

Do not collapse everything into one undifferentiated knowledge base.

At minimum distinguish:

## Facts

Things believed to be true.

```text
This printer supports Wi-Fi Direct.
```

## Procedures

Reusable ways to accomplish something.

```text
How to reset its wireless settings.
```

## Resolutions

What actually worked in a particular context.

```text
Reset network configuration → reconnect → re-add device.
```

These have different confidence, provenance, lifecycle, and reuse characteristics.

---

# 17. Evidence Matters

For claims that affect decisions, rocketsingh should know why it believes something.

Where relevant, a resolution should maintain:

* sources,
* documentation,
* user-provided evidence,
* observed results,
* timestamps,
* confidence.

This is particularly important for questions such as:

> "Am I eligible?"

> "Is this form correct?"

> "Can I legally do this?"

> "Is this financial treatment applicable?"

The system should distinguish:

```text
I found the rule.
```

from:

```text
I determined that you meet the rule.
```

Those may require different levels of oversight.

---

# 18. Confidence Is Internal State, Not Marketing

The system may maintain confidence scores internally.

Confidence should influence:

* whether clarification is needed,
* whether sources should be checked,
* whether a human should review,
* whether automation is appropriate.

Do not expose fake precision to the user.

Avoid:

> "We are 83.7% certain."

unless such precision has a meaningful interpretation.

Prefer user-facing language such as:

> "There is one part of this that needs checking."

---

# 19. High-Stakes Domains Need Different Rules

Not all questions should be treated equally.

Areas such as:

* medicine,
* law,
* finance,
* government benefits,
* immigration,
* regulated applications,
* physical safety,

may require:

* stronger evidence,
* narrower claims,
* explicit caveats,
* mandatory human review,
* professional referral,
* refusal to make certain determinations.

Do not apply the same automation threshold to changing a PDF and interpreting a legal right.

Risk classification belongs inside the core resolution system.

---

# 20. Channels Are Plumbing

Users may interact through:

* rocketsingh.dev,
* WhatsApp,
* Telegram,
* Instagram,
* email,
* future channels.

These should not become separate products.

The domain should see:

```text
Person
Conversation
Message
Case
```

not:

```text
WhatsAppCustomer
TelegramCustomer
InstagramCustomer
```

Provider-specific objects should remain at the edge of the architecture.

All channels should normalize into a common conversation model.

---

# 21. Do Not Advertise Infrastructure

The customer should not encounter messaging such as:

> AI-powered omnichannel resolution orchestration.

That describes implementation, not value.

The product language should remain human:

> Tell us what you're trying to get done.

> Here's what to do next.

> That didn't work? Show us what happened.

> This one needs a person.

> Done.

---

# 22. Identity Should Follow the Person

A person may begin on Instagram, continue on WhatsApp, upload a file through the web, and return later through email.

These interactions should eventually be capable of belonging to one Case.

However, identity must not be merged recklessly.

Prefer explicit linking such as:

```text
Continue this case on rocketsingh.dev
```

with a secure token.

Never infer sensitive identity relationships purely for convenience.

---

# 23. The Interface Should Reveal Complexity Gradually

The first screen should be extraordinarily simple.

Ideally:

```text
What are you trying to get done?

[                                      ]
[                                      ]

+ screenshot
+ file

[ Get me unstuck ]
```

Only after submission should complexity emerge when necessary.

Do not front-load:

* categories,
* forms,
* support tiers,
* technical vocabulary,
* pricing grids,
* account creation,
* workflow configuration.

The interface should become complex only when the problem becomes complex.

---

# 24. The Product Should Feel Human

rocketsingh should feel like a competent small desk run by people who enjoy solving things.

It should not feel like interacting with an anonymous enterprise workflow system.

The visual language supports this through:

* paper,
* notes,
* desk metaphors,
* handwritten accents,
* the rocketsingh avatar,
* slightly imperfect layout,
* conversational copy.

But humanity is primarily behavioral.

A human-feeling system:

* remembers what was said,
* asks sensible questions,
* admits uncertainty,
* explains what happens next,
* doesn't make people repeat themselves,
* stays until the job is completed.

---

# 25. Visual Doctrine

The visual concept is:

> **A modern digital help desk assembled like a friendly scrapbook or neighborhood question board.**

Primary cues:

```text
sky blue
deep navy
off-white paper
warm tan
brown
tape
pins
stamps
notes
checklists
paper planes
```

The experience should feel approachable and handmade.

It must not sacrifice:

* readability,
* accessibility,
* responsiveness,
* performance,
* information hierarchy.

Scrapbook is a visual treatment, not permission for chaos.

---

# 26. Avoid Generic SaaS Design

Do not drift toward:

```text
gradient background
+
centered headline
+
three feature cards
+
customer logos
+
pricing table
```

unless those components materially serve the product.

rocketsingh should feel distinct.

Similarly avoid turning it into a generic developer website full of:

```text
terminal windows
code snippets
neon gradients
GitHub logos
API diagrams
```

Most customers may not be developers.

The `.dev` domain does not define the audience.

---

# 27. The Avatar Represents the Desk

The avatar should represent:

* approachability,
* human fallback,
* ownership,
* continuity.

It should not be used as a fake AI mascot constantly interrupting the interface.

Good use:

> "This one needs a human."

> "I've turned this into a 4-step path."

> "Still stuck? Hand it over."

Avoid:

> animated character popping up after every click.

The avatar should make the service feel owned by a person, not gamified.

---

# 28. Tools Are Resolution Components

rocketsingh may contain many useful utilities:

* converters,
* validators,
* compressors,
* analyzers,
* generators,
* checkers.

Do not build them as an unrelated tool directory.

A tool should ideally participate in a resolution.

Example:

```text
User:
"My email isn't reaching customers."

rocketsingh:
Run DNS diagnosis.

Result:
DMARC missing.

Recipe:
Add DMARC record.

Option:
Fix this for me.
```

The tool exists because it helps resolve an objective.

---

# 29. Diagnostics Are Valuable Entry Points

Diagnostic tools are particularly important because they create a bridge between self-service and human help.

Example:

```text
SSL checker
    ↓
Certificate chain invalid
    ↓
Explain
    ↓
Recipe
    ↓
Fix it for me
```

The product should be capable of moving naturally from:

```text
inspect
```

to:

```text
understand
```

to:

```text
resolve
```

---

# 30. Pricing Should Follow Effort and Resolution

The early business model should assume transactional rather than subscription-first behavior.

Users are often paying to eliminate a small piece of friction.

Potential pricing primitives:

```text
free utility
micro-payment
guided resolution
human review
human execution
custom quote
```

Do not artificially force subscriptions where episodic payment better matches the problem.

A useful business metric is:

> **Revenue per successfully resolved case**

rather than merely monthly active users.

---

# 31. Time Has Value

The system should respect that the user's reason for arriving is often:

> "I don't want to waste two hours figuring this out."

Therefore:

* estimate effort where useful,
* avoid unnecessary steps,
* reuse existing case context,
* surface the shortest reliable path,
* allow paying to delegate when appropriate.

Optimization should include user time, not just compute cost.

---

# 32. The Case Is the Durable Product Object

Do not model the product primarily around chats.

Chat is transient interaction.

A Case persists.

Conceptually:

```text
Case
├── Objective
├── Participants
├── Conversation
├── Attachments
├── Classification
├── Constraints
├── Evidence
├── Diagnosis
├── Recipe
├── Attempts
├── Human interventions
├── Cost
└── Outcome
```

Anything that helps resolve the objective belongs to the Case.

---

# 33. State Should Reflect Reality

Case status should represent where the resolution currently stands.

Useful concepts include:

```text
NEW

UNDERSTANDING

WAITING_FOR_USER

READY

IN_PROGRESS

BLOCKED

NEEDS_REVIEW

HUMAN_ASSIGNED

RESOLVED

CLOSED
```

Do not create statuses solely because a UI needs another badge.

State machines should describe meaningful real-world transitions.

---

# 34. Humans Need an Operator View, Not Another Chat App

The internal operator interface should optimize for triage and resolution.

An operator should quickly understand:

```text
What does this person want?

What do we know?

What has already been tried?

What failed?

What is uncertain?

What does the system recommend?

What action should I take?
```

Human time is expensive.

The operator interface should compress context rather than replay every message equally.

---

# 35. The System Should Learn From Human Intervention

Whenever a human changes an AI-generated procedure, capture the difference where appropriate.

Examples:

```text
AI suggested A.

Human changed A → B.

B resolved the case.
```

This should eventually become signal for:

* recipe improvement,
* routing,
* confidence calibration,
* automation opportunities.

Human work should improve the system rather than disappearing into support history.

---

# 36. Do Not Automate Unsafe Actions Just Because They Are Possible

Some operations may be technically automatable but inappropriate to automate without explicit user control.

Examples:

* deleting data,
* changing DNS,
* sending forms,
* financial transactions,
* modifying security settings,
* accessing private accounts.

Use appropriate confirmation boundaries.

A useful rule:

> **The cost of a wrong action determines the amount of friction required before execution.**

---

# 37. Reversibility Is a Product Feature

Whenever practical, procedures should favor reversible operations.

For example:

```text
Export configuration before modifying it.

Create backup before migration.

Preview changes before applying.

Record original DNS entries.

Maintain previous version.
```

Recipes should explicitly mention recovery when the downside of failure is meaningful.

---

# 38. Explain Consequences Before Irreversible Steps

A user should know what an action will do before performing it.

Bad:

> Click Reset.

Better:

> This resets the printer's saved Wi-Fi configuration. You will need the Wi-Fi password to reconnect it.

Instruction quality includes consequence awareness.

---

# 39. Language Should Be Concrete

Prefer:

> Open Settings → Printers.

over:

> Navigate to the device management interface.

Prefer:

> Upload the PDF.

over:

> Provide the relevant documentation artifact.

Avoid unnecessary technical abstraction in user-facing copy.

Internal code can be precise and domain-oriented.

External language should be ordinary.

---

# 40. Do Not Pretend the User Is Technical

Terms such as:

```text
DNS
SPF
driver
firmware
API
JSON
OAuth
```

may be necessary.

When they are, contextualize them.

For example:

> SPF is one of the DNS records mail providers use to check whether your server is allowed to send email for your domain.

Do not require vocabulary comprehension before action.

---

# 41. Do Not Patronize the User

The tone should be:

* calm,
* capable,
* concise,
* respectful,
* practical.

Avoid:

> Don't worry, this is super easy!

when it may not be.

Avoid:

> Obviously...

Avoid unnecessary reassurance.

Simply help.

---

# 42. Give the User Control

At meaningful points, users should be able to choose:

```text
Show me how

Do it with me

Get a human

Do it for me
```

These options represent different desired levels of involvement.

The system should not assume everyone wants maximum automation.

---

# 43. Public Recipes May Become a Distribution Layer

High-quality reusable recipes may eventually become indexed public pages.

Example:

```text
rocketsingh.dev/help/hp-m234-offline-windows-11
```

These pages can serve:

* search discovery,
* self-service resolution,
* product acquisition,
* training data,
* tool entry points.

However, public documentation should be derived from reliable reusable knowledge, not expose private case details.

---

# 44. Privacy Is Part of Trust

Users may upload:

* forms,
* IDs,
* screenshots,
* invoices,
* personal messages,
* private documents.

Treat case content as private by default.

Product and architecture decisions should consider:

* minimum retention,
* access control,
* auditability,
* deletion,
* secure attachment handling,
* human access boundaries.

Do not sacrifice privacy merely to improve model context.

---

# 45. Minimize Permanent Sensitive Data

If information is required only temporarily to perform an action, prefer temporary handling where practical.

Do not retain sensitive material merely because storage is cheap.

Ask:

> Does keeping this information improve future resolution enough to justify retaining it?

If not, discard it appropriately.

---

# 46. Keep the Architecture Boring Where Possible

The product concept is complex enough.

The infrastructure should initially remain simple.

Prefer:

```text
modular monolith
relational database
object storage
well-defined adapters
background jobs only where needed
```

over:

```text
dozens of microservices
distributed event mesh
multiple specialized databases
premature agent infrastructure
```

Complexity should be earned by scale.

---

# 47. Separate Domain From Providers

Core domain code must not depend deeply on:

* WhatsApp,
* Telegram,
* Instagram,
* a particular LLM vendor,
* a particular payment provider,
* a particular storage provider.

Use adapters around volatile external systems.

Providers will change.

The product model should survive those changes.

---

# 48. AI Is an Implementation Capability

Do not construct the domain around a particular model API.

AI may help with:

* classification,
* extraction,
* clarification,
* diagnosis,
* recipe generation,
* evidence synthesis,
* summarization,
* routing.

Those are product capabilities.

The actual model providing them should remain replaceable.

Avoid domain types such as:

```text
OpenAIAnswer
ClaudeRecipe
GeminiClassification
```

Prefer:

```text
ClassificationResult
RecipeDraft
EvidenceAssessment
```

---

# 49. Determinism Beats AI When Appropriate

If a task can be solved reliably by:

* a parser,
* a validator,
* a calculation,
* a deterministic rule,
* an API,
* a script,

use that.

Do not send everything through an LLM merely because one is available.

The hierarchy should roughly be:

```text
deterministic rule
    ↓
tool
    ↓
retrieval
    ↓
model reasoning
    ↓
human judgment
```

Choose the cheapest reliable mechanism.

---

# 50. Every Agent Must Preserve Product Semantics

Coding agents working on this repository must not make local implementation decisions that distort the product model.

For example:

Bad shortcut:

```text
Question = ChatThread
```

because chat happens to be easy to implement.

Correct model:

```text
Question → Case
ChatThread → Conversation attached to Case
```

Bad shortcut:

```text
Recipe = Markdown string
```

if the planned feature requires step state.

Correct:

```text
Recipe → structured data
Renderer → Markdown/HTML/UI
```

Implementation convenience must not erase important domain concepts.

---

# 51. Do Not Build Future Complexity Prematurely

Preserving a concept does not mean fully implementing it today.

For example:

The Recipe model should allow branching.

That does not mean building a general graph execution engine in the MVP.

The architecture should keep the door open without building unused machinery.

Use this rule:

> **Design for the known direction; implement for the current need.**

---

# 52. Product Decisions Should Be Reversible Where Possible

When uncertain, prefer decisions that are easy to change.

Examples:

* adapter interfaces instead of provider calls throughout the code,
* configuration instead of hard-coded pricing,
* structured recipes instead of generated HTML,
* design tokens instead of scattered colors.

Do not spend weeks abstracting hypothetical futures.

Create small seams at likely change boundaries.

---

# 53. Quality Bar for the Main Flow

The main intake and resolution flow must feel excellent before secondary features expand.

The priority sequence is:

```text
Ask
↓
Understand
↓
Clarify
↓
Resolve
↓
Verify
↓
Escalate if needed
```

A beautiful dashboard does not compensate for a poor resolution flow.

---

# 54. MVP Definition

An MVP is not:

> A homepage connected to an LLM.

A meaningful MVP should demonstrate the product loop.

Example:

```text
User:
"My printer won't connect to Wi-Fi."

↓

Case created.

↓

rocketsingh:
"What printer model is it?"

↓

User:
"HP LaserJet M234."

↓

Structured recipe generated.

↓

User completes step 1.

↓

Step 2 fails.

↓

User:
"That didn't happen."

↓

Failure recorded.

↓

Alternative branch offered.

↓

Still unsuccessful.

↓

Human review requested.

↓

Operator sees complete case context.

↓

Problem resolved.

↓

Case marked resolved with recorded outcome.
```

This proves the product architecture.

---

# 55. Long-Term Flywheel

The central product flywheel is:

```text
More cases
    ↓
More resolutions
    ↓
Better procedural knowledge
    ↓
Better routing
    ↓
Better recipes
    ↓
More automation
    ↓
Lower resolution cost
    ↓
Faster successful outcomes
    ↓
More cases
```

The database of successful resolutions becomes one of the project's most important assets.

---

# 56. Long-Term Product Shape

Over time, rocketsingh.dev may contain:

```text
Question Desk

Interactive Recipes

Diagnostic Tools

Utility Tools

Automated Workflows

Human Resolution Desk

Reusable Public Guides

Operator Knowledge System

Resolution Memory
```

These should feel like parts of one system.

Not separate products glued together.

The organizing principle remains:

# Get the objective completed.

---

# 57. What rocketsingh Should Never Become

Avoid drifting into:

## Generic AI assistant

> Ask me anything.

Too broad and insufficiently outcome-oriented.

## Tool graveyard

Hundreds of disconnected utilities created for SEO.

## Support marketplace

A directory where users must choose who can solve their problem.

## Consultancy homepage

The user should not need to schedule a discovery call to solve a printer problem.

## Content farm

Traffic without resolution is not success.

## Automated confidence theater

AI-generated answers presented as certainty without evidence.

---

# 58. Decision Test for Coding Agents

When faced with competing implementation approaches, ask these questions in order:

### 1. Does this help complete the user's objective?

If no, reconsider its priority.

### 2. Does this preserve the Case as the core product object?

If no, reconsider the domain design.

### 3. Does this retain context between automation and humans?

If no, redesign the boundary.

### 4. Can we determine whether the resolution succeeded?

If no, improve outcome modeling.

### 5. Are we adding complexity because the current problem needs it?

If no, simplify.

### 6. Are provider-specific details leaking into core domain code?

If yes, introduce an adapter boundary.

### 7. Could this action cause meaningful harm if wrong?

If yes, add verification, confirmation, evidence, or human review.

### 8. Is the interface asking the user to understand our architecture?

If yes, simplify the interface.

---

# 59. Priority Hierarchy

When tradeoffs occur, favor:

```text
Outcome
>
Reliability
>
Clarity
>
User time
>
Trust
>
Maintainability
>
Automation
>
Novelty
```

Automation is valuable.

Novelty is optional.

A boring solution that gets the user reliably to done is superior to an impressive agent system that frequently gets stuck.

---

# 60. The Internal Mantra

Every coding agent working on rocketsingh.dev should retain these ideas:

> **The user has an objective, not a prompt.**

> **A case is more important than a chat.**

> **A recipe is more useful than an essay.**

> **Failure is a branch, not the end of the conversation.**

> **Human escalation is a feature, not an exception.**

> **Completed cases should make future cases easier.**

> **Do not expose implementation complexity to the user.**

> **Optimize for done.**

---

# 61. Short Version

If an agent can retain only one paragraph, retain this:

**rocketsingh.dev is a human-friendly resolution desk for small real-world problems. A user arrives with an objective they are stuck on. The system should understand the objective, gather only the context it needs, generate or retrieve a structured path to completion, observe whether each step worked, adapt when reality differs, and escalate to a human without losing context when necessary. Every completed case should improve the system's ability to resolve similar cases in the future. The interface should remain radically simple even when the machinery behind it becomes sophisticated. The measure of success is not whether rocketsingh produced an answer; it is whether the user's task got done.**
