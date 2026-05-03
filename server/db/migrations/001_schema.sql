-- =============================================================
-- KritiQ Database Schema
-- DB:   KritiQ  |  User: astronautdesh
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    username        VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'user'
                        CHECK (role IN ('guest','user','creator','pro','admin')),
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
    avatar_url      TEXT,
    vote_weight     NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users (role);
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE IF NOT EXISTS creators (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(255),
    bio             TEXT,
    tier            VARCHAR(20) NOT NULL DEFAULT 'free'
                        CHECK (tier IN ('free','premium','pro')),
    is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
    website_url     TEXT,
    social_handle   VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators (user_id);
CREATE INDEX IF NOT EXISTS idx_creators_tier    ON creators (tier);
CREATE TRIGGER trg_creators_updated_at
    BEFORE UPDATE ON creators FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE IF NOT EXISTS movies (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) UNIQUE NOT NULL,
    description         TEXT,
    release_date        DATE,
    status              VARCHAR(20)  NOT NULL DEFAULT 'pre_release'
                            CHECK (status IN ('pre_release','released','archived')),
    poster_url          TEXT,
    trailer_url         TEXT,
    genre               VARCHAR(100),
    production_company  VARCHAR(255),
    director            VARCHAR(255),
    cast_list           TEXT[],
    hype_score          NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    rating_score        NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_hype_votes    INTEGER      NOT NULL DEFAULT 0,
    total_ratings       INTEGER      NOT NULL DEFAULT 0,
    total_likes         INTEGER      NOT NULL DEFAULT 0,
    total_dislikes      INTEGER      NOT NULL DEFAULT 0,
    total_views         INTEGER      NOT NULL DEFAULT 0,
    creator_id          UUID         REFERENCES creators(id) ON DELETE SET NULL,
    is_featured         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_movies_status     ON movies (status);
CREATE INDEX IF NOT EXISTS idx_movies_slug       ON movies (slug);
CREATE INDEX IF NOT EXISTS idx_movies_creator    ON movies (creator_id);
CREATE INDEX IF NOT EXISTS idx_movies_release    ON movies (release_date);
CREATE INDEX IF NOT EXISTS idx_movies_hype_score ON movies (hype_score DESC);
CREATE INDEX IF NOT EXISTS idx_movies_featured   ON movies (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_movies_title_trgm ON movies USING gin (title gin_trgm_ops);
CREATE TRIGGER trg_movies_updated_at
    BEFORE UPDATE ON movies FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE IF NOT EXISTS music (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) UNIQUE NOT NULL,
    artist           VARCHAR(255) NOT NULL,
    description      TEXT,
    release_date     DATE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'pre_release'
                         CHECK (status IN ('pre_release','released','archived')),
    cover_url        TEXT,
    preview_url      TEXT,
    genre            VARCHAR(100),
    label            VARCHAR(255),
    hype_score       NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    rating_score     NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_hype_votes INTEGER      NOT NULL DEFAULT 0,
    total_ratings    INTEGER      NOT NULL DEFAULT 0,
    total_likes      INTEGER      NOT NULL DEFAULT 0,
    total_dislikes   INTEGER      NOT NULL DEFAULT 0,
    total_views      INTEGER      NOT NULL DEFAULT 0,
    creator_id       UUID         REFERENCES creators(id) ON DELETE SET NULL,
    is_featured      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_music_status      ON music (status);
CREATE INDEX IF NOT EXISTS idx_music_slug        ON music (slug);
CREATE INDEX IF NOT EXISTS idx_music_artist      ON music (artist);
CREATE INDEX IF NOT EXISTS idx_music_hype_score  ON music (hype_score DESC);
CREATE INDEX IF NOT EXISTS idx_music_title_trgm  ON music USING gin (title gin_trgm_ops);
CREATE TRIGGER trg_music_updated_at
    BEFORE UPDATE ON music FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE IF NOT EXISTS engagements (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
    session_id      VARCHAR(255),
    content_id      UUID        NOT NULL,
    content_type    VARCHAR(10) NOT NULL CHECK (content_type IN ('movie','music')),
    engagement_type VARCHAR(10) NOT NULL
                        CHECK (engagement_type IN ('like','dislike','hype','meh','flop','watch')),
    weight          NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    ip_address      INET,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'Nigeria',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_engagement_user
        UNIQUE NULLS NOT DISTINCT (user_id, content_id, content_type, engagement_type),
    CONSTRAINT uq_engagement_session
        UNIQUE NULLS NOT DISTINCT (session_id, content_id, content_type, engagement_type)
);
CREATE INDEX IF NOT EXISTS idx_engagements_content ON engagements (content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_engagements_user    ON engagements (user_id);
CREATE INDEX IF NOT EXISTS idx_engagements_type    ON engagements (engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagements_city    ON engagements (city, content_id);
CREATE INDEX IF NOT EXISTS idx_engagements_created ON engagements (created_at DESC);

CREATE OR REPLACE FUNCTION fn_refresh_hype_score()
RETURNS TRIGGER AS $$
DECLARE
    v_content_id     UUID;
    v_content_type   VARCHAR(10);
    v_total_hype     NUMERIC;
    v_total_votes    NUMERIC;
    v_total_likes    INTEGER;
    v_total_dislikes INTEGER;
    v_hype_score     NUMERIC(5,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_content_id   := OLD.content_id;
        v_content_type := OLD.content_type;
    ELSE
        v_content_id   := NEW.content_id;
        v_content_type := NEW.content_type;
    END IF;

    SELECT
        COALESCE(SUM(CASE WHEN engagement_type = 'hype' THEN weight ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN engagement_type IN ('hype','meh','flop') THEN weight ELSE 0 END), 0),
        COUNT(CASE WHEN engagement_type = 'like' THEN 1 END),
        COUNT(CASE WHEN engagement_type = 'dislike' THEN 1 END)
    INTO v_total_hype, v_total_votes, v_total_likes, v_total_dislikes
    FROM engagements
    WHERE content_id = v_content_id AND content_type = v_content_type;

    IF v_total_votes > 0 THEN
        v_hype_score := ROUND((v_total_hype / v_total_votes) * 100, 2);
    ELSE
        v_hype_score := 0;
    END IF;

    IF v_content_type = 'movie' THEN
        UPDATE movies SET
            hype_score       = v_hype_score,
            total_hype_votes = v_total_votes::INTEGER,
            total_likes      = v_total_likes,
            total_dislikes   = v_total_dislikes
        WHERE id = v_content_id;
    ELSIF v_content_type = 'music' THEN
        UPDATE music SET
            hype_score       = v_hype_score,
            total_hype_votes = v_total_votes::INTEGER,
            total_likes      = v_total_likes,
            total_dislikes   = v_total_dislikes
        WHERE id = v_content_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_hype_score
    AFTER INSERT OR UPDATE OR DELETE ON engagements
    FOR EACH ROW EXECUTE FUNCTION fn_refresh_hype_score();

CREATE TABLE IF NOT EXISTS ratings (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id   UUID         NOT NULL,
    content_type VARCHAR(10)  NOT NULL CHECK (content_type IN ('movie','music')),
    score        NUMERIC(3,1) NOT NULL CHECK (score >= 1.0 AND score <= 5.0),
    weight       NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_rating UNIQUE (user_id, content_id, content_type)
);
CREATE INDEX IF NOT EXISTS idx_ratings_content ON ratings (content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_ratings_user    ON ratings (user_id);
CREATE TRIGGER trg_ratings_updated_at
    BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE OR REPLACE FUNCTION fn_refresh_rating_score()
RETURNS TRIGGER AS $$
DECLARE
    v_content_id   UUID;
    v_content_type VARCHAR(10);
    v_avg_score    NUMERIC(3,2);
    v_total        INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_content_id   := OLD.content_id;
        v_content_type := OLD.content_type;
    ELSE
        v_content_id   := NEW.content_id;
        v_content_type := NEW.content_type;
    END IF;

    SELECT
        COALESCE(ROUND(AVG(score * weight) / NULLIF(AVG(weight), 0), 2), 0),
        COUNT(*)
    INTO v_avg_score, v_total
    FROM ratings
    WHERE content_id = v_content_id AND content_type = v_content_type;

    IF v_content_type = 'movie' THEN
        UPDATE movies SET rating_score = v_avg_score, total_ratings = v_total WHERE id = v_content_id;
    ELSIF v_content_type = 'music' THEN
        UPDATE music SET rating_score = v_avg_score, total_ratings = v_total WHERE id = v_content_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_refresh_rating_score
    AFTER INSERT OR UPDATE OR DELETE ON ratings
    FOR EACH ROW EXECUTE FUNCTION fn_refresh_rating_score();

CREATE TABLE IF NOT EXISTS review_tags (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
    session_id   VARCHAR(255),
    content_id   UUID        NOT NULL,
    content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('movie','music')),
    tag          VARCHAR(50) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_review_tag UNIQUE NULLS NOT DISTINCT (user_id, content_id, content_type, tag)
);
CREATE INDEX IF NOT EXISTS idx_review_tags_content ON review_tags (content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_review_tags_tag     ON review_tags (tag, content_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user    ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens (expires_at);

CREATE TABLE IF NOT EXISTS token_blacklist (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_hash    ON token_blacklist (token_hash);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist (expires_at);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id    UUID        NOT NULL,
    content_type  VARCHAR(10) NOT NULL CHECK (content_type IN ('movie','music')),
    snapshot_date DATE        NOT NULL,
    total_views   INTEGER     NOT NULL DEFAULT 0,
    total_likes   INTEGER     NOT NULL DEFAULT 0,
    total_dislikes INTEGER    NOT NULL DEFAULT 0,
    total_hype    INTEGER     NOT NULL DEFAULT 0,
    total_meh     INTEGER     NOT NULL DEFAULT 0,
    total_flop    INTEGER     NOT NULL DEFAULT 0,
    hype_score    NUMERIC(5,2) NOT NULL DEFAULT 0,
    lagos_count   INTEGER     NOT NULL DEFAULT 0,
    abuja_count   INTEGER     NOT NULL DEFAULT 0,
    enugu_count   INTEGER     NOT NULL DEFAULT 0,
    kano_count    INTEGER     NOT NULL DEFAULT 0,
    ph_count      INTEGER     NOT NULL DEFAULT 0,
    other_count   INTEGER     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_snapshot UNIQUE (content_id, content_type, snapshot_date)
);
CREATE INDEX IF NOT EXISTS idx_snapshots_content_date ON analytics_snapshots (content_id, snapshot_date DESC);

-- ── Seed Data ────────────────────────────────────────────────────
INSERT INTO movies (title, slug, description, release_date, status, genre, director, production_company, hype_score, total_hype_votes, total_likes, total_dislikes)
VALUES
('A Tribe Called Judah 2', 'a-tribe-called-judah-2', 'The highly anticipated sequel to the 2023 breakout hit.', '2025-12-25', 'pre_release', 'Crime/Drama',   'Jade Osiberu',  'Inkblot Productions',  87.4, 14200, 18400, 1200),
('Gangs of Lagos 2',       'gangs-of-lagos-2',       'The streets call them back. The sequel no one expected.','2025-10-01', 'pre_release', 'Action/Crime',  'Jade Osiberu',  'Amazon Studios',       91.2, 22100, 31000,  980),
('The Black Book 2',       'the-black-book-2',       'Deeper into the conspiracy. The truth will cost more.', '2025-08-15', 'pre_release', 'Thriller',      'Editi Effiong', 'Restless Minds',       78.8,  9800, 12300, 2100),
('Mimi',                   'mimi-2025',              'A story of love, loss and the Lagos hustle.',           '2025-06-20', 'released',    'Romance/Drama', 'Daniel Oriahi', 'EbonyLife Films',         0,     0,  8900, 3400),
('Breath of Life',         'breath-of-life',         'An epic historical drama set in pre-colonial Yorubaland.','2025-09-05','pre_release','Historical',   'Kemi Adetiba',  'King Film Collective',  82.1, 11000, 14200, 1800)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO music (title, slug, artist, description, release_date, status, genre, label, hype_score, total_hype_votes, total_likes)
VALUES
('Unavailable Vol. 2',   'unavailable-vol-2',    'Davido',    'The follow-up EP to the smash hit.', '2025-07-04', 'pre_release', 'Afrobeats',  'DMW',       94.1, 38000, 51000),
('Timeless 2',           'timeless-2',           'Burna Boy', 'African Giant returns. Louder.',     '2025-11-01', 'pre_release', 'Afrofusion', 'Spaceship', 89.7, 29400, 44000),
('More Love, Less Ego 2','more-love-less-ego-2', 'Wizkid',    'Star Boy evolves once more.',        '2025-09-20', 'pre_release', 'Afrobeats',  'Starboy',   85.3, 21000, 32000),
('Lagos Love Story',     'lagos-love-story',     'Asa',       'Poetry in melody. Her finest work.', '2025-05-10', 'released',    'Neo-Soul',   'NAIJA ARTS',   0,     0,  9800)
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE FUNCTION fn_cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
    DELETE FROM token_blacklist WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    DELETE FROM refresh_tokens   WHERE expires_at < NOW();
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;