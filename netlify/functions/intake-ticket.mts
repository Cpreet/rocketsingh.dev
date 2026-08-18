import { createIntakeTicket, json, methodNotAllowed, type IntakeSource } from '../lib/kanbn.mjs'

const maximumObjectiveLength = 500

export default async function intakeTicket(request: Request) {
  if (request.method !== 'POST') return methodNotAllowed('POST')

  const input = await request.json().catch(() => null)
  if (!isIntakeInput(input)) {
    return json({ error: 'Enter a question between 5 and 500 characters.' }, 400)
  }

  const objective = input.objective.trim()
  if (objective.length < 5 || objective.length > maximumObjectiveLength) {
    return json({ error: 'Enter a question between 5 and 500 characters.' }, 400)
  }

  try {
    const ticket = await createIntakeTicket({ objective, source: input.source })
    return json({
      reference: ticket.publicId,
      message: `Your request is on the incoming desk. Reference ${ticket.publicId}.`,
    }, 201)
  } catch {
    // Ticket text is intentionally never logged from this public endpoint.
    return json({ error: 'We could not add that request to the desk. Please try again.' }, 502)
  }
}

function isIntakeInput(value: unknown): value is { objective: string; source: IntakeSource } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'objective' in value &&
    typeof value.objective === 'string' &&
    'source' in value &&
    (value.source === 'homepage' || value.source === 'card')
  )
}

export const config = { path: '/api/intake' }
