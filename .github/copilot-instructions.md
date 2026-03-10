# Copilot Instructions

## Project Purpose and MISSION

Personal hiring campaign tool to help **Diogo de Bastos** get hired at Cloudflare. Every feature should serve that goal: monitoring X (Twitter) metrics, rendering the CV, fetching Cloudflare job openings, and enabling LinkedIn interactions. When suggesting changes or new features, ask: *does this help get Diogo hired at Cloudflare?*

## Commands

```bash
npm install           # install dependencies
npm run dev           # run worker locally (alias: npm start, npm run dev:worker) — always --remote, uses live D1
npm run deploy:worker # deploy to production
npm run d1:migrate    # create D1 schema on remote
npm run d1:migrate:local # create D1 schema locally
```

There are no tests or lint scripts.

## Architecture

### Runtime: Cloudflare Worker + D1

- **`src/worker.js`** — entire backend: all API routes, business logic, CV content, PDF generation, and Twitter scraping. Single file, no module splitting.
- **`public/`** — static frontend served via the `ASSETS` binding (`index.html`, `app.js`, `styles.css`). Vanilla JS, no framework.
- **`wrangler.toml`** — declares `ASSETS` binding, `DB` (D1), and `TWITTER_PUBLIC_URL` var.
- **`server.js`** — exits immediately with an error. D1-only; Node.js runtime is not supported.

### Routing pattern

All API routes are handled by a single `handleApi(request, env, pathname)` function in `src/worker.js` using a flat `if`-chain of `pathname === "/api/..."` checks. To add a new route, add another `if` block before the catch-all at the bottom:

```js
if (pathname === "/api/your/endpoint" && request.method === "GET") {
  return json({ ok: true, ... });
}
```

Unmatched `/api/*` and `/auth/*` paths return `404`. Everything else falls through to `env.ASSETS.fetch(request)`.

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/twitter/profile` | Scrape public X profile |
| GET | `/api/twitter/metrics` | Latest metrics from D1 |
| GET | `/api/twitter/metrics-history` | All historical rows |
| POST | `/api/twitter/metrics-history` | Upsert a metrics row |
| GET | `/api/twitter/preview` | Preview metrics payload |
| GET | `/api/cv` | CV as markdown (resolved includes) |
| GET | `/api/cv/pdf` | CV as PDF blob |
| GET | `/api/cloudflare/open-positions` | Filtered Cloudflare jobs (Lisbon + ai/data) |

### CV system

CV content lives as inline strings in the `cvFiles` object at the top of `src/worker.js` (not on disk). The entry point is `cvFiles["cv.md"]`, which uses `{% include filename.md %}` directives resolved recursively by `resolveCvIncludes()`. Circular includes throw. Emoji are stripped before PDF rendering via `sanitizePdfText()`.

Source-of-truth CV data for edits is in `data/cv_data/*.md` — but these files are **not** read at runtime. They are the canonical reference used to keep the inline `cvFiles` strings in `src/worker.js` up to date (especially for LinkedIn CV updates via the `linkedin-update-cv` skill).

### D1 schema

```sql
CREATE TABLE twitter_metrics (
  date      TEXT PRIMARY KEY,  -- YYYY-MM-DD
  following INTEGER NOT NULL,
  followers INTEGER NOT NULL
);
```

`initializeTwitterMetricsDb()` seeds the table with `defaultTwitterMetricsRows` if it is empty.

### Cloudflare jobs filtering

Jobs are fetched from the Greenhouse API (`boards-api.greenhouse.io/v1/boards/cloudflare/departments/`), flattened from a department tree, then filtered to Lisbon location AND title matching `/ai|data/i`. The frontend renders them via `renderCloudflareJobs()`. The response shape (`ok`, `fetchedAt`, `totalMatching`, `jobs[]` with `title`, `url`, `location`, `firstPublished`) must be preserved for dashboard compatibility.

## Claude Skills (`.claude/skills/`)

Specialized agent scripts invoked by Claude/Copilot for browser-automation tasks:

| Skill | Trigger | Notes |
|-------|---------|-------|
| `get-cloudflare-jobs` | fetch jobs from live app | Validates against `https://cf-cl-lin-2.diogodebastos18.workers.dev` |
| `cloudflare-apply-job` | apply to a Cloudflare job | Uses pre-filled form data (name, email, city) |
| `linkedin-get-metrics` | fetch LinkedIn metrics | Profile views, connections, posts |
| `linkedin-send-message` | send LinkedIn message | Increments `messagesSent` metric in dashboard |
| `linkedin-send-invitation` | send LinkedIn connection invite | Always discloses AI assistance in message |
| `linkedin-update-cv` | update LinkedIn profile | Uses `data/cv_data/` as source of truth; never fabricate |

## Key Conventions

- **Response helper**: All JSON responses use a local `json(body, status)` helper (defined in `src/worker.js`) that sets `Content-Type: application/json`. Always use it — don't construct `Response` objects manually for API routes.
- **Error shape**: Error responses follow `{ ok: false, error: "...", detail: {...} }`. Success responses start with `{ ok: true, ... }`.
- **No secrets in `wrangler.toml`**: Sensitive values (e.g., `ANTHROPIC_API_KEY`) go in `.env` (gitignored) or Cloudflare secrets, not in `[vars]`.
- **Frontend metrics dashboard**: `public/app.js` uses vanilla JS with `$("element-id")` as a shorthand for `document.getElementById`. Chart.js handles the metrics history charts; call `destroyMetricCharts()` before re-rendering.
- **PDF rendering**: Uses `pdfkit/js/pdfkit.standalone.js` (browser/edge-compatible build). Custom `extractInlineSegments()` walks markdown-it tokens to handle bold/italic inline formatting.
