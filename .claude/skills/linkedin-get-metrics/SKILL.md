---
name: linkedin-get-metrics
description: "Use when the user asks to fetch LinkedIn metrics in this repo, update /api/linkedin/metrics logic, or add the new LinkedIn metrics to the dashboard. Metrics include profile views, number of connections, number of posts, and messages sent. The new metrics are fetched from www.linkedin.com and should be added to the dashboard metrics panel and /api/linkedin/metrics response."
---

# Get LinkedIn Metrics From LinkedIn

## Purpose
Get:
- profile views, https://www.linkedin.com/dashboard/
- number of connections, https://www.linkedin.com/mynetwork/grow/
- number of posts (Nothing to see is 0 posts) /recent-activity/all/

## Output Format
```json
{
  "ok": true,
  "metrics": {
    "profileViews": 123,
    "connections": 456,
    "posts": 7,
  }
}
``` 

1. The dashboard metrics panel: https://cf-cl-lin-2.diogodebastos18.workers.dev/
2. endpoint: The `/api/linkedin/metrics