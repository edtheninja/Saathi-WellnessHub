CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS saathi_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  oauth_provider TEXT,
  oauth_subject TEXT,
  email_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS saathi_users_oauth_identity_idx ON saathi_users(oauth_provider, oauth_subject) WHERE oauth_provider IS NOT NULL AND oauth_subject IS NOT NULL;
ALTER TABLE saathi_users ADD COLUMN IF NOT EXISTS oauth_provider TEXT;
ALTER TABLE saathi_users ADD COLUMN IF NOT EXISTS oauth_subject TEXT;

CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES saathi_users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_rooms (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES saathi_users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('discussion', 'circle', 'support', 'event', 'announcement')),
  topic TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE community_rooms ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES saathi_users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS community_memberships (
  room_id TEXT NOT NULL REFERENCES community_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES community_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  reply_to_id UUID REFERENCES community_messages(id) ON DELETE SET NULL,
  support JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS community_messages_room_idx ON community_messages(room_id, created_at);

CREATE TABLE IF NOT EXISTS community_message_reactions (
  message_id UUID NOT NULL REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  mood TEXT,
  post_type TEXT NOT NULL DEFAULT 'reflection',
  visibility TEXT NOT NULL DEFAULT 'community' CHECK (visibility IN ('community', 'private')),
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS community_posts_feed_idx ON community_posts(visibility, created_at DESC);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anonymous_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  thought TEXT NOT NULL CHECK (char_length(thought) BETWEEN 20 AND 1000),
  photo_data TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'blocked', 'reported')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS anonymous_posts_feed_idx ON anonymous_posts(moderation_status, created_at DESC);

CREATE TABLE IF NOT EXISTS anonymous_post_likes (
  post_id UUID NOT NULL REFERENCES anonymous_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS moods_user_date_idx ON moods(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL CHECK (duration > 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  custom_title TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_settings (
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, setting_key)
);

CREATE TABLE IF NOT EXISTS wellness_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  device_name TEXT NOT NULL,
  connected BOOLEAN NOT NULL DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE wellness_devices ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE wellness_devices ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE wellness_devices ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE health_metrics ADD COLUMN IF NOT EXISTS raw_data JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES saathi_users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO community_rooms (id, name, room_type, topic, description) VALUES
  ('daily', 'Daily Discussion', 'discussion', 'What made you smile today?', 'Share your day and encourage others.'),
  ('meditation', 'Meditation Circle', 'circle', 'How was today''s meditation session?', 'Reflect on your meditation journey.'),
  ('sleep', 'Sleep Circle', 'circle', 'Did you sleep well last night?', 'Discuss healthy sleep habits.'),
  ('anxiety', 'Anxiety Support', 'support', 'You are not alone.', 'A safe place to share and support one another.'),
  ('mindfulness', 'Mindfulness Circle', 'support', 'Living in the present.', 'Daily mindfulness discussions.'),
  ('grief', 'Grief & Loss', 'support', 'Healing together.', 'Support from people who understand.')
ON CONFLICT (id) DO NOTHING;
