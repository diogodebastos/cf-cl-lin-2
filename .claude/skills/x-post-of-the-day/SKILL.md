---
name: x-post-of-the-day
description: Guide for creating and managing X (formerly Twitter) posts of the day. Use this when asked to create or manage X posts of the day.
---

## Step 1 — Reply to a Cloudflare employee post (REQUIRED first)

Before posting anything new, go engage with someone who matters.

1. Navigate to one of these accounts and find their most recent post:
   - **@celso** (VP of Engineering, Cloudflare Lisbon) → https://x.com/celso
   - **@CloudflareDev** (official devrel) → https://x.com/CloudflareDev
   - **@kentonvarda** (Workers creator) → https://x.com/kentonvarda
   - **@eastdakota** (CEO) → https://x.com/eastdakota
2. Read the post carefully. Reply with a **substantive technical comment** — not "great post!" but something that shows expertise:
   - Add a real-world perspective (e.g., "I've been using this in a job-hunt dashboard built on Workers + D1 and...")
   - Ask a smart follow-up question
   - Share a related insight from building on Cloudflare's stack
3. Post the reply. Engagement > broadcasting — this is the #1 growth lever.

## Step 2 — Post the day's main content

Go to https://x.com/jilvaa198175 and check the latest posts to avoid repeating content, then choose a format:

### Format A — Hook thread (best for reach)
Post tweet 1 as a standalone hook, then self-reply to build the thread:
- **Tweet 1**: Lead with the surprising premise → *"I gave Claude full control of my X account [N] days ago to get hired at @Cloudflare. Here's what it figured out that I never would have on my own 🧵"*
- **Tweet 2** (reply): `1/ [Cloudflare tech insight — something you built or learned]`
- **Tweet 3** (reply): `2/ [The strategy — what the AI is doing differently]`
- **Tweet 4** (reply): `3/ [Stats + dashboard link + hashtags]`

### Format B — Daily update (quick, consistent)
Single post, max 280 characters:
```
AI job hunt update 🤖 Day [N]
↑ [X] following, [Y] followers, [Z] posts
→ [N] Cloudflare roles open in Lisbon
@Cloudflare — I'm right here 👋
#CloudflareWorkers #AI
```

### Format C — Technical insight
Share something real about building on Cloudflare's stack:
```
[Concrete fact/insight about Workers/D1/Workflows/KV]
I know this because an AI is running my @Cloudflare job hunt from a Workers app.
Dashboard: cf-cl-lin-2.diogodebastos18.workers.dev
[Question to drive replies]?
```

## Post rules (all formats)
- End with a question to drive replies
- Include 1–2 hashtags: `#AI`, `#Cloudflare`, `#CloudflareWorkers`, `#OpenToWork`
- Tag `@Cloudflare` or a specific employee when relevant
- Do NOT post more than 3 times per day
- Do NOT use generic language — every post must show real expertise or a real update

## Step 3 — Update today's metrics in D1

After posting, fetch current metrics from https://x.com/jilvaa198175 (following, followers, posts count) and save them:

```bash
curl -X POST https://cf-cl-lin-2.diogodebastos18.workers.dev/api/twitter/metrics-history \
  -H "Content-Type: application/json" \
  -d '{"date":"YYYY-MM-DD","following":N,"followers":N,"posts":N}'
```