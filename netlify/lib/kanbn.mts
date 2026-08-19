const defaultKanbnApiBaseUrl = 'https://kanbn.charanpreet.me/api/v1'

export type IntakeSource = 'homepage' | 'card'
export type IntakeKind = 'standard' | 'get-it-done'

interface KanbnCard {
  publicId: string
}

interface KanbnWebhook {
  publicId: string
  name: string
  url: string
}

interface KanbnApiConfig {
  apiBaseUrl: string
  apiToken: string
}

interface KanbnConfig extends KanbnApiConfig {
  incomingListId: string
  getItDoneLabelId?: string
}

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export function methodNotAllowed(allowed: string) {
  return new Response(null, { status: 405, headers: { Allow: allowed } })
}

export function getKanbnApiConfig(): KanbnApiConfig | null {
  const apiToken = process.env.KANBN_API_TOKEN

  if (!apiToken) return null

  return {
    apiBaseUrl: (process.env.KANBN_API_BASE_URL ?? defaultKanbnApiBaseUrl).replace(/\/$/, ''),
    apiToken,
  }
}

export function getKanbnConfig(): KanbnConfig | null {
  const apiConfig = getKanbnApiConfig()
  const incomingListId = process.env.KANBN_ROCKETSINGH_INCOMING_LIST_ID

  if (!apiConfig || !incomingListId) return null

  return {
    ...apiConfig,
    incomingListId,
    getItDoneLabelId: process.env.KANBN_GET_IT_DONE_LABEL_ID,
  }
}

export async function createIntakeTicket(input: {
  objective: string
  source: IntakeSource
  email: string
  kind: IntakeKind
}): Promise<KanbnCard> {
  const config = getKanbnConfig()

  if (!config) {
    throw new KanbnConfigurationError()
  }

  if (input.kind === 'get-it-done' && !config.getItDoneLabelId) {
    throw new KanbnConfigurationError()
  }

  const title = input.kind === 'get-it-done'
    ? `Get it done — ${input.objective.slice(0, 120)}`
    : `New ${input.source === 'card' ? 'card' : 'site'} intake — ${input.objective.slice(0, 120)}`
  const description = [
    '<p><strong>Source:</strong> rocketsingh.dev ' + input.source + ' intake</p>',
    `<p><strong>Question:</strong><br>${escapeHtml(input.objective).replace(/\n/g, '<br>')}</p>`,
    `<p><strong>Reply email:</strong> <a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></p>`,
    input.kind === 'get-it-done'
      ? '<p><strong>Get it done:</strong> Customer self-confirmed a Buy Me a Chai payment.</p>'
      : '',
  ].join('')

  const response = await kanbnRequest(config, '/cards', {
    method: 'POST',
    body: JSON.stringify({
      title,
      description,
      listPublicId: config.incomingListId,
      labelPublicIds: input.kind === 'get-it-done' ? [config.getItDoneLabelId!] : [],
      memberPublicIds: [],
      position: 'end',
    }),
  })

  if (!response.ok) {
    throw new KanbnRequestError(response.status)
  }

  const payload: unknown = await response.json()
  if (!isKanbnCard(payload)) {
    throw new KanbnRequestError(502)
  }

  return payload
}

export async function listWebhooks(workspaceId: string): Promise<KanbnWebhook[]> {
  const config = getKanbnApiConfig()
  if (!config) throw new KanbnConfigurationError()

  const response = await kanbnRequest(config, `/workspaces/${encodeURIComponent(workspaceId)}/webhooks`)
  if (!response.ok) throw new KanbnRequestError(response.status)

  const payload: unknown = await response.json()
  return Array.isArray(payload) ? payload.filter(isKanbnWebhook) : []
}

export async function createWebhook(input: {
  workspaceId: string
  name: string
  url: string
  secret: string
}) {
  const config = getKanbnApiConfig()
  if (!config) throw new KanbnConfigurationError()

  const response = await kanbnRequest(config, `/workspaces/${encodeURIComponent(input.workspaceId)}/webhooks`, {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      url: input.url,
      secret: input.secret,
      events: ['card.created', 'card.updated', 'card.moved', 'card.deleted'],
    }),
  })

  if (!response.ok) throw new KanbnRequestError(response.status)
}

export class KanbnConfigurationError extends Error {}

export class KanbnRequestError extends Error {
  constructor(readonly status: number) {
    super(`Kanbn request failed with ${status}`)
  }
}

async function kanbnRequest(config: KanbnApiConfig, path: string, init?: RequestInit) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)

  try {
    return await fetch(`${config.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

function isKanbnCard(value: unknown): value is KanbnCard {
  return typeof value === 'object' && value !== null && 'publicId' in value && typeof value.publicId === 'string'
}

function isKanbnWebhook(value: unknown): value is KanbnWebhook {
  return (
    typeof value === 'object' &&
    value !== null &&
    'publicId' in value &&
    typeof value.publicId === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'url' in value &&
    typeof value.url === 'string'
  )
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })
}
