-- =============================================================
-- KritiQ Schema Additions — 004_schema_additions.sql
-- Run after 003_seed_analytics.sql
-- Fixes: critic role CHECK, ratings.role column, engagements CHECK
-- Adds:  snippet_plays, street_pull_score, battles, persons,
--        person_credits, task_metadata
-- =============================================================

-- ─── SECTION 1: CONFLICT FIXES ────────────────────────────────────────────────

-- Fix 1: Add 'critic' to users.role CHECK constraint
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('guest','user','creator','pro','critic','admin'));

-- Fix 2: Add missing role column to ratings table
-- (Referenced in 003_seed_analytics.sql and model/ratings.go but absent from schema)
ALTER TABLE ratings
    ADD COLUMN IF NOT EXISTS role VARCHAR(10) NOT NULL DEFAULT 'user'
    CHECK (role IN ('user','critic'));

-- Fix 3: Expand engagements.content_type CHECK to include 'battle'
-- and engagements.engagement_type CHECK to include 'snippet_play'
ALTER TABLE engagements
    DROP CONSTRAINT IF EXISTS engagements_content_type_check;
ALTER TABLE engagements
    ADD CONSTRAINT engagements_content_type_check
    CHECK (content_type IN ('movie','music','battle'));

ALTER TABLE engagements
    DROP CONSTRAINT IF EXISTS engagements_engagement_type_check;
ALTER TABLE engagements
    ADD CONSTRAINT engagements_engagement_type_check
    CHECK (engagement_type IN ('like','dislike','hype','meh','flop','watch','snippet_play','vote_a','vote_b'));

-- ─── SECTION 2: STREET PULL SCORE ────────────────────────────────────────────
-- Computed by background worker, never on hot path.
-- Formula: (views×0.1) + (likes×0.5) + (hype_votes×1.0)
--        + (snippet_plays×0.3) + (ratings×0.8)
-- Normalised to 0-100 scale by the worker.

ALTER TABLE movies
    ADD COLUMN IF NOT EXISTS snippet_plays     INTEGER      NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS street_pull_score NUMERIC(5,2) NOT NULL DEFAULT 0.00;

ALTER TABLE music
    ADD COLUMN IF NOT EXISTS snippet_plays     INTEGER      NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS street_pull_score NUMERIC(5,2) NOT NULL DEFAULT 0.00;

-- Indexes for leaderboard and arena matchmaking queries
CREATE INDEX IF NOT EXISTS idx_movies_street_pull ON movies (street_pull_score DESC);
CREATE INDEX IF NOT EXISTS idx_music_street_pull  ON music  (street_pull_score DESC);
CREATE INDEX IF NOT EXISTS idx_movies_snippet_plays ON movies (snippet_plays DESC);
CREATE INDEX IF NOT EXISTS idx_music_snippet_plays  ON music  (snippet_plays DESC);

-- ─── SECTION 3: TASK METADATA (Scheduler State-Persistence) ──────────────────
-- Stores the last successful run and current lock state for background tasks.
-- Prevents double-trigger, zombie locks, and missed windows across restarts.

