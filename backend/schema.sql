-- =========================================================
-- Saathi Wellness App
-- FINAL DATABASE SCHEMA
-- ONE ML PIPELINE
--
-- Activity
--    ↓
-- activity_history
--    ↓
-- ML Service
--    ↓
-- weekly_data
--    ↓
-- wellness_scores
--    ↓
-- weekly_energy_predictions
--    ↓
-- Node notification
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- USERS & PROFILES
-- =========================================================

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

CREATE UNIQUE INDEX IF NOT EXISTS saathi_users_oauth_identity_idx
ON saathi_users(oauth_provider, oauth_subject)
WHERE oauth_provider IS NOT NULL
  AND oauth_subject IS NOT NULL;

ALTER TABLE saathi_users
ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

ALTER TABLE saathi_users
ADD COLUMN IF NOT EXISTS oauth_subject TEXT;


CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  full_name TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,

  timezone TEXT NOT NULL DEFAULT 'UTC',

  community_room_id TEXT,

  community_joined_at TIMESTAMPTZ,

  preferred_mood TEXT,

  wellness_goal TEXT,

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  reminder_time TIME,

  preferred_meditation_duration INTEGER
    CHECK (
      preferred_meditation_duration IS NULL
      OR preferred_meditation_duration > 0
    ),

  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,

  is_subscribed BOOLEAN NOT NULL DEFAULT FALSE,

  subscribed_at TIMESTAMPTZ,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS community_room_id TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS community_joined_at TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_mood TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wellness_goal TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS energy_level INTEGER
CHECK (energy_level BETWEEN 1 AND 100);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN
NOT NULL DEFAULT TRUE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS reminder_time TIME;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_meditation_duration INTEGER
CHECK (
  preferred_meditation_duration IS NULL
  OR preferred_meditation_duration > 0
);

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN
NOT NULL DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN
NOT NULL DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMPTZ;


-- =========================================================
-- COMMUNITY
-- =========================================================

