BEGIN TRANSACTION;

-- Insert a zeroed metrics row for today.
-- If today's row already exists, keep it zeroed.
INSERT INTO linkedin_metrics (date, profile_views, connections, posts, messages_sent)
VALUES (date('now'), 0, 0, 0, 0)
ON CONFLICT(date) DO UPDATE SET
  profile_views = excluded.profile_views,
  connections = excluded.connections,
  posts = excluded.posts,
  messages_sent = excluded.messages_sent;

-- Preview today's row
SELECT date, profile_views, connections, posts, messages_sent
FROM linkedin_metrics
WHERE date = date('now');

COMMIT;
