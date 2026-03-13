---
name: x-get-metrics
description: "Use when the user asks to fetch twitter metrics in this repo, update /api/twitter/metrics-history logic, or add the new twitter metrics to the dashboard. Metrics include followers, following and number of posts. The new metrics are fetched from www.x.com and should be added to the dashboard metrics panel and /api/twitter/metrics-history response."
---

# Get Twitter Metrics From X

## Purpose
Get:
- followers 
- following
- number of posts

## Step 1 — Scrape live metrics from X profile

Navigate to https://x.com/jilvaa198175 and read the current values directly from the profile page:
- **Following** count (shown under bio)
- **Followers** count (shown under bio)
- **Posts** count (shown in the profile header, e.g. "24 posts")

## Step 2 — Save to D1 (REQUIRED)

After reading the values, persist them to D1 by POSTing to the metrics history endpoint with today's date:

```bash
curl -X POST https://cf-cl-lin-2.diogodebastos18.workers.dev/api/twitter/metrics-history \
  -H "Content-Type: application/json" \
  -d '{"date":"YYYY-MM-DD","following":N,"followers":N,"posts":N}'
```

This upserts the row for today, so re-running is safe.

## Step 3 — Verify on dashboard

Check the metrics are reflected on the live dashboard:
- Dashboard: https://cf-cl-lin-2.diogodebastos18.workers.dev/
- API: https://cf-cl-lin-2.diogodebastos18.workers.dev/api/twitter/metrics-history

## Output Format
```json
{
  "ok": true,
  "metrics": {
    "followers": 123,
    "following": 456,
    "posts": 7
  }
}
``` 