---
name: get-cloudflare-jobs
description: Use when the user asks to fetch Cloudflare jobs from the running local app at http://localhost:8787, or to adjust the dashboard jobs rendering contract used by public/app.js and public/index.html.
---

# Get Cloudflare Jobs From Local App

## Purpose

Fetch Cloudflare openings from the running app instance and keep the response format compatible with the dashboard jobs panel.

Primary source for this skill:

- http://localhost:8787/api/cloudflare/open-positions

## Use When

- The user asks to "get Cloudflare jobs" from the app they are currently running.
- The user wants to verify what the UI panel will render right now.
- The user asks to change jobs filtering or rendering and wants behavior validated against live local output.

## UI Contract To Preserve

The frontend panel in public/index.html and public/app.js expects:

- Jobs are loaded by fetchCloudflareJobs.
- Jobs are rendered by renderCloudflareJobs.
- Metadata line shows filter summary, matches count, and fetched time.
- Dashboard metric metric-jobs shows jobs.length.

Required response keys:

- ok
- fetchedAt
- totalMatching
- jobs

Required job fields used by renderer:

- title
- url
- location
- firstPublished

## Workflow

1. Call the local endpoint:
	- GET http://localhost:8787/api/cloudflare/open-positions
2. Validate response:
	- `ok === true`
	- `jobs` is an array
3. Confirm each rendered job has at least:
	- title string
	- url string
	- location string
	- firstPublished (date string or empty)
4. If changes are requested to backend filters or output shape, keep frontend compatibility with renderCloudflareJobs.

## Error Handling

If local fetch fails, surface:

- endpoint used
- status code or network error
- response body when available

If endpoint is unavailable, tell the user the app is not reachable at http://localhost:8787 and ask whether to use a different base URL.

## Notes

- Prefer local app output over external APIs when fulfilling this skill.
- Do not break the current jobs panel behavior in public/index.html and public/app.js.
- Keep matching logic and output shape synchronized between backend and frontend.
 