CREATE TABLE IF NOT EXISTS community_rooms (
  id TEXT PRIMARY KEY,

  owner_id UUID
    REFERENCES saathi_users(id)
    ON DELETE SET NULL,

  owner_name TEXT NOT NULL DEFAULT '',

  name TEXT NOT NULL,

  room_type TEXT NOT NULL
    CHECK (
      room_type IN (
        'discussion',
        'circle',
        'support',
        'event',
        'announcement'
      )
    ),

  topic TEXT NOT NULL DEFAULT '',

  description TEXT NOT NULL DEFAULT '',

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE community_rooms
ADD COLUMN IF NOT EXISTS owner_id UUID
REFERENCES saathi_users(id)
ON DELETE SET NULL;

ALTER TABLE community_rooms
ADD COLUMN IF NOT EXISTS owner_name TEXT
NOT NULL DEFAULT '';

ALTER TABLE community_rooms
ADD COLUMN IF NOT EXISTS energy_level INTEGER
CHECK (energy_level BETWEEN 1 AND 100);

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_community_room_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_community_room_id_fkey
FOREIGN KEY (community_room_id)
REFERENCES community_rooms(id)
ON DELETE SET NULL;


CREATE TABLE IF NOT EXISTS community_memberships (
  room_id TEXT NOT NULL
    REFERENCES community_rooms(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  role TEXT NOT NULL DEFAULT 'member'
    CHECK (
      role IN (
        'member',
        'moderator',
        'admin'
      )
    ),

  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (room_id, user_id)
);


CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  room_id TEXT NOT NULL
    REFERENCES community_rooms(id)
    ON DELETE CASCADE,

  sender_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  sender_name TEXT NOT NULL DEFAULT '',

  message_type TEXT NOT NULL DEFAULT 'text',

  content TEXT NOT NULL,

  reply_to_id UUID
    REFERENCES community_messages(id)
    ON DELETE SET NULL,

  support JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  edited_at TIMESTAMPTZ,

  deleted_at TIMESTAMPTZ
);

ALTER TABLE community_messages
ADD COLUMN IF NOT EXISTS sender_name TEXT
NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS community_messages_room_idx
ON community_messages(room_id, created_at);


CREATE TABLE IF NOT EXISTS community_message_reactions (
  message_id UUID NOT NULL
    REFERENCES community_messages(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  user_name TEXT NOT NULL DEFAULT '',

  emoji TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (
    message_id,
    user_id,
    emoji
  )
);

ALTER TABLE community_message_reactions
ADD COLUMN IF NOT EXISTS user_name TEXT
NOT NULL DEFAULT '';


CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  author_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT '',

  body TEXT NOT NULL DEFAULT '',

  mood TEXT,

  post_type TEXT NOT NULL DEFAULT 'reflection',

  visibility TEXT NOT NULL DEFAULT 'community'
    CHECK (
      visibility IN (
        'community',
        'private'
      )
    ),

  stats JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS community_posts_feed_idx
ON community_posts(
  visibility,
  created_at DESC
);


CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  post_id UUID NOT NULL
    REFERENCES community_posts(id)
    ON DELETE CASCADE,

  author_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  body TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS anonymous_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  author_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  thought TEXT NOT NULL
    CHECK (
      char_length(thought)
      BETWEEN 20 AND 1000
    ),

  photo_data TEXT,

  moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (
      moderation_status IN (
        'approved',
        'blocked',
        'reported'
      )
    ),

  likes_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS anonymous_posts_feed_idx
ON anonymous_posts(
  moderation_status,
  created_at DESC
);


CREATE TABLE IF NOT EXISTS anonymous_post_likes (
  post_id UUID NOT NULL
    REFERENCES anonymous_posts(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (
    post_id,
    user_id
  )
);


-- =========================================================
-- WELLNESS ACTIVITY SOURCES
-- =========================================================

CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  mood TEXT NOT NULL,

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS moods_user_date_idx
ON moods(user_id, created_at DESC);


CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT '',

  content TEXT NOT NULL,

  mood TEXT,

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  media_type TEXT
    CHECK (
      media_type IN (
        'image',
        'audio',
        'video',
        'file'
      )
    ),

  media_url TEXT,

  media_metadata JSONB
    NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);

ALTER TABLE journals
ADD COLUMN IF NOT EXISTS title TEXT
NOT NULL DEFAULT '';

ALTER TABLE journals
ADD COLUMN IF NOT EXISTS energy_level INTEGER
CHECK (energy_level BETWEEN 1 AND 100);

ALTER TABLE journals
ADD COLUMN IF NOT EXISTS media_type TEXT;

ALTER TABLE journals
ADD COLUMN IF NOT EXISTS media_url TEXT;

ALTER TABLE journals
ADD COLUMN IF NOT EXISTS media_metadata JSONB
NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS journals_user_date_idx
ON journals(user_id, created_at DESC);


CREATE TABLE IF NOT EXISTS music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  song_name TEXT NOT NULL,

  artist TEXT NOT NULL DEFAULT '',

  album TEXT NOT NULL DEFAULT '',

  playlist_name TEXT NOT NULL DEFAULT '',

  category TEXT NOT NULL DEFAULT 'wellness',

  genre TEXT,

  audio_url TEXT NOT NULL,

  cover_url TEXT,

  is_available BOOLEAN NOT NULL DEFAULT TRUE,

  duration_seconds INTEGER
    CHECK (
      duration_seconds IS NULL
      OR duration_seconds > 0
    ),

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  listened_till INTEGER NOT NULL DEFAULT 0
    CHECK (listened_till >= 0),

  repetition INTEGER NOT NULL DEFAULT 0
    CHECK (repetition >= 0),

  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

  last_listened_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);

ALTER TABLE music
ADD COLUMN IF NOT EXISTS playlist_name TEXT
NOT NULL DEFAULT '';

ALTER TABLE music
ADD COLUMN IF NOT EXISTS category TEXT
NOT NULL DEFAULT 'wellness';

ALTER TABLE music
ADD COLUMN IF NOT EXISTS is_available BOOLEAN
NOT NULL DEFAULT TRUE;

ALTER TABLE music
ADD COLUMN IF NOT EXISTS last_listened_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS music_user_idx
ON music(user_id, created_at DESC);


CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  duration INTEGER NOT NULL
    CHECK (duration > 0),

  completed BOOLEAN NOT NULL DEFAULT FALSE,

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);

