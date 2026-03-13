---
name: x-diagnostics
description: Diagnose if the Cloudflare hiring campaign is succeeding or failing on X (Twitter). Analyze metrics, engagement, and provide actionable suggestions.
---

# X Campaign Diagnostics

## Purpose
Evaluate the health of Diogo's Cloudflare hiring campaign on X and provide actionable recommendations.

## Step 1: Gather Current State

1. Fetch current metrics from https://cf-cl-lin-2.diogodebastos18.workers.dev/api/twitter/metrics
2. Fetch historical metrics from https://cf-cl-lin-2.diogodebastos18.workers.dev/api/twitter/metrics-history
3. Go to [x.com/jilvaa198175](https://x.com/jilvaa198175) and observe:
   - Recent post engagement (likes, retweets, replies)
   - Quality of followers (are they Cloudflare employees, tech recruiters, AI/ML community?)
   - Impressions on recent posts

## Step 2: Analyze Metrics Trends

### Health Indicators

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Follower growth/week | > 10 | 3-10 | < 3 |
| Posts/week | >= 5 | 2-4 | < 2 |
| Avg engagement/post | > 5 | 2-5 | < 2 |
| Cloudflare employee followers | Any | 0 | 0 for 2+ weeks |

### Red Flags (Mission Failing)
- Follower count stagnant or declining for 7+ days
- Zero engagement on posts about Cloudflare/AI
- No Cloudflare employees in followers or interactions
- Posts not reaching beyond existing follower base

### Green Flags (Mission Succeeding)
- Steady follower growth week-over-week
- Cloudflare employees engaging with content
- Posts getting impressions beyond follower count
- Replies from people in hiring/recruiting
- Direct messages about opportunities

## Step 3: Diagnose Issues

### Issue: Low Follower Growth
**Likely causes:**
- Not posting consistently
- Content not discoverable (missing hashtags)
- Not engaging with target audience

**Suggestions:**
1. Increase posting frequency to 1-2x daily
2. Use hashtags: #Cloudflare #CloudflareWorkers #AI #MachineLearning #Hiring
3. Reply to Cloudflare official accounts and employees daily
4. Engage with posts from @CloudflareDev, @eastdakota, @xxdesmus

### Issue: Low Engagement
**Likely causes:**
- Content not resonating
- Posting at wrong times
- Not prompting interaction

**Suggestions:**
1. Post during peak hours (9-11 AM, 1-3 PM PT - US tech hours)
2. Ask questions in posts to encourage replies
3. Share technical insights, not just job-seeking content
4. Include visuals (dashboard screenshots, architecture diagrams)

### Issue: Wrong Audience
**Likely causes:**
- Following random accounts
- Content too generic

**Suggestions:**
1. Follow Cloudflare employees specifically (search "works at Cloudflare")
2. Follow AI/ML engineers in Lisbon tech community
3. Create content about Cloudflare Workers, D1, AI Gateway
4. Comment on Cloudflare blog posts and product announcements

### Issue: No Cloudflare Visibility
**Likely causes:**
- Not tagging Cloudflare in posts
- Not engaging with their content

**Suggestions:**
1. Quote-tweet Cloudflare announcements with thoughtful commentary
2. Tag @Cloudflare in relevant technical posts
3. Follow and engage with Cloudflare recruiters
4. Share your dashboard project publicly and tag them

## Step 4: Generate Report

Output a diagnostic report in this format:

```markdown
# Campaign Diagnostic Report - [DATE]

## Current Metrics
- Followers: [X] (change: [+/-Y] since last week)
- Following: [X]
- Posts: [X] (this week: [Y])

## Health Assessment
**Overall Status:** [HEALTHY / WARNING / CRITICAL]

### What's Working
- [List positive indicators]

### What's Failing
- [List problems identified]

## Priority Actions (Next 7 Days)
1. [Most important action]
2. [Second action]
3. [Third action]

## Target Milestones
- [ ] Reach [X] followers by [DATE]
- [ ] Get first Cloudflare employee follow
- [ ] Receive engagement from Cloudflare account
```

## Suggested Posting Schedule

| Day | Content Type | Goal |
|-----|--------------|------|
| Mon | Technical insight about CF Workers | Show expertise |
| Tue | Dashboard update screenshot | Show commitment |
| Wed | Engage/reply day (no new post) | Build relationships |
| Thu | AI/ML content related to Cloudflare | Target relevance |
| Fri | Personal story + call to action | Humanize campaign |
| Sat | Cloudflare news commentary | Stay relevant |
| Sun | Week recap + next week goals | Show progress |

## Key Cloudflare Accounts to Monitor
- @Cloudflare - Official company
- @CloudflareDev - Developer relations
- @eastdakota - Matthew Prince (CEO)
- @xxdesmus - Justin Paine (Security)
- @kentonvarda - Kenton Varda (Workers creator)
- Search: "cloudflare recruiter" for talent team
