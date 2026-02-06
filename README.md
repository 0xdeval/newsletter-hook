# Newsletter Webhook (Ghost & Beehiiv)

Webhook to add users as members in **Ghost** or **Beehiiv**. Send a user's email, name, and optional labels; the endpoint uses the provider set in `PROVIDER` (Ghost or Beehiiv).

## Requirements

1. Bun 1.2.17+
2. Vercel 43.3.0+

## Configuration

Set `PROVIDER` to either `ghost` or `beehiiv`, then configure the matching provider.

### Ghost

- `PROVIDER=ghost`
- `GHOST_ADMIN_API_URL` – Ghost admin API URL (e.g. `https://your-site.ghost.io`)
- `ADMIN_API_KEY` – Ghost Admin API key in `keyId:secret` format

### Beehiiv

- `PROVIDER=beehiiv`
- `BEEHIIV_PUB_ID` – Beehiiv publication ID
- `BEEHIIV_API_KEY` – Beehiiv API key (Bearer token)

## Run WebHook

1. Install dependencies

```bash
bun install
```

2. Run the webhook:

```bash
# With Vercel (uses vercel.json routes)
bun run dev
```

Or run the standalone server (POST on `/`):

```bash
bun run start
```

## How to use

The same request body works for both Ghost and Beehiiv.

**Ghost:** `email` and `name` create the member; `labels` are Ghost labels (e.g. for segments).

**Beehiiv:** Subscribes the email to your publication; `name` is stored as the `full_name` custom field, and each `labels` entry is added as a custom field (name and value from the label).

Send a request:

```bash
# Local development (Vercel dev – path includes /api/webhook)
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John",
    "labels": ["newsletter", "premium"]
  }'

# Local development (standalone server – POST to /)
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John",
    "labels": ["newsletter", "premium"]
  }'

# Vercel deployment
curl -X POST https://your-app.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John",
    "labels": ["newsletter", "premium"]
  }'
```

- `email` (required) – Subscriber email.
- `name` (optional) – Display name; for Beehiiv, used as `full_name` custom field.
- `labels` (optional) – Array of strings. If omitted, a default label `webhook-auto-import` is used for Ghost; for Beehiiv they are sent as custom fields.

## Response

Successful response (same for both providers):

```json
{
  "success": true,
  "message": "Member added successfully"
}
```

On error the endpoint returns an appropriate status code (e.g. 400, 405, 500) and a JSON body with `success: false` and an `error` field.