ALTER TABLE meditation_sessions
ADD COLUMN IF NOT EXISTS energy_level INTEGER
CHECK (energy_level BETWEEN 1 AND 100);

CREATE INDEX IF NOT EXISTS meditation_sessions_user_idx
ON meditation_sessions(user_id, created_at DESC);


CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  category TEXT NOT NULL,

  custom_title TEXT,

  duration INTEGER NOT NULL DEFAULT 0,

  progress INTEGER NOT NULL DEFAULT 0,

  completed BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);


-- =========================================================
-- SETTINGS / DEVICES / HEALTH
-- =========================================================

CREATE TABLE IF NOT EXISTS wellness_settings (
  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  setting_key TEXT NOT NULL,

  value JSONB NOT NULL,

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  PRIMARY KEY (
    user_id,
    setting_key
  )
);


CREATE TABLE IF NOT EXISTS wellness_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  platform TEXT NOT NULL,

  device_name TEXT NOT NULL,

  connected BOOLEAN NOT NULL DEFAULT TRUE,

  last_sync_at TIMESTAMPTZ,

  access_token TEXT,

  refresh_token TEXT,

  token_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);

ALTER TABLE wellness_devices
ADD COLUMN IF NOT EXISTS access_token TEXT;

ALTER TABLE wellness_devices
ADD COLUMN IF NOT EXISTS refresh_token TEXT;

ALTER TABLE wellness_devices
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;


CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  metric_type TEXT NOT NULL,

  value NUMERIC NOT NULL,

  unit TEXT,

  raw_data JSONB
    NOT NULL DEFAULT '{}'::jsonb,

  recorded_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);

ALTER TABLE health_metrics
ADD COLUMN IF NOT EXISTS raw_data JSONB
NOT NULL DEFAULT '{}'::jsonb;


-- =========================================================
-- NOTIFICATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  notification_type TEXT NOT NULL,

  title TEXT NOT NULL,

  body TEXT NOT NULL DEFAULT '',

  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);


-- =========================================================
-- ACTIVITY HISTORY
--
-- ALL WELLNESS ACTIVITIES ENTER HERE
--
-- Mood
-- Journal
-- Music
-- Meditation
-- Community
-- etc.
--
-- ML reads this table.
-- =========================================================

CREATE TABLE IF NOT EXISTS activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  activity_type TEXT NOT NULL,

  title TEXT NOT NULL,

  subtitle TEXT,

  energy_level INTEGER
    CHECK (energy_level BETWEEN 1 AND 100),

  process TEXT,

  metadata JSONB
    NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);

ALTER TABLE activity_history
ADD COLUMN IF NOT EXISTS energy_level INTEGER
CHECK (energy_level BETWEEN 1 AND 100);

ALTER TABLE activity_history
ADD COLUMN IF NOT EXISTS process TEXT;

CREATE INDEX IF NOT EXISTS activity_history_user_idx
ON activity_history(user_id, created_at DESC);


-- =========================================================
-- ML OUTPUT 1
-- CURRENT WELLNESS SCORE
--
-- ONE ROW PER USER
--
-- Initial:
-- final_energy_level = 0
-- breakdown = NULL
-- computed_at = NULL
--
-- ML fills it later.
-- =========================================================

