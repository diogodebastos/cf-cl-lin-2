BEGIN TRANSACTION;

-- Preview current last row (latest date)
SELECT date, profile_views, connections, posts, messages_sent
FROM linkedin_metrics
ORDER BY date DESC
LIMIT 1;

-- Delete current last row (latest date)
DELETE FROM linkedin_metrics
WHERE date = (
  SELECT date
  FROM linkedin_metrics
  ORDER BY date DESC
  LIMIT 1
);

-- Preview new last row after delete
SELECT date, profile_views, connections, posts, messages_sent
FROM linkedin_metrics
ORDER BY date DESC
LIMIT 1;

COMMIT;
