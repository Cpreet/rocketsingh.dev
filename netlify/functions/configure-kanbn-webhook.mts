import { createWebhook, json, listWebhooks, methodNotAllowed } from '../lib/kanbn.mjs'

const webhookName = 'rocketsingh intake acceptance'

export default async function configureKanbnWebhook(request: Request) {
  if (request.method !== 'POST') return methodNotAllowed('POST')

  const setupToken = process.env.KANBN_WEBHOOK_SETUP_TOKEN
  const suppliedToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!setupToken || suppliedToken !== setupToken) {
    return json({ error: 'Unauthorized.' }, 401)
  }

  const workspaceId = process.env.KANBN_ROCKETSINGH_WORKSPACE_ID
  const callbackUrl = process.env.KANBN_WEBHOOK_CALLBACK_URL
  const webhookSecret = process.env.KANBN_WEBHOOK_SECRET
  if (!workspaceId || !callbackUrl || !webhookSecret) {
    return json({ error: 'Webhook configuration is incomplete.' }, 500)
  }

  try {
    const webhooks = await listWebhooks(workspaceId)
    if (webhooks.some((webhook) => webhook.url === callbackUrl)) {
      return json({ configured: true, created: false })
    }

    await createWebhook({ workspaceId, name: webhookName, url: callbackUrl, secret: webhookSecret })
    return json({ configured: true, created: true }, 201)
  } catch {
    return json({ error: 'Kanbn webhook setup failed.' }, 502)
  }
}

export const config = { path: '/api/internal/kanbn-webhook/setup' }
