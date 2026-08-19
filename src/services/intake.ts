export interface IntakeSubmission {
  objective: string
  source: 'homepage' | 'card'
  email: string
  kind?: 'standard' | 'get-it-done'
}

export interface IntakeReceipt {
  reference: string
  message: string
}

export interface IntakeService {
  submit(submission: IntakeSubmission): Promise<IntakeReceipt>
}

export const kanbnIntakeService: IntakeService = {
  async submit(submission) {
    const response = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    })

    const payload: unknown = await response.json().catch(() => null)

    if (!response.ok || !isIntakeReceipt(payload)) {
      throw new Error('We could not add that request to the desk. Please try again.')
    }

    return payload
  },
}

export function isValidReplyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

function isIntakeReceipt(value: unknown): value is IntakeReceipt {
  return (
    typeof value === 'object' &&
    value !== null &&
    'reference' in value &&
    typeof value.reference === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  )
}
