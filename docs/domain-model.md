# Domain model

## Core entities

```ts
type CaseStatus =
  | "NEW" | "CLARIFYING" | "DIAGNOSING" | "RECIPE_READY"
  | "IN_PROGRESS" | "WAITING_FOR_USER" | "NEEDS_REVIEW"
  | "HUMAN_ASSIGNED" | "RESOLVED" | "CLOSED"

type ResolutionMode = "EXPLAIN" | "GUIDE" | "EVALUATE" | "DIAGNOSE" | "EXECUTE"
type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "REGULATED"
```

`Case` is the aggregate root. It owns the objective, lifecycle, customer reference, classification, risk, confidence, constraints, current diagnosis, selected recipe version, price state, and outcome. Conversations, attachments, execution attempts, and tickets reference the Case rather than creating disconnected workflows.

`Conversation` groups canonical `Message` records across channels. A message records the channel, content type, participant, timestamp, reply relationship, and isolated channel metadata.

`Attachment` records filename, MIME type, byte size, storage key, source channel, processing state, and extracted metadata. The domain never exposes provider-specific URLs as permanent identifiers.

`Recipe` is structured and versioned. It contains objective, prerequisites, steps, caveats, evidence, success criteria, and escalation conditions. A `RecipeStep` has an expected result, validation, alternatives, failure paths, and an optional next-step reference, allowing a decision graph without requiring a graph engine in the first version.

`ResolutionAttempt` records which recipe/version was used, step results, failures, evidence, and the final outcome. Successful attempts are resolution knowledge and remain distinct from reusable procedures and factual knowledge.

`HumanTicket` belongs to a Case and holds assignment, priority, quote, notes, and resolution. Escalation retains the complete Case context.

## Initial relational schema draft

```text
people(id, created_at, updated_at)
identities(id, person_id?, kind, provider_subject?, verified_at?, created_at)
cases(id, person_id?, objective, status, resolution_mode?, risk_level,
      confidence?, diagnosis?, outcome?, created_at, updated_at)
conversations(id, case_id, created_at)
messages(id, conversation_id, participant_identity_id?, channel, type,
         content_json, reply_to_id?, channel_metadata_json?, occurred_at)
attachments(id, case_id, message_id?, filename, mime_type, byte_size,
            storage_key, source_channel, processing_status, metadata_json, created_at)
recipes(id, stable_key, version, title, objective, status, created_at)
recipe_steps(id, recipe_id, step_key, position, title, instruction,
             expected_result?, validation_json?, next_step_key?)
recipe_step_paths(id, recipe_step_id, condition, target_step_key?, action, content_json?)
recipe_evidence(id, recipe_id, source_uri, title, checked_at?, metadata_json?)
case_recipes(case_id, recipe_id, selected_at, completed_at?)
step_attempts(id, case_id, recipe_step_id, state, result_json?, attempted_at)
human_tickets(id, case_id, status, priority, assigned_to_id?, estimated_cost?,
              quoted_price?, currency?, resolution?, created_at, updated_at)
ticket_notes(id, ticket_id, author_id, body, created_at)
price_quotes(id, case_id, kind, amount, currency, status, expires_at?, created_at)
payments(id, case_id, quote_id?, provider, provider_ref?, amount, currency, status, created_at)
domain_events(id, case_id?, event_type, payload_json, occurred_at, processed_at?)
```

Use UUIDv7/ULID-like identifiers, foreign keys, tenant/user authorization checks, append-only audit records for sensitive operator actions, and unique idempotency keys for external messages.

## Lifecycle rules

- Intake creates one Case and its first Message atomically.
- Classification may add risk and resolution modes; it does not overwrite the user’s objective.
- A recipe is selected by immutable version, so active cases remain reproducible.
- Step failure records an attempt before routing to an alternative or escalation.
- `RESOLVED` requires explicit success criteria or a recorded human resolution; `CLOSED` is administrative.
