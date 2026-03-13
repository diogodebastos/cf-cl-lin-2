# X Mission Console

**Take control of this X account until Cloudflare hires Diogo de Bastos.**

This repo is a personal campaign tool. Every feature exists to serve that goal: monitoring X activity, composing and posting content, tracking metrics, interacting with followers, fetching Cloudflare job openings, and keeping the CV sharp. When suggesting changes or new features, always ask: *does this help get Diogo hired at Cloudflare?*

A D1-only Worker app to run your Cloudflare hiring campaign while tracking X (Twitter) presence.

## Current X Account

- https://x.com/jilvaa198175

## Metrics Model

The app tracks:

- `following`
- `followers`
- `posts`

`GET /api/twitter/metrics` returns:

```json
{
	"ok": true,
	"metrics": {
		"following": 441,
		"followers": 563,
		"posts": 99
	}
}
```

## Runtime

This project runs on Cloudflare Worker + D1.

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

Use a D1 database named `twitter_metrics`

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
npm run dev:worker
```

`npm run dev` and `npm start` are aliases for `npm run dev:worker`.

## Deployment

```bash
npm run deploy:worker
```

## Notes

- There is no SQLite runtime path anymore.
- Metrics reads/writes are through D1 only.