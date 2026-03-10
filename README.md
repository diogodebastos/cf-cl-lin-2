# LinkedIn Mission Console

A local app that authenticates with LinkedIn, fetches all profile data your current app scopes allow, and displays the payload in a dashboard.

## What It Fetches

- `v2/userinfo`: OpenID profile fields (available with `openid profile` scopes).
- `v2/me`: Legacy profile endpoint (may fail depending on app product and scopes).
- `v2/emailAddress`: Primary email (requires proper permission).
- Decoded `id_token` claims when returned by LinkedIn OAuth.
- Public profile page metadata from `LINKEDIN_PUBLIC_URL` as a fallback preview.

If LinkedIn denies an endpoint, the UI still shows the error response so you can see exactly what permission is missing.
The app also includes `diagnostics.hints` with recommended scope/permission fixes.

## Recommended Scope

Use this in `.env` for richer OpenID claims:

```bash
LINKEDIN_SCOPES=openid profile email w_member_social
```

## Requirements

- Node.js 18+
- Your `.env` file configured (already present in this workspace)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:8787`.

## Flow

1. Click `Authorize and Fetch Full Data`.
2. Complete LinkedIn OAuth.
3. The callback stores fetched data in browser `localStorage` and returns you to the dashboard.
4. Dashboard renders the full JSON payload.

## Notes

- LinkedIn APIs are heavily scope-gated. "All info" means all information accessible to your app's approved products and permissions.
- Some endpoints can only be used after LinkedIn partner approval.

## Deploy To Cloudflare (Worker + D1)

This repository now includes a Worker entrypoint at `src/worker.js` with D1-backed metrics endpoints:

- `GET /health`
- `GET /api/linkedin/metrics`
- `GET /api/linkedin/metrics-history`
- `POST /api/linkedin/metrics-history`
- `GET /api/cv`
- `GET /api/cloudflare/open-positions`
- `GET /api/linkedin/preview`
- `GET /api/linkedin/photo`
- `GET /api/linkedin/post-capability`
- `GET /auth/linkedin`
- `GET /auth/linkedin/callback`
- `POST /api/linkedin/post`

The Worker serves dashboard static files from `public/` through the `ASSETS` binding.

### 1. Install and authenticate

```bash
npm install
npx wrangler login
```

### 2. Create the D1 database

```bash
npx wrangler d1 create linkedin_metrics
```

Copy the generated `database_id` into `wrangler.toml`.

### 3. Run the schema migration (remote)

```bash
npm run d1:migrate
```

This migration now also creates OAuth/auth tables used by the Worker:

- `oauth_states`
- `linkedin_auth`

### 3.1 Configure Worker vars and secrets

Set non-secret vars in `wrangler.toml`:

```toml
[vars]
LINKEDIN_REDIRECT_URI = "https://YOUR_DOMAIN/auth/linkedin/callback"
LINKEDIN_SCOPES = "openid profile email w_member_social"
LINKEDIN_PUBLIC_URL = "https://www.linkedin.com/in/your-profile"
```

Set secrets:

```bash
npx wrangler secret put LINKEDIN_CLIENT_ID
npx wrangler secret put LINKEDIN_CLIENT_SECRET
```

### 4. Run locally with Worker runtime

```bash
npm run dev:worker
```

### 5. Deploy

```bash
npm run deploy:worker
```

After deploy, configure LinkedIn OAuth callback URL to your production domain:

```text
https://YOUR_DOMAIN/auth/linkedin/callback
```

## OAuth + Posting Status

Worker mode now supports OAuth and posting with D1-backed auth persistence:

- `GET /auth/linkedin` starts OAuth
- `GET /auth/linkedin/callback` exchanges code, stores auth in D1, and updates dashboard localStorage
- `GET /api/linkedin/post-capability` reports authenticated state from D1
- `POST /api/linkedin/post` publishes LinkedIn UGC posts

Current limitation:

- `/api/cv/pdf` is not migrated to Worker yet.

## Query And Change The Live Database

Use Wrangler against remote D1:

```bash
# Read latest rows
npx wrangler d1 execute linkedin_metrics --remote --command "SELECT * FROM linkedin_metrics ORDER BY date DESC LIMIT 10;"

# Insert a row
npx wrangler d1 execute linkedin_metrics --remote --command "INSERT INTO linkedin_metrics (date, profile_views, connections, posts, messages_sent) VALUES ('2026-03-10', 213, 409, 23, 34);"

# Update a row
npx wrangler d1 execute linkedin_metrics --remote --command "UPDATE linkedin_metrics SET posts = posts + 1 WHERE date = '2026-03-10';"
```

You can also run SQL in the Cloudflare Dashboard under Workers & Pages -> D1 -> your database.