CREATE TABLE IF NOT EXISTS task_metadata (
    task_name    VARCHAR(100) PRIMARY KEY,
    status       VARCHAR(10)  NOT NULL DEFAULT 'idle'
                     CHECK (status IN ('idle','running','failed')),
    last_run_at  TIMESTAMPTZ,          -- when the task last completed successfully
    started_at   TIMESTAMPTZ,          -- when current/last run was claimed
    last_error   TEXT,                 -- populated on failure for observability
    run_count    INTEGER      NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_task_metadata_updated_at
    BEFORE UPDATE ON task_metadata FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at();

-- Seed the tasks so rows exist on first claim attempt
INSERT INTO task_metadata (task_name, status, last_run_at)
VALUES
    ('weekly_faceoff_movies', 'idle', NULL),
    ('weekly_faceoff_music',  'idle', NULL),
    ('street_pull_refresh',   'idle', NULL)  -- hourly street_pull_score recompute
ON CONFLICT (task_name) DO NOTHING;

-- ─── SECTION 4: BATTLES ───────────────────────────────────────────────────────
-- One row per weekly face-off. Always two active battles: one movie, one music.
-- Votes are recorded in the existing engagements table with:
--   content_id    = battle.id
--   content_type  = 'battle'
--   engagement_type = 'vote_a' | 'vote_b'
-- City breakdown is computed on read from engagements — not stored redundantly.

CREATE TABLE IF NOT EXISTS battles (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type     VARCHAR(10)  NOT NULL CHECK (content_type IN ('movie','music')),

    -- The two contenders
    content_a_id     UUID         NOT NULL,  -- references movies.id or music.id
    content_b_id     UUID         NOT NULL,  -- references movies.id or music.id

    -- Why they were matched — stored for transparency and future ML use
    match_tier       SMALLINT     NOT NULL DEFAULT 1
                         CHECK (match_tier BETWEEN 1 AND 5),
    match_reason     TEXT,        -- human-readable e.g. 'Same genre (Afrobeats), ±12 hype pts'

    -- Lifecycle
    status           VARCHAR(10)  NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','completed','cancelled')),
    week_start       DATE         NOT NULL,  -- Monday of the battle week
    week_end         DATE         NOT NULL,  -- Sunday of the battle week

    -- Cached vote counts (updated by trigger on engagements insert)
    votes_a          INTEGER      NOT NULL DEFAULT 0,
    votes_b          INTEGER      NOT NULL DEFAULT 0,

    -- Final verdict populated on completion
    winner_id        UUID,        -- NULL if draw or cancelled
    is_draw          BOOLEAN      NOT NULL DEFAULT FALSE,

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Only one active battle per content_type at a time
    CONSTRAINT uq_active_battle UNIQUE NULLS NOT DISTINCT (content_type, status)
        DEFERRABLE INITIALLY DEFERRED,

    -- A content item cannot fight itself
    CONSTRAINT chk_different_content CHECK (content_a_id != content_b_id)
);

CREATE INDEX IF NOT EXISTS idx_battles_status       ON battles (status, content_type);
CREATE INDEX IF NOT EXISTS idx_battles_week         ON battles (week_start DESC);
CREATE INDEX IF NOT EXISTS idx_battles_content_a    ON battles (content_a_id);
CREATE INDEX IF NOT EXISTS idx_battles_content_b    ON battles (content_b_id);
CREATE INDEX IF NOT EXISTS idx_battles_type_week    ON battles (content_type, week_start DESC);

CREATE TRIGGER trg_battles_updated_at
    BEFORE UPDATE ON battles FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at();

-- ── Trigger: keep battles.votes_a/b in sync with engagements ─────────────────
-- Fires on every engagement insert/delete where content_type = 'battle'
-- so the cached counts are always current without polling.

CREATE OR REPLACE FUNCTION fn_refresh_battle_votes()
RETURNS TRIGGER AS $$
DECLARE
    v_battle_id UUID;
    v_votes_a   INTEGER;
    v_votes_b   INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_battle_id := OLD.content_id;
    ELSE
        v_battle_id := NEW.content_id;
    END IF;

    -- Only fire for battle engagements
    IF (TG_OP = 'DELETE' AND OLD.content_type != 'battle') OR
       (TG_OP != 'DELETE' AND NEW.content_type != 'battle') THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT
        COUNT(*) FILTER (WHERE engagement_type = 'vote_a'),
        COUNT(*) FILTER (WHERE engagement_type = 'vote_b')
    INTO v_votes_a, v_votes_b
    FROM engagements
    WHERE content_id = v_battle_id AND content_type = 'battle';

    UPDATE battles
    SET votes_a = v_votes_a, votes_b = v_votes_b
    WHERE id = v_battle_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_battle_votes
    AFTER INSERT OR DELETE ON engagements
    FOR EACH ROW EXECUTE FUNCTION fn_refresh_battle_votes();

-- ── Battle content log: rotation tracker ─────────────────────────────────────
-- Tracks when each content item last appeared in a battle.
-- Used by Tier 5 (fairness guarantee) and the 2-week cooling period.

CREATE TABLE IF NOT EXISTS battle_content_log (
    content_id      UUID        NOT NULL,
    content_type    VARCHAR(10) NOT NULL CHECK (content_type IN ('movie','music')),
    last_battled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    battle_count    INTEGER     NOT NULL DEFAULT 1,
    PRIMARY KEY (content_id, content_type)
);

CREATE INDEX IF NOT EXISTS idx_bcl_type_last ON battle_content_log (content_type, last_battled_at ASC);

-- ── Matchmaking eligibility view ──────────────────────────────────────────────
-- A content item is eligible if:
--   1. Status is 'released' or 'pre_release' (not archived)
--   2. It has NOT been in a battle in the last 14 days (cooling period)
--   3. It has a non-zero hype_score OR total_views (has some signal)

CREATE OR REPLACE VIEW vw_eligible_movies AS
SELECT
    m.id,
    m.title,
    m.slug,
    m.genre,
    m.status,
    m.hype_score,
    m.street_pull_score,
    m.total_views,
    m.total_hype_votes,
    COALESCE(bcl.last_battled_at, '1970-01-01'::TIMESTAMPTZ) AS last_battled_at,
    COALESCE(bcl.battle_count, 0)                             AS battle_count
FROM movies m
LEFT JOIN battle_content_log bcl
    ON bcl.content_id = m.id AND bcl.content_type = 'movie'
WHERE m.status IN ('released','pre_release')
  AND (bcl.last_battled_at IS NULL
       OR bcl.last_battled_at < NOW() - INTERVAL '14 days')
  AND (m.hype_score > 0 OR m.total_views > 0);

CREATE OR REPLACE VIEW vw_eligible_music AS
SELECT
    mu.id,
    mu.title,
    mu.slug,
    mu.genre,
    mu.status,
    mu.hype_score,
    mu.street_pull_score,
    mu.total_views,
    mu.total_hype_votes,
    COALESCE(bcl.last_battled_at, '1970-01-01'::TIMESTAMPTZ) AS last_battled_at,
    COALESCE(bcl.battle_count, 0)                             AS battle_count
FROM music mu
LEFT JOIN battle_content_log bcl
    ON bcl.content_id = mu.id AND bcl.content_type = 'music'
WHERE mu.status IN ('released','pre_release')
  AND (bcl.last_battled_at IS NULL
       OR bcl.last_battled_at < NOW() - INTERVAL '14 days')
  AND (mu.hype_score > 0 OR mu.total_views > 0);

-- ─── SECTION 5: PERSONS (Spotlight) ──────────────────────────────────────────
-- Covers actors, directors, DPs, scriptwriters, musicians,
-- producers, songwriters, and other crew.

CREATE TABLE IF NOT EXISTS persons (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) UNIQUE NOT NULL,

    -- Primary discipline shown on card
    primary_role     VARCHAR(50)  NOT NULL
                         CHECK (primary_role IN (
                             'actor','director','producer','cinematographer',
                             'scriptwriter','musician','songwriter',
                             'editor','sound_designer','costume_designer','other'
                         )),

    bio              TEXT,
    photo_url        TEXT,        -- Cloudinary public_id, same pattern as poster_url
    nationality      VARCHAR(100) NOT NULL DEFAULT 'Nigerian',
    birth_year       SMALLINT,

    -- Computed from their credited works — refreshed by street_pull_refresh task
    avg_hype_score       NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    avg_rating_score     NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_credited_works INTEGER      NOT NULL DEFAULT 0,

    -- Editorial controls
    is_featured      BOOLEAN      NOT NULL DEFAULT FALSE,
    is_verified      BOOLEAN      NOT NULL DEFAULT FALSE,  -- verified identity

    -- External links — stored as JSONB for flexibility
    -- Shape: { instagram, twitter, website, management_email, imdb_url }
    social_links     JSONB        NOT NULL DEFAULT '{}',

    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_persons_slug        ON persons (slug);
CREATE INDEX IF NOT EXISTS idx_persons_role        ON persons (primary_role);
CREATE INDEX IF NOT EXISTS idx_persons_featured    ON persons (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_persons_hype        ON persons (avg_hype_score DESC);
CREATE INDEX IF NOT EXISTS idx_persons_name_trgm   ON persons USING gin (name gin_trgm_ops);

CREATE TRIGGER trg_persons_updated_at
    BEFORE UPDATE ON persons FOR EACH ROW
    EXECUTE FUNCTION fn_update_updated_at();

-- ─── SECTION 6: PERSON CREDITS ────────────────────────────────────────────────
-- Links persons to the movies or music they worked on.
-- One row per person per project per role.
-- A person can have multiple roles on one project (e.g. director + producer).

CREATE TABLE IF NOT EXISTS person_credits (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id    UUID        NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    content_id   UUID        NOT NULL,   -- references movies.id or music.id
    content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('movie','music')),

    -- Their specific role on this project (can differ from primary_role)
    credit_role  VARCHAR(50) NOT NULL
                     CHECK (credit_role IN (
                         'actor','director','producer','cinematographer',
                         'scriptwriter','musician','songwriter',
                         'editor','sound_designer','costume_designer','other'
                     )),

    -- For actors: character name. For musicians: feature/lead/producer credit.
    credit_detail VARCHAR(255),

    -- Display order on the person's profile page (lower = more prominent)
    display_order SMALLINT    NOT NULL DEFAULT 0,

    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pcredits_person      ON person_credits (person_id);
CREATE INDEX IF NOT EXISTS idx_pcredits_content     ON person_credits (content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_pcredits_role        ON person_credits (credit_role);
CREATE UNIQUE INDEX IF NOT EXISTS uq_pcredits_person_content_role
    ON person_credits (person_id, content_id, content_type, credit_role);

-- ── Trigger: refresh persons aggregate scores after credit changes ─────────────
-- When a credit is added or removed, recompute avg_hype_score,
-- avg_rating_score, and total_credited_works from the linked content.

CREATE OR REPLACE FUNCTION fn_refresh_person_scores()
RETURNS TRIGGER AS $$
DECLARE
    v_person_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_person_id := OLD.person_id;
    ELSE
        v_person_id := NEW.person_id;
    END IF;

    UPDATE persons p
    SET
        total_credited_works = sub.total_works,
        avg_hype_score       = sub.avg_hype,
        avg_rating_score     = sub.avg_rating,
        updated_at           = NOW()
    FROM (
        SELECT
            COUNT(DISTINCT pc.content_id)          AS total_works,
            COALESCE(AVG(
                CASE pc.content_type
                    WHEN 'movie' THEN m.hype_score
                    WHEN 'music' THEN mu.hype_score
                END
            ), 0)                                  AS avg_hype,
            COALESCE(AVG(
                CASE pc.content_type
                    WHEN 'movie' THEN m.rating_score
                    WHEN 'music' THEN mu.rating_score
                END
            ), 0)                                  AS avg_rating
        FROM person_credits pc
        LEFT JOIN movies m  ON m.id  = pc.content_id AND pc.content_type = 'movie'
        LEFT JOIN music  mu ON mu.id = pc.content_id AND pc.content_type = 'music'
        WHERE pc.person_id = v_person_id
    ) sub
    WHERE p.id = v_person_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_person_scores
    AFTER INSERT OR DELETE ON person_credits
    FOR EACH ROW EXECUTE FUNCTION fn_refresh_person_scores();

-- ─── SECTION 7: ADDITIONAL INDEXES FOR MATCHMAKING ────────────────────────────
-- These support the 5-tier matchmaking queries at speed.

-- Tier 1 & 2: genre + hype_score range scans
CREATE INDEX IF NOT EXISTS idx_movies_genre_hype ON movies (genre, hype_score DESC)
    WHERE status IN ('released','pre_release');
CREATE INDEX IF NOT EXISTS idx_music_genre_hype  ON music  (genre, hype_score DESC)
    WHERE status IN ('released','pre_release');

-- Tier 4: city affinity scans on analytics_snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_city_pull ON analytics_snapshots
    (content_type, lagos_count DESC, abuja_count DESC, enugu_count DESC,
     kano_count DESC, ph_count DESC);

-- Engagements: fast city breakdown per battle
CREATE INDEX IF NOT EXISTS idx_engagements_battle_city
    ON engagements (content_id, content_type, city, engagement_type)
    WHERE content_type = 'battle';

-- ─── SECTION 8: STREET PULL REFRESH FUNCTION ──────────────────────────────────
-- Called by the street_pull_refresh background task (hourly).
-- Recomputes street_pull_score for all non-archived content.
-- Uses a logarithmic scale so viral outliers don't dominate.

CREATE OR REPLACE FUNCTION fn_compute_street_pull(
    p_views       INTEGER,
    p_likes       INTEGER,
    p_hype_votes  INTEGER,
    p_snippets    INTEGER,  -- 0 for movies
    p_ratings     INTEGER
) RETURNS NUMERIC(5,2) AS $$
DECLARE
    raw_score   NUMERIC;
    normalised  NUMERIC(5,2);
BEGIN
    -- Weighted raw score
    raw_score :=
        (p_views      * 0.10) +
        (p_likes      * 0.50) +
        (p_hype_votes * 1.00) +
        (p_snippets   * 0.30) +
        (p_ratings    * 0.80);

    -- Log-compress to prevent viral outliers dominating (ln(x+1) * scale)
    -- Scale factor 8.5 maps typical ranges to 0-100
    normalised := LEAST(ROUND(LN(raw_score + 1) * 8.5, 2), 100.00);

    RETURN GREATEST(normalised, 0.00);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Batch refresh procedure — run by the worker, not on hot paths
CREATE OR REPLACE FUNCTION fn_refresh_all_street_pull()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    movie_count   INTEGER;
    music_count   INTEGER;
BEGIN
    -- Refresh movies
    UPDATE movies SET
        street_pull_score = fn_compute_street_pull(
            total_views, total_likes, total_hype_votes, 0, total_ratings
        )
    WHERE status != 'archived';
    GET DIAGNOSTICS movie_count = ROW_COUNT;

    -- Refresh music (includes snippet_plays)
    UPDATE music SET
        street_pull_score = fn_compute_street_pull(
            total_views, total_likes, total_hype_votes, snippet_plays, total_ratings
        )
    WHERE status != 'archived';
    GET DIAGNOSTICS music_count = ROW_COUNT;

    updated_count := movie_count + music_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ─── SECTION 9: ZOMBIE LOCK RESOLUTION FUNCTION ───────────────────────────────
-- Called at server startup before any claim attempt.
-- Clears locks held for more than 30 minutes — covers crashed runs.

CREATE OR REPLACE FUNCTION fn_clear_zombie_task_locks()
RETURNS INTEGER AS $$
DECLARE
    cleared INTEGER;
BEGIN
    UPDATE task_metadata
    SET
        status     = 'failed',
        last_error = 'Zombie lock cleared on startup — task exceeded 30min without completion',
        updated_at = NOW()
    WHERE status    = 'running'
      AND started_at < NOW() - INTERVAL '30 minutes';

    GET DIAGNOSTICS cleared = ROW_COUNT;
    RETURN cleared;
END;
$$ LANGUAGE plpgsql;

-- ─── SECTION 10: ATOMIC TASK CLAIM FUNCTION ───────────────────────────────────
-- Returns TRUE if this server instance successfully claimed the task.
-- Returns FALSE if another instance already holds it or ran it recently.
-- The $2 parameter is the minimum interval since last_run_at.

CREATE OR REPLACE FUNCTION fn_claim_task(
    p_task_name       VARCHAR(100),
    p_min_interval    INTERVAL      -- '7 days' for weekly_faceoff, '1 hour' for street_pull
) RETURNS BOOLEAN AS $$
DECLARE
    claimed BOOLEAN := FALSE;
BEGIN
    UPDATE task_metadata
    SET
        status     = 'running',
        started_at = NOW(),
        run_count  = run_count + 1,
        updated_at = NOW()
    WHERE task_name = p_task_name
      AND status    = 'idle'
      AND (last_run_at IS NULL
           OR last_run_at < NOW() - p_min_interval);

    GET DIAGNOSTICS claimed = (ROW_COUNT > 0);
    RETURN claimed;
END;
$$ LANGUAGE plpgsql;

-- ─── SECTION 11: TASK COMPLETION FUNCTIONS ────────────────────────────────────

-- Mark task as completed successfully
CREATE OR REPLACE FUNCTION fn_complete_task(p_task_name VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    UPDATE task_metadata
    SET
        status      = 'idle',
        last_run_at = NOW(),
        last_error  = NULL,
        updated_at  = NOW()
    WHERE task_name = p_task_name;
END;
$$ LANGUAGE plpgsql;

-- Mark task as failed with error message
CREATE OR REPLACE FUNCTION fn_fail_task(p_task_name VARCHAR(100), p_error TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE task_metadata
    SET
        status     = 'failed',
        last_error = p_error,
        updated_at = NOW()
    WHERE task_name = p_task_name;
END;
$$ LANGUAGE plpgsql;