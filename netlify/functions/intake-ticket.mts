import { createIntakeTicket, json, methodNotAllowed, type IntakeSource } from '../lib/kanbn.mjs'

const maximumObjectiveLength = 500
const maximumEmailLength = 254

export default async function intakeTicket(request: Request) {
  if (request.method !== 'POST') return methodNotAllowed('POST')

  const input = await request.json().catch(() => null)
  if (!isIntakeInput(input)) {
    return json({ error: 'Enter a question between 5 and 500 characters.' }, 400)
  }

  const objective = input.objective.trim()
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const kind = input.kind === 'get-it-done' ? 'get-it-done' : 'standard'
  if (objective.length < 5 || objective.length > maximumObjectiveLength) {
    return json({ error: 'Enter a question between 5 and 500 characters.' }, 400)
  }

  if (!isValidReplyEmail(email)) {
    return json({ error: 'Enter a valid email address so we can reply.' }, 400)
  }

  try {
    const ticket = await createIntakeTicket({ objective, source: input.source, email, kind })
    return json({
      reference: ticket.publicId,
      message: `Your request is on the incoming desk. Reference ${ticket.publicId}.`,
    }, 201)
  } catch {
    // Ticket text is intentionally never logged from this public endpoint.
    return json({ error: 'We could not add that request to the desk. Please try again.' }, 502)
  }
}

function isIntakeInput(value: unknown): value is {
  objective: string
  source: IntakeSource
  email?: unknown
  kind?: unknown
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'objective' in value &&
    typeof value.objective === 'string' &&
    'source' in value &&
    (value.source === 'homepage' || value.source === 'card') &&
    (!('kind' in value) || value.kind === 'standard' || value.kind === 'get-it-done')
  )
}

function isValidReplyEmail(value: string) {
  return value.length <= maximumEmailLength && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export const config = { path: '/api/intake' }
