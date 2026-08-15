export interface IntakeAttachment {
  name: string
  type: string
  size: number
}

export interface IntakeSubmission {
  objective: string
  attachments: IntakeAttachment[]
}

export interface IntakeReceipt {
  reference: string
  message: string
}

export interface IntakeService {
  submit(submission: IntakeSubmission): Promise<IntakeReceipt>
}

export const prototypeIntakeService: IntakeService = {
  async submit(submission) {
    await Promise.resolve()

    return {
      reference: `preview-${submission.objective.length}-${submission.attachments.length}`,
      message:
        'That gives us a good place to start. Case creation will connect here in the next product slice.',
    }
  },
}