CREATE TABLE IF NOT EXISTS wellness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  final_energy_level INTEGER NOT NULL DEFAULT 0
    CHECK (
      final_energy_level BETWEEN 0 AND 100
    ),

  breakdown JSONB,

  computed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW()
);


-- =========================================================
-- ALTER EXISTING WELLNESS SCORE TABLE
-- =========================================================

UPDATE wellness_scores
SET final_energy_level = 0
WHERE final_energy_level IS NULL;

ALTER TABLE wellness_scores
ALTER COLUMN final_energy_level SET NOT NULL;

ALTER TABLE wellness_scores
ALTER COLUMN final_energy_level SET DEFAULT 0;

ALTER TABLE wellness_scores
DROP CONSTRAINT IF EXISTS
wellness_scores_final_energy_level_check;

ALTER TABLE wellness_scores
ADD CONSTRAINT
wellness_scores_final_energy_level_check
CHECK (
  final_energy_level BETWEEN 0 AND 100
);


CREATE UNIQUE INDEX IF NOT EXISTS
wellness_scores_user_unique
ON wellness_scores(user_id);

CREATE INDEX IF NOT EXISTS
wellness_scores_user_idx
ON wellness_scores(
  user_id,
  computed_at DESC
);


-- =========================================================
-- CREATE EMPTY ML TARGET ROW FOR EVERY USER
-- =========================================================

INSERT INTO wellness_scores (
  user_id,
  final_energy_level,
  breakdown,
  computed_at
)
SELECT
  id,
  0,
  NULL,
  NULL
FROM saathi_users
ON CONFLICT (user_id)
DO NOTHING;


-- =========================================================
-- ML OUTPUT 2
-- WEEKLY DATA
--
-- ONE ROW:
--
-- USER + WEEK + DAY
--
-- Example:
--
-- Monday    NULL
-- Tuesday   NULL
-- Wednesday NULL
-- Thursday  NULL
-- Friday    NULL
-- Saturday  NULL
-- Sunday    NULL
--
-- ML fills avg_wellness.
-- =========================================================

CREATE TABLE IF NOT EXISTS weekly_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  week_start DATE NOT NULL,

  day_of_week TEXT NOT NULL
    CHECK (
      day_of_week IN (
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      )
    ),

  avg_wellness NUMERIC(5,2)
    CHECK (
      avg_wellness IS NULL
      OR (
        avg_wellness >= 1
        AND avg_wellness <= 100
      )
    ),

  activity_count INTEGER NOT NULL DEFAULT 0
    CHECK (activity_count >= 0),

  sample_count INTEGER NOT NULL DEFAULT 0
    CHECK (sample_count >= 0),

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  CONSTRAINT weekly_data_unique_day
  UNIQUE (
    user_id,
    week_start,
    day_of_week
  )
);


-- =========================================================
-- ALTER OLD WEEKLY DATA TABLE
-- Handles old SMALLINT day_of_week
-- =========================================================

DO $$
DECLARE
  v_data_type TEXT;
BEGIN

  SELECT data_type
  INTO v_data_type
  FROM information_schema.columns
  WHERE table_schema = current_schema()
    AND table_name = 'weekly_data'
    AND column_name = 'day_of_week';

  IF v_data_type IN (
    'smallint',
    'integer',
    'bigint'
  ) THEN

    ALTER TABLE weekly_data
    DROP CONSTRAINT IF EXISTS
    weekly_data_unique_day;

    ALTER TABLE weekly_data
    DROP CONSTRAINT IF EXISTS
    weekly_data_day_of_week_check;

    ALTER TABLE weekly_data
    ALTER COLUMN day_of_week TYPE TEXT
    USING CASE day_of_week::INTEGER

      WHEN 1 THEN 'Monday'
      WHEN 2 THEN 'Tuesday'
      WHEN 3 THEN 'Wednesday'
      WHEN 4 THEN 'Thursday'
      WHEN 5 THEN 'Friday'
      WHEN 6 THEN 'Saturday'
      WHEN 7 THEN 'Sunday'

      ELSE day_of_week::TEXT

    END;

  END IF;

