# Copilot Instructions

## Mission

**Take control of this LinkedIn account until Cloudflare hires Diogo de Bastos.**

This repo is a personal campaign tool. Every feature exists to serve that goal: monitoring LinkedIn activity, composing and posting content, tracking metrics, fetching Cloudflare job openings, and keeping the CV sharp. When suggesting changes or new features, always ask: *does this help get Diogo hired at Cloudflare?*

## Dev Commands

```bash
npm install       # install dependencies
npm run dev       # start with --watch (auto-restart on file changes)
npm start         # start without watch
```

App runs on `http://localhost:8787` (configurable via `PORT` env var). No test or lint scripts exist.

## Architecture

Single-file Express backend (`server.js`) serving a vanilla JS frontend (`public/`).

**Request flow:**
1. User visits `/` → served `public/index.html` + `public/app.js`
2. OAuth starts at `/auth/linkedin` → LinkedIn callback at `/auth/linkedin/callback`
3. After OAuth, the callback page injects fetched data into browser `localStorage` and redirects back to the dashboard
4. The frontend reads `localStorage` to render the payload; no API session persists client-side

**Auth state is in-memory only** — `currentLinkedInAuth` and the `sessions` Map are both module-level variables in `server.js`. They are lost on restart. Single-user design: re-authenticating overwrites the previous session.

**LinkedIn metrics** are persisted in SQLite at `data/linkedin-metrics.db`. The DB is initialized lazily on first use via `initializeLinkedInMetricsDb()`, which also seeds default rows if the table is empty.

**CV** is a Markdown file at `data/linkedin_data/cv.md` that supports `{% include filename.md %}` directives (resolved server-side by `resolveMarkdownIncludes()`). The other `.md` files in that directory are included fragments. PDF export is rendered from these tokens using PDFKit — no HTML intermediate.

**Cloudflare jobs** are fetched live from the Greenhouse API and filtered to Lisbon + AI/Data title keywords. The department tree is flattened recursively by `flattenDepartments()`.

## Key Conventions

**SQLite helpers** — `server.js` defines three promise wrappers (`dbRun`, `dbGet`, `dbAll`) around the callback-based `sqlite3` API. Always use these instead of raw `db.run`/`db.get`/`db.all`.

**Error normalization** — `safeError(error)` extracts the relevant fields from an axios error (status, statusText, data) and truncates large response bodies at 1200 chars. Use it whenever catching axios errors.

**Input validation** — `parseMetricsPayload()` validates and coerces metrics POST bodies. Return `{ ok: false, error: "..." }` for validation errors, `{ ok: true, value: {...} }` for success — this pattern is used throughout both server responses and internal helpers.

**Image proxy** — `/api/linkedin/photo` proxies profile images and enforces `isAllowedImageHost()`, which only permits `*.licdn.com` and `*.linkedin.com`. Do not relax this allowlist.

**LinkedIn posting** — requires `w_member_social` scope and uses the UGC Posts API (`/v2/ugcPosts`) with header `X-Restli-Protocol-Version: 2.0.0`. The actor URN comes from `currentLinkedInAuth.actor.urn`.

**PDF rendering** — emoji must be stripped before writing to PDFKit (built-in fonts can't render them). `sanitizePdfText()` handles this. Inline link segments are tracked via `extractInlineSegments()` / `writeSegments()` which handle `continued: true` chaining in PDFKit.

## Environment Variables

See `.env.example` for the full list. Required at runtime:

| Variable | Purpose |
|---|---|
| `LINKEDIN_CLIENT_ID` | OAuth app client ID |
| `LINKEDIN_CLIENT_SECRET` | OAuth app client secret |
| `LINKEDIN_REDIRECT_URI` | Must match LinkedIn app settings (default: `http://localhost:8787/auth/linkedin/callback`) |
| `LINKEDIN_SCOPES` | Space-separated; recommended: `openid profile email w_member_social` |
| `LINKEDIN_PUBLIC_URL` | Optional public profile URL for metadata fallback |

## API Routes

| Method | Path | Purpose |
|---|---|---|
| GET | `/auth/linkedin` | Initiates OAuth PKCE flow |
| GET | `/auth/linkedin/callback` | Exchanges code, fetches profile, returns HTML that sets localStorage |
| GET | `/api/linkedin/metrics` | Latest metrics row from SQLite |
| GET | `/api/linkedin/metrics-history` | All rows ordered by date ASC |
| POST | `/api/linkedin/metrics-history` | Upsert a metrics row (`{ date, profileViews, connections, posts, messagesSent }`) |
| GET | `/api/linkedin/photo` | Proxies LinkedIn CDN images (allowlisted hosts only) |
| POST | `/api/linkedin/post` | Publishes a UGC post (requires active auth + `w_member_social`) |
| GET | `/api/linkedin/preview` | Public profile metadata scrape (no auth required) |
| GET | `/api/cloudflare/open-positions` | Cloudflare Lisbon AI/Data jobs from Greenhouse |
| GET | `/api/cv` | Compiled CV markdown (includes resolved) |
| GET | `/api/cv/pdf` | CV as a PDF download |
| GET | `/health` | `{ ok: true }` |

## SQLite Schema

```sql
CREATE TABLE linkedin_metrics (
  date          TEXT PRIMARY KEY,  -- YYYY-MM-DD
  profile_views INTEGER NOT NULL,
  connections   INTEGER NOT NULL,
  posts         INTEGER NOT NULL,
  messages_sent INTEGER NOT NULL
);
```

Inspect the DB directly:
```bash
sqlite3 data/linkedin-metrics.db < sql/print_db.sql
```
