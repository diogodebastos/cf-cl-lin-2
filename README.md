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