END;
$$;


ALTER TABLE weekly_data
DROP CONSTRAINT IF EXISTS
weekly_data_day_of_week_check;

ALTER TABLE weekly_data
ADD CONSTRAINT
weekly_data_day_of_week_check
CHECK (
  day_of_week IN (
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  )
);


ALTER TABLE weekly_data
DROP CONSTRAINT IF EXISTS
weekly_data_unique_day;

ALTER TABLE weekly_data
ADD CONSTRAINT
weekly_data_unique_day
UNIQUE (
  user_id,
  week_start,
  day_of_week
);


CREATE INDEX IF NOT EXISTS
weekly_data_user_week_idx
ON weekly_data(
  user_id,
  week_start DESC
);

CREATE INDEX IF NOT EXISTS
weekly_data_user_day_idx
ON weekly_data(
  user_id,
  day_of_week
);


-- =========================================================
-- FUNCTION: ensure_weekly_data_for_date
--
-- Creates the seven empty rows (Monday-Sunday) for any target week.
-- =========================================================

CREATE OR REPLACE FUNCTION ensure_weekly_data_for_date(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_week_start DATE;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  v_week_start := DATE_TRUNC('week', COALESCE(p_date, CURRENT_DATE))::DATE;

  INSERT INTO weekly_data (
    user_id,
    week_start,
    day_of_week,
    avg_wellness,
    activity_count,
    sample_count
  )
  SELECT
    p_user_id,
    v_week_start,
    day_name,
    NULL,
    0,
    0
  FROM (
    VALUES
      ('Monday'),
      ('Tuesday'),
      ('Wednesday'),
      ('Thursday'),
      ('Friday'),
      ('Saturday'),
      ('Sunday')
  ) AS days(day_name)
  ON CONFLICT (
    user_id,
    week_start,
    day_of_week
  )
  DO NOTHING;
END;
$$;


-- Backward-compatible wrapper
CREATE OR REPLACE FUNCTION ensure_current_weekly_data(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM ensure_weekly_data_for_date(p_user_id, CURRENT_DATE);
END;
$$;


-- =========================================================
-- TRIGGER: INITIAL WEEKLY DATA ON USER CREATION
-- =========================================================

CREATE OR REPLACE FUNCTION create_initial_weekly_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM ensure_weekly_data_for_date(NEW.id, CURRENT_DATE);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS saathi_user_initial_weekly_data ON saathi_users;

CREATE TRIGGER saathi_user_initial_weekly_data
AFTER INSERT ON saathi_users
FOR EACH ROW
EXECUTE FUNCTION create_initial_weekly_data();


-- =========================================================
-- FUNCTION: refresh_weekly_data_day
--
-- Recalculates stats (activity_count, sample_count, avg_wellness)
-- for a specific user and day from activity_history.
-- Also syncs the overall summary to wellness_scores.
-- =========================================================

CREATE OR REPLACE FUNCTION refresh_weekly_data_day(
  p_user_id UUID,
  p_date TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_week_start DATE;
  v_day_of_week TEXT;
  v_activity_count INTEGER;
  v_sample_count INTEGER;
  v_avg_wellness NUMERIC(5,2);
BEGIN
  IF p_user_id IS NULL OR p_date IS NULL THEN
    RETURN;
  END IF;

  v_week_start := DATE_TRUNC('week', p_date)::DATE;
  v_day_of_week := TRIM(TO_CHAR(p_date, 'Day'));

  -- Ensure weekly slots exist
  PERFORM ensure_weekly_data_for_date(p_user_id, p_date::DATE);

  -- Aggregate all activity events for this day
  SELECT
    COUNT(*),
    COUNT(energy_level),
    CASE
      WHEN COUNT(energy_level) > 0 THEN ROUND(AVG(energy_level)::numeric, 2)
      ELSE NULL
    END
  INTO
    v_activity_count,
    v_sample_count,
    v_avg_wellness
  FROM activity_history
  WHERE user_id = p_user_id
    AND DATE_TRUNC('week', created_at)::DATE = v_week_start
    AND TRIM(TO_CHAR(created_at, 'Day')) = v_day_of_week;

  -- Upsert into weekly_data
  INSERT INTO weekly_data (
    user_id,
    week_start,
    day_of_week,
    avg_wellness,
    activity_count,
    sample_count,
    updated_at
  )
  VALUES (
    p_user_id,
    v_week_start,
    v_day_of_week,
    v_avg_wellness,
    COALESCE(v_activity_count, 0),
    COALESCE(v_sample_count, 0),
    NOW()
  )
  ON CONFLICT (user_id, week_start, day_of_week)
  DO UPDATE SET
    avg_wellness = EXCLUDED.avg_wellness,
    activity_count = EXCLUDED.activity_count,
    sample_count = EXCLUDED.sample_count,
    updated_at = NOW();

  -- Update wellness_scores overall average for user
  UPDATE wellness_scores
  SET
    final_energy_level = COALESCE(
      (
        SELECT ROUND(AVG(avg_wellness))::INTEGER
        FROM weekly_data
        WHERE user_id = p_user_id
          AND week_start = v_week_start
          AND avg_wellness IS NOT NULL
      ),
      final_energy_level
    ),
    computed_at = NOW()
  WHERE user_id = p_user_id;

END;
$$;


-- =========================================================
-- TRIGGER: AUTO-SYNC activity_history -> weekly_data
-- =========================================================

CREATE OR REPLACE FUNCTION sync_activity_to_weekly_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_weekly_data_day(OLD.user_id, OLD.created_at);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF (OLD.user_id != NEW.user_id)
       OR (DATE_TRUNC('week', OLD.created_at)::DATE != DATE_TRUNC('week', NEW.created_at)::DATE)
       OR (TRIM(TO_CHAR(OLD.created_at, 'Day')) != TRIM(TO_CHAR(NEW.created_at, 'Day'))) THEN
      PERFORM refresh_weekly_data_day(OLD.user_id, OLD.created_at);
    END IF;
    PERFORM refresh_weekly_data_day(NEW.user_id, NEW.created_at);
    RETURN NEW;
  ELSE -- INSERT
    PERFORM refresh_weekly_data_day(NEW.user_id, NEW.created_at);
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_activity_to_weekly_data ON activity_history;

CREATE TRIGGER trg_sync_activity_to_weekly_data
AFTER INSERT OR UPDATE OR DELETE ON activity_history
FOR EACH ROW
EXECUTE FUNCTION sync_activity_to_weekly_data();


-- =========================================================
-- TRIGGER: AUTO-RECORD moods -> activity_history
-- Handles direct client inserts to moods table
-- =========================================================

CREATE OR REPLACE FUNCTION sync_mood_to_activity_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM activity_history
    WHERE user_id = NEW.user_id
      AND activity_type = 'mood'
      AND metadata->>'mood_id' = NEW.id::text
  ) THEN
    INSERT INTO activity_history (
      user_id,
      activity_type,
      title,
      energy_level,
      metadata,
      created_at
    )
    VALUES (
      NEW.user_id,
      'mood',
      COALESCE(NEW.mood, 'Mood Logged'),
      NEW.energy_level,
      jsonb_build_object(
        'mood_id', NEW.id,
        'mood', NEW.mood,
        'energy_level', NEW.energy_level,
        'source', 'moods_trigger'
      ),
      NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_mood_to_activity_history ON moods;

CREATE TRIGGER trg_sync_mood_to_activity_history
AFTER INSERT ON moods
FOR EACH ROW
EXECUTE FUNCTION sync_mood_to_activity_history();


-- =========================================================
-- BACKFILL & REFRESH ALL EXISTING USERS & ACTIVITIES
-- =========================================================

DO $$
DECLARE
  rec RECORD;
BEGIN
  -- 1. Ensure current week for all existing users
  FOR rec IN SELECT id FROM saathi_users LOOP
    PERFORM ensure_weekly_data_for_date(rec.id, CURRENT_DATE);
  END LOOP;

  -- 2. Backfill moods into activity_history if not present
  FOR rec IN
    SELECT m.id, m.user_id, m.mood, m.energy_level, m.created_at
    FROM moods m
    WHERE NOT EXISTS (
      SELECT 1 FROM activity_history a
      WHERE a.user_id = m.user_id
        AND a.activity_type = 'mood'
        AND a.metadata->>'mood_id' = m.id::text
    )
  LOOP
    INSERT INTO activity_history (
      user_id,
      activity_type,
      title,
      energy_level,
      metadata,
      created_at
    )
    VALUES (
      rec.user_id,
      'mood',
      COALESCE(rec.mood, 'Mood Logged'),
      rec.energy_level,
      jsonb_build_object(
        'mood_id', rec.id,
        'mood', rec.mood,
        'energy_level', rec.energy_level,
        'source', 'backfill'
      ),
      rec.created_at
    );
  END LOOP;

  -- 3. Refresh weekly_data for all distinct user/day events in activity_history
  FOR rec IN
    SELECT DISTINCT
      user_id,
      created_at
    FROM activity_history
  LOOP
    PERFORM refresh_weekly_data_day(rec.user_id, rec.created_at);
  END LOOP;
END;
$$;



-- =========================================================
-- ML OUTPUT 3
-- WEEKLY ENERGY PREDICTION
--
-- ML writes:
--
-- predicted_energy_level
--
-- One prediction per user per date.
-- =========================================================

CREATE TABLE IF NOT EXISTS
weekly_energy_predictions (

  id UUID PRIMARY KEY
    DEFAULT gen_random_uuid(),

  created_at TIMESTAMPTZ
    NOT NULL DEFAULT NOW(),

  user_id UUID NOT NULL
    REFERENCES saathi_users(id)
    ON DELETE CASCADE,

  prediction_date DATE
    NOT NULL,

  predicted_energy_level NUMERIC(5,2)
    CHECK (
      predicted_energy_level IS NULL
      OR (
        predicted_energy_level >= 1
        AND predicted_energy_level <= 100
      )
    )
);


-- =========================================================
-- ALTER EXISTING PREDICTION TABLE
-- =========================================================

ALTER TABLE weekly_energy_predictions
ADD COLUMN IF NOT EXISTS
prediction_date DATE;

ALTER TABLE weekly_energy_predictions
ADD COLUMN IF NOT EXISTS
predicted_energy_level NUMERIC(5,2);

ALTER TABLE weekly_energy_predictions
ADD COLUMN IF NOT EXISTS
created_at TIMESTAMPTZ
NOT NULL DEFAULT NOW();

ALTER TABLE weekly_energy_predictions
ADD COLUMN IF NOT EXISTS
recommendation_title TEXT;

ALTER TABLE weekly_energy_predictions
ADD COLUMN IF NOT EXISTS
recommendation_activity TEXT;

ALTER TABLE weekly_energy_predictions
ADD COLUMN IF NOT EXISTS
recommendation_body TEXT;



-- Backfill old rows

UPDATE weekly_energy_predictions
SET prediction_date =
  created_at::DATE
WHERE prediction_date IS NULL;


-- Prediction date required

ALTER TABLE weekly_energy_predictions
ALTER COLUMN prediction_date
SET NOT NULL;


-- Recreate validation

ALTER TABLE weekly_energy_predictions
DROP CONSTRAINT IF EXISTS
weekly_energy_predictions_predicted_energy_level_check;

ALTER TABLE weekly_energy_predictions
ADD CONSTRAINT
weekly_energy_predictions_predicted_energy_level_check
CHECK (
  predicted_energy_level IS NULL
  OR (
    predicted_energy_level >= 1
    AND predicted_energy_level <= 100
  )
);


-- One prediction per user per date

ALTER TABLE weekly_energy_predictions
DROP CONSTRAINT IF EXISTS
weekly_energy_predictions_unique_user_date;

ALTER TABLE weekly_energy_predictions
ADD CONSTRAINT
weekly_energy_predictions_unique_user_date
UNIQUE (
  user_id,
  prediction_date
);


CREATE INDEX IF NOT EXISTS
weekly_energy_predictions_user_date_idx
ON weekly_energy_predictions(
  user_id,
  prediction_date DESC
);


-- =========================================================
-- INITIAL PREDICTION ROW FOR EVERY NEW USER
-- =========================================================
-- A new user gets a prediction row immediately, but the ML service
-- is responsible for filling predicted_energy_level later.
-- Therefore the initial value is NULL, NOT 0 or a fake prediction.
-- One row is created for the signup date.
-- =========================================================

CREATE OR REPLACE FUNCTION create_initial_weekly_prediction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO weekly_energy_predictions (
    user_id,
    prediction_date,
    predicted_energy_level
  )
  VALUES (
    NEW.id,
    CURRENT_DATE,
    NULL
  )
  ON CONFLICT (user_id, prediction_date)
  DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS
saathi_user_initial_weekly_prediction
ON saathi_users;

CREATE TRIGGER
saathi_user_initial_weekly_prediction
AFTER INSERT ON saathi_users
FOR EACH ROW
EXECUTE FUNCTION create_initial_weekly_prediction();


-- =========================================================
-- BACKFILL INITIAL PREDICTION ROWS FOR EXISTING USERS
-- =========================================================
-- This handles users that already existed before the trigger was added.
-- ML will fill predicted_energy_level later.
-- =========================================================

INSERT INTO weekly_energy_predictions (
  user_id,
  prediction_date,
  predicted_energy_level
)
SELECT
  id,
  CURRENT_DATE,
  NULL
FROM saathi_users
ON CONFLICT (user_id, prediction_date)
DO NOTHING;


-- =========================================================
-- COMMUNITY SEED DATA
-- =========================================================

INSERT INTO community_rooms (
  id,
  name,
  room_type,
  topic,
  description
)
VALUES

(
  'daily',
  'Daily Discussion',
  'discussion',
  'What made you smile today?',
  'Share your day and encourage others.'
),

(
  'meditation',
  'Meditation Circle',
  'circle',
  'How was today''s meditation session?',
  'Reflect on your meditation journey.'
),

(
  'sleep',
  'Sleep Circle',
  'circle',
  'Did you sleep well last night?',
  'Discuss healthy sleep habits.'
),

(
  'anxiety',
  'Anxiety Support',
  'support',
  'You are not alone.',
  'A safe place to share and support one another.'
),

(
  'mindfulness',
  'Mindfulness Circle',
  'support',
  'Living in the present.',
  'Daily mindfulness discussions.'
),

(
  'grief',
  'Grief & Loss',
  'support',
  'Healing together.',
  'Support from people who understand.'
)

ON CONFLICT (id)
DO NOTHING;


-- =========================================================
-- FINAL FLOW
--
-- 1. USER DOES ACTIVITY
--
--        ↓
--
-- 2. activity_history
--
--        ↓
--
-- 3. ML SERVICE READS ACTIVITY DATA
--
--        ↓
--
-- 4. ML FILLS weekly_data
--
--        ↓
--
-- 5. ML FILLS wellness_scores
--
--        ↓
--
-- 6. ML CREATES weekly_energy_predictions
--
--        ↓
--
-- 7. NODE CREATES notification
--
--        ↓
--
-- 8. FRONTEND READS RESULT
--
-- =========================================================