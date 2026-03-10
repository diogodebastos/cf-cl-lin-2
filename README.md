# X Mission Console

A D1-only Worker app to run your Cloudflare hiring campaign while tracking X (Twitter) presence.

## Current X Account

- https://x.com/jilvaa198175

## Metrics Model

The app now tracks only:

- `following`
- `followers`

## Runtime

This project now runs only on Cloudflare Worker + D1.

- Local development: `wrangler dev --remote`
- Production: `wrangler deploy`

Both use the same D1 database binding (`twitter_metrics`).

### API Endpoints

- `GET /health`
- `GET /api/twitter/profile`
- `GET /api/twitter/metrics`
- `GET /api/twitter/metrics-history`
- `POST /api/twitter/metrics-history`
- `GET /api/twitter/preview`
- `GET /api/cloudflare/open-positions`
- `GET /api/cv`
- `GET /api/cv/pdf`

## Worker + D1

Worker entrypoint: `src/worker.js`

Static frontend is served via `ASSETS` from `public/`.

### D1 Database

Use a D1 database named `twitter_metrics` and run:

```bash
npm run d1:migrate
```

This creates:

- `twitter_metrics`

If you need a local D1 schema for offline development:

```bash
npm run d1:migrate:local
```

### Required Worker Var

Set in `wrangler.toml`:

```toml
[vars]
TWITTER_PUBLIC_URL = "https://x.com/jilvaa198175"
```

## Development

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run dev:worker
npm run deploy:worker
```

## Notes

- There is no SQLite runtime path anymore.
- Metrics reads/writes are through D1 only.