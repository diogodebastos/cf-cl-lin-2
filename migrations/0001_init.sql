CREATE TABLE IF NOT EXISTS linkedin_metrics (
  date TEXT PRIMARY KEY,
  profile_views INTEGER NOT NULL,
  connections INTEGER NOT NULL,
  posts INTEGER NOT NULL,
  messages_sent INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_states (
  state TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS linkedin_auth (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  access_token TEXT NOT NULL,
  actor_sub TEXT,
  actor_urn TEXT,
  actor_name TEXT,
  authorized_at TEXT NOT NULL
);
