-- =============================================================
-- QritiQ Analytics Seed — 003_seed_analytics.sql
-- Run after 002_seed.sql
-- Adds: second creator, movie assignments, ~3000 engagements,
--       ~400 ratings, ~200 review_tags, 30 days of snapshots
-- =============================================================

-- ─── Missing DB index ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_movies_creator_id   ON movies (creator_id);
CREATE INDEX IF NOT EXISTS idx_engagements_city_ct ON engagements (city, content_id, content_type);

-- ─── Second Creator User ──────────────────────────────────────────────────────

INSERT INTO users (id, email, username, password_hash, role, is_verified, vote_weight)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    'inkblot@qritiq.ng',
    'inkblot_studio',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'creator',
    TRUE,
    1.5
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO creators (id, user_id, company_name, bio, tier, is_verified, website_url, social_handle)
VALUES (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000004',
    'Inkblot Productions',
    'Award-winning Nollywood production house behind some of Nigeria''s biggest theatrical releases.',
    'premium',
    TRUE,
    'https://inkblotproductions.com',
    '@inkblotng'
)
ON CONFLICT (user_id) DO NOTHING;

-- ─── Assign movies to creators ────────────────────────────────────────────────
-- Creator 1 (KritiQ Demo Studio) — action/crime/historical titles
UPDATE movies SET creator_id = '00000000-0000-0000-0000-000000000010'
WHERE slug IN (
    'gangs-of-lagos-2',
    'breath-of-life',
    'king-of-boys',
    'house-of-ga-a',
    'amina',
    'dead-tide',
    'stalker',
    'blackout'
);

-- Creator 2 (Inkblot Productions) — drama/romance/comedy titles
UPDATE movies SET creator_id = '00000000-0000-0000-0000-000000000011'
WHERE slug IN (
    'the-black-book-2',
    'the-arbitration',
    'king-of-thieves',
    'mimi-2025',
    'love-at-a-cost',
    'love-in-every-word',
    'heart-and-lock',
    'the-grudge-ng'
);

-- ─── Seed Users (for realistic engagement variety) ────────────────────────────

