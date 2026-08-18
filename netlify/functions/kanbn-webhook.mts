import { json, methodNotAllowed } from '../lib/kanbn.mjs'

const signatureHeaders = ['x-kan-signature', 'x-webhook-signature', 'x-signature', 'x-hub-signature-256']

export default async function kanbnWebhook(request: Request) {
  if (request.method !== 'POST') return methodNotAllowed('POST')

  const payload = await request.text()
  const secret = process.env.KANBN_WEBHOOK_SECRET

  if (secret && !(await hasValidSignature(request.headers, payload, secret))) {
    return json({ error: 'Invalid webhook signature.' }, 401)
  }

  // The endpoint acknowledges immediately. Processing can be added behind a queue once
  // the Case persistence and lifecycle rules are in place.
  return json({ accepted: true }, 202)
}

async function hasValidSignature(headers: Headers, payload: string, secret: string) {
  const signature = signatureHeaders.map((header) => headers.get(header)).find(Boolean)
  if (!signature) return false

  const expected = await createSignature(payload, secret)
  const supplied = signature.replace(/^sha256=/i, '').toLowerCase()
  return constantTimeEqual(supplied, expected)
}

async function createSignature(payload: string, secret: string) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return Array.from(new Uint8Array(signature), (value) => value.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return difference === 0
}

export const config = { path: '/api/kanbn/webhook' }
