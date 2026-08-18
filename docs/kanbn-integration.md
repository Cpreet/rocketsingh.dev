# Kanbn intake integration

The homepage question textarea and the `/card` question field both send a request to `POST /api/intake` with a required reply email. The Netlify function creates a Kanbn card in the configured **Incoming** list in the rocketsingh workspace and adds the email as a reply link. Files staged in the homepage UI are deliberately not sent; upload handling needs its own private storage and scanning flow.

## Netlify environment variables

Set the following server-only variables in Netlify. Never prefix them with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `KANBN_API_TOKEN` | Kanbn API key with permission to create cards and manage workspace webhooks. |
| `KANBN_ROCKETSINGH_INCOMING_LIST_ID` | Public ID of the list on the rocketsingh workspace's Incoming board. |
| `KANBN_ROCKETSINGH_WORKSPACE_ID` | Public ID of the rocketsingh Kanbn workspace, used only for webhook registration. |
| `KANBN_WEBHOOK_CALLBACK_URL` | Public callback URL, normally `https://rocketsingh.dev/api/kanbn/webhook`. |
| `KANBN_WEBHOOK_SECRET` | A high-entropy secret shared with Kanbn for HMAC verification. |
| `KANBN_WEBHOOK_SETUP_TOKEN` | A separate high-entropy bearer token for the one-time setup endpoint. |
| `KANBN_API_BASE_URL` | Optional; defaults to `https://kanbn.charanpreet.me/api/v1`. |

## Connect the webhook

After the deployment is live and the variables are set, send one authenticated request to the setup endpoint:

```sh
curl -X POST https://rocketsingh.dev/api/internal/kanbn-webhook/setup \
  -H "Authorization: Bearer $KANBN_WEBHOOK_SETUP_TOKEN"
```

It is idempotent: it creates a webhook only if the callback URL is not already present. The webhook subscribes to card creation, updates, moves, and deletion. The receiver verifies the HMAC signature when `KANBN_WEBHOOK_SECRET` is set, does not log or persist the event payload, and responds with `202 Accepted` immediately.

Kanbn API keys, list IDs, workspace IDs, webhook secrets, and requester email addresses must stay out of logs and browser configuration. The email is only sent in the intake request to create the private Kanbn card.