INSERT INTO users (id, email, username, password_hash, role, is_verified, vote_weight)
VALUES
    ('00000000-0000-0000-0000-000000000020', 'lagos1@test.ng',  'lagos_viewer_1',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000021', 'lagos2@test.ng',  'lagos_viewer_2',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000022', 'lagos3@test.ng',  'lagos_viewer_3',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000023', 'abuja1@test.ng',  'abuja_viewer_1',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000024', 'abuja2@test.ng',  'abuja_viewer_2',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000025', 'enugu1@test.ng',  'enugu_viewer_1',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000026', 'enugu2@test.ng',  'enugu_viewer_2',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000027', 'kano1@test.ng',   'kano_viewer_1',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000028', 'ph1@test.ng',     'ph_viewer_1',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000029', 'ibadan1@test.ng', 'ibadan_viewer_1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', TRUE, 1.0),
    ('00000000-0000-0000-0000-000000000030', 'pro1@test.ng',    'pro_reviewer_1',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pro',  TRUE, 2.0),
    ('00000000-0000-0000-0000-000000000031', 'pro2@test.ng',    'pro_reviewer_2',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pro',  TRUE, 2.0)
ON CONFLICT (email) DO NOTHING;

-- ─── Engagements ──────────────────────────────────────────────────────────────
-- ~3000 rows generated via generate_series + CASE expressions.
-- The trigger fn_refresh_hype_score fires on each insert and updates
-- hype_score, total_hype_votes, total_likes, total_dislikes on movies.
-- City distribution: Lagos 40%, Enugu 19%, Abuja 16%, PH 10%, Kano 8%, Other 7%

INSERT INTO engagements (
    user_id, session_id, content_id, content_type,
    engagement_type, weight, city, state, country, created_at
)
SELECT
    -- Rotate through our seed users
    CASE (n % 12)
        WHEN 0  THEN '00000000-0000-0000-0000-000000000020'::uuid
        WHEN 1  THEN '00000000-0000-0000-0000-000000000021'::uuid
        WHEN 2  THEN '00000000-0000-0000-0000-000000000022'::uuid
        WHEN 3  THEN '00000000-0000-0000-0000-000000000023'::uuid
        WHEN 4  THEN '00000000-0000-0000-0000-000000000024'::uuid
        WHEN 5  THEN '00000000-0000-0000-0000-000000000025'::uuid
        WHEN 6  THEN '00000000-0000-0000-0000-000000000026'::uuid
        WHEN 7  THEN '00000000-0000-0000-0000-000000000027'::uuid
        WHEN 8  THEN '00000000-0000-0000-0000-000000000028'::uuid
        WHEN 9  THEN '00000000-0000-0000-0000-000000000029'::uuid
        WHEN 10 THEN '00000000-0000-0000-0000-000000000030'::uuid
        ELSE         '00000000-0000-0000-0000-000000000031'::uuid
    END,
    -- Session ID for guest-style tracking
    'seed-session-' || n,
    -- Rotate across 8 key movies
    CASE (n % 8)
        WHEN 0 THEN 'ffd4a6ef-cc08-4230-bbb9-64a454bd9349'::uuid -- Gangs of Lagos 2
        WHEN 1 THEN '9b19467a-47e3-4d31-9b12-6505f66f16c0'::uuid -- Breath of Life
        WHEN 2 THEN '9b7731d3-408a-4581-972d-0a5883851918'::uuid -- Stalker (was dead Black Book 2 UUID)
        WHEN 3 THEN '0d663d7e-6ec2-4de7-93c8-51c4d339a040'::uuid -- King Of Boys
        WHEN 4 THEN '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1'::uuid -- House of Ga'a
        WHEN 5 THEN '2a730896-508e-442d-a104-b829f2e93843'::uuid -- Amina
        WHEN 6 THEN '00ab897e-d64f-46a1-aae4-ef3bfd587a05'::uuid -- Dead Tide
        ELSE        'b26a9368-88a8-44dd-a616-1787cd569ec2'::uuid  -- Stalker
    END,
    'movie',
    -- Engagement type distribution: hype 30%, like 35%, watch 15%, meh 10%, dislike 7%, flop 3%
    CASE
        WHEN n % 100 < 35 THEN 'like'
        WHEN n % 100 < 65 THEN 'hype'
        WHEN n % 100 < 80 THEN 'watch'
        WHEN n % 100 < 90 THEN 'meh'
        WHEN n % 100 < 97 THEN 'dislike'
        ELSE                    'flop'
    END,
    -- Weight — pro users have 2.0, others 1.0
    CASE WHEN n % 12 >= 10 THEN 2.0 ELSE 1.0 END,
    -- City distribution
    CASE
        WHEN n % 100 < 40 THEN 'Lagos'
        WHEN n % 100 < 59 THEN 'Enugu'
        WHEN n % 100 < 75 THEN 'Abuja'
        WHEN n % 100 < 85 THEN 'Port Harcourt'
        WHEN n % 100 < 93 THEN 'Kano'
        ELSE                    'Ibadan'
    END,
    -- State
    CASE
        WHEN n % 100 < 40 THEN 'Lagos'
        WHEN n % 100 < 59 THEN 'Enugu'
        WHEN n % 100 < 75 THEN 'FCT'
        WHEN n % 100 < 85 THEN 'Rivers'
        WHEN n % 100 < 93 THEN 'Kano'
        ELSE                    'Oyo'
    END,
    'Nigeria',
    -- Spread over last 30 days with heavier recent activity
    NOW() - (((30 - (n % 30)) || ' days')::INTERVAL)
         - ((n % 1440 || ' minutes')::INTERVAL)
FROM generate_series(1, 3200) AS n
ON CONFLICT DO NOTHING;

-- ─── Ratings ──────────────────────────────────────────────────────────────────
-- ~400 rows — spread across movies, realistic score distribution
-- Trigger fn_refresh_rating_score fires and updates rating_score + total_ratings

INSERT INTO ratings (user_id, content_id, content_type, score, weight, role, created_at)
SELECT
    CASE (n % 12)
        WHEN 0  THEN '00000000-0000-0000-0000-000000000020'::uuid
        WHEN 1  THEN '00000000-0000-0000-0000-000000000021'::uuid
        WHEN 2  THEN '00000000-0000-0000-0000-000000000022'::uuid
        WHEN 3  THEN '00000000-0000-0000-0000-000000000023'::uuid
        WHEN 4  THEN '00000000-0000-0000-0000-000000000024'::uuid
        WHEN 5  THEN '00000000-0000-0000-0000-000000000025'::uuid
        WHEN 6  THEN '00000000-0000-0000-0000-000000000026'::uuid
        WHEN 7  THEN '00000000-0000-0000-0000-000000000027'::uuid
        WHEN 8  THEN '00000000-0000-0000-0000-000000000028'::uuid
        WHEN 9  THEN '00000000-0000-0000-0000-000000000029'::uuid
        WHEN 10 THEN '00000000-0000-0000-0000-000000000030'::uuid
        ELSE         '00000000-0000-0000-0000-000000000031'::uuid
    END,
    CASE (n % 8)
        WHEN 0 THEN 'ffd4a6ef-cc08-4230-bbb9-64a454bd9349'::uuid
        WHEN 1 THEN '9b19467a-47e3-4d31-9b12-6505f66f16c0'::uuid
        WHEN 2 THEN '0d663d7e-6ec2-4de7-93c8-51c4d339a040'::uuid
        WHEN 3 THEN '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1'::uuid
        WHEN 4 THEN '2a730896-508e-442d-a104-b829f2e93843'::uuid
        WHEN 5 THEN '00ab897e-d64f-46a1-aae4-ef3bfd587a05'::uuid
        WHEN 6 THEN 'b26a9368-88a8-44dd-a616-1787cd569ec2'::uuid
        ELSE        '9b7731d3-408a-4581-972d-0a5883851918'::uuid
    END,
    'movie',
    CASE
        WHEN n % 10 = 0 THEN 1.5
        WHEN n % 10 = 1 THEN 2.0
        WHEN n % 10 = 2 THEN 3.0
        WHEN n % 10 = 3 THEN 3.5
        WHEN n % 10 = 4 THEN 4.0
        WHEN n % 10 = 5 THEN 4.0
        WHEN n % 10 = 6 THEN 4.5
        WHEN n % 10 = 7 THEN 4.5
        WHEN n % 10 = 8 THEN 5.0
        ELSE                  5.0
    END,
    CASE WHEN n % 12 >= 10 THEN 2.0 ELSE 1.0 END,
    CASE WHEN n % 12 >= 10 THEN 'critic' ELSE 'user' END,
    NOW() - (((n % 30) || ' days')::INTERVAL)
FROM generate_series(1, 400) AS n
ON CONFLICT (user_id, content_id, content_type) DO NOTHING;

-- ─── Review Tags ──────────────────────────────────────────────────────────────

INSERT INTO review_tags (user_id, session_id, content_id, content_type, tag, created_at)
SELECT
    CASE (n % 10)
        WHEN 0 THEN '00000000-0000-0000-0000-000000000020'::uuid
        WHEN 1 THEN '00000000-0000-0000-0000-000000000021'::uuid
        WHEN 2 THEN '00000000-0000-0000-0000-000000000023'::uuid
        WHEN 3 THEN '00000000-0000-0000-0000-000000000025'::uuid
        WHEN 4 THEN '00000000-0000-0000-0000-000000000027'::uuid
        WHEN 5 THEN '00000000-0000-0000-0000-000000000028'::uuid
        WHEN 6 THEN '00000000-0000-0000-0000-000000000029'::uuid
        WHEN 7 THEN '00000000-0000-0000-0000-000000000030'::uuid
        WHEN 8 THEN '00000000-0000-0000-0000-000000000031'::uuid
        ELSE        '00000000-0000-0000-0000-000000000022'::uuid
    END,
    'tag-session-' || n,
    CASE (n % 6)
        WHEN 0 THEN 'ffd4a6ef-cc08-4230-bbb9-64a454bd9349'::uuid
        WHEN 1 THEN '9b19467a-47e3-4d31-9b12-6505f66f16c0'::uuid
        WHEN 2 THEN '0d663d7e-6ec2-4de7-93c8-51c4d339a040'::uuid
        WHEN 3 THEN '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1'::uuid
        WHEN 4 THEN '2a730896-508e-442d-a104-b829f2e93843'::uuid
        ELSE        'b26a9368-88a8-44dd-a616-1787cd569ec2'::uuid
    END,
    'movie',
    CASE (n % 12)
        WHEN 0  THEN 'must-watch'
        WHEN 1  THEN 'cinematic'
        WHEN 2  THEN 'slow-burn'
        WHEN 3  THEN 'overrated'
        WHEN 4  THEN 'underrated'
        WHEN 5  THEN 'Lagos-vibes'
        WHEN 6  THEN 'emotional'
        WHEN 7  THEN 'action-packed'
        WHEN 8  THEN 'great-soundtrack'
        WHEN 9  THEN 'award-worthy'
        WHEN 10 THEN 'disappointing'
        ELSE         'binge-worthy'
    END,
    NOW() - (((n % 30) || ' days')::INTERVAL)
FROM generate_series(1, 200) AS n
ON CONFLICT DO NOTHING;

-- ─── Analytics Snapshots — 30 days ───────────────────────────────────────────
-- One row per movie per day for the 4 featured movies.
-- Realistic growth curve: slow start, spike at day 15, plateau by day 25.
-- City breakdown mirrors engagement seed distribution.

INSERT INTO analytics_snapshots (
    content_id, content_type, snapshot_date,
    total_views, total_likes, total_dislikes,
    total_hype, total_meh, total_flop,
    hype_score,
    lagos_count, abuja_count, enugu_count,
    kano_count, ph_count, other_count
)
SELECT
    m.id,
    'movie',
    CURRENT_DATE - ((29 - day_offset) || ' days')::INTERVAL,
    -- Views: grow from ~200/day to ~800/day
    (200 + (day_offset * 20) + (CASE WHEN day_offset BETWEEN 12 AND 18 THEN 400 ELSE 0 END))::INTEGER,
    -- Likes: ~60% of views
    ((200 + day_offset * 20) * 0.60)::INTEGER,
    -- Dislikes: ~8% of views
    ((200 + day_offset * 20) * 0.08)::INTEGER,
    -- Hype votes: ~40% of views
    ((200 + day_offset * 20) * 0.40)::INTEGER,
    -- Meh: ~15%
    ((200 + day_offset * 20) * 0.15)::INTEGER,
    -- Flop: ~5%
    ((200 + day_offset * 20) * 0.05)::INTEGER,
    -- Hype score: starts 70, peaks 92, settles 85
  CASE
    WHEN day_offset < 10  THEN 20.0 + day_offset * 1.2
    WHEN day_offset < 20  THEN 32.0 + (day_offset - 10) * 1.5
    ELSE                       47.0 - (day_offset - 20) * 0.8
END,
    -- City counts (Lagos 40%, Enugu 19%, Abuja 16%, PH 10%, Kano 8%, Other 7%)
    ((200 + day_offset * 20) * 0.40)::INTEGER, -- lagos
    ((200 + day_offset * 20) * 0.16)::INTEGER, -- abuja
    ((200 + day_offset * 20) * 0.19)::INTEGER, -- enugu
    ((200 + day_offset * 20) * 0.08)::INTEGER, -- kano
    ((200 + day_offset * 20) * 0.10)::INTEGER, -- ph
    ((200 + day_offset * 20) * 0.07)::INTEGER  -- other
FROM
    (SELECT unnest(ARRAY[
        'ffd4a6ef-cc08-4230-bbb9-64a454bd9349'::uuid,
        '9b19467a-47e3-4d31-9b12-6505f66f16c0'::uuid,
        '0d663d7e-6ec2-4de7-93c8-51c4d339a040'::uuid,
        '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1'::uuid
    ]) AS id) AS m,
    generate_series(0, 29) AS day_offset
ON CONFLICT (content_id, content_type, snapshot_date) DO UPDATE SET
    total_views    = EXCLUDED.total_views,
    total_likes    = EXCLUDED.total_likes,
    total_dislikes = EXCLUDED.total_dislikes,
    total_hype     = EXCLUDED.total_hype,
    hype_score     = EXCLUDED.hype_score,
    lagos_count    = EXCLUDED.lagos_count,
    abuja_count    = EXCLUDED.abuja_count,
    enugu_count    = EXCLUDED.enugu_count,
    kano_count     = EXCLUDED.kano_count,
    ph_count       = EXCLUDED.ph_count,
    other_count    = EXCLUDED.other_count;

    