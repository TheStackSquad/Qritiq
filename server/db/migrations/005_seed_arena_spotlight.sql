-- =============================================================
-- KritiQ Arena & Spotlight Seed — 005_seed_arena_spotlight.sql
-- Run after 004_schema_additions.sql
-- Adds: 4 battles (2 movie, 2 music — 1 active + 1 completed each)
--       Battle votes with city distribution via engagements
--       15 persons across disciplines
--       Person credits linked to existing movies and music
-- =============================================================

-- ─── SECTION 1: BATTLES ───────────────────────────────────────────────────────
-- Two movie battles: 1 active this week, 1 completed last week
-- Two music battles: 1 active this week, 1 completed last week
-- UUIDs are fixed so person_credits and votes can reference them deterministically

-- NOTE: The UNIQUE constraint on (content_type, status) for 'active'
-- means only one active battle per type at a time. Insert completed first.

-- ── Completed movie battle (last week) ───────────────────────────────────────
INSERT INTO battles (
    id, content_type,
    content_a_id, content_b_id,
    match_tier, match_reason,
    status, week_start, week_end,
    votes_a, votes_b,
    winner_id, is_draw
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    'movie',
    -- King Of Boys vs House of Ga'a: same Historical/Crime energy, both Tier 1
    '0d663d7e-6ec2-4de7-93c8-51c4d339a040',  -- King Of Boys
    '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1',  -- House of Ga'a
    1,
    'Same genre cluster (Crime/Historical Drama), hype scores within ±8pts, high Lagos engagement on both',
    'completed',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE - INTERVAL '8 days',
    1847, 1203,
    '0d663d7e-6ec2-4de7-93c8-51c4d339a040',  -- King Of Boys won
    FALSE
)
ON CONFLICT (id) DO NOTHING;

-- ── Active movie battle (this week) ──────────────────────────────────────────
INSERT INTO battles (
    id, content_type,
    content_a_id, content_b_id,
    match_tier, match_reason,
    status, week_start, week_end,
    votes_a, votes_b,
    winner_id, is_draw
) VALUES (
    '10000000-0000-0000-0000-000000000002',
    'movie',
    -- Gangs of Lagos 2 vs Breath of Life: both pre-release, similar hype
    'ffd4a6ef-cc08-4230-bbb9-64a454bd9349',  -- Gangs of Lagos 2
    '9b19467a-47e3-4d31-9b12-6505f66f16c0',  -- Breath of Life
    1,
    'Both pre-release, Action vs Historical — genre contrast, within ±9pts hype score, high street_pull',
    'active',
    DATE_TRUNC('week', CURRENT_DATE),
    DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days',
    0, 0,   -- votes populated by engagement seed below
    NULL, FALSE
)
ON CONFLICT (id) DO NOTHING;

-- ── Completed music battle (last week) ────────────────────────────────────────
INSERT INTO battles (
    id, content_type,
    content_a_id, content_b_id,
    match_tier, match_reason,
    status, week_start, week_end,
    votes_a, votes_b,
    winner_id, is_draw
) VALUES (
    '10000000-0000-0000-0000-000000000003',
    'music',
    -- Tems Try Me vs Tiwa Savage 49-99: both Afropop/Soul, high hype
    (SELECT id FROM music WHERE slug = 'tems-try-me'),
    (SELECT id FROM music WHERE slug = 'tiwa-savage-49-99'),
    1,
    'Same genre cluster (Afro-soul/Afropop), similar hype scores, dominant Lagos engagement',
    'completed',
    CURRENT_DATE - INTERVAL '14 days',
    CURRENT_DATE - INTERVAL '8 days',
    2341, 1876,
    (SELECT id FROM music WHERE slug = 'tems-try-me'),  -- Tems won
    FALSE
)
ON CONFLICT (id) DO NOTHING;

-- ── Active music battle (this week) ───────────────────────────────────────────
INSERT INTO battles (
    id, content_type,
    content_a_id, content_b_id,
    match_tier, match_reason,
    status, week_start, week_end,
    votes_a, votes_b,
    winner_id, is_draw
) VALUES (
    '10000000-0000-0000-0000-000000000004',
    'music',
    -- Davido A Good Time vs Wizkid More Love Less Ego 2: Afrobeats heavyweight clash
    (SELECT id FROM music WHERE slug = 'davido-a-good-time'),
    (SELECT id FROM music WHERE slug = 'more-love-less-ego-2'),
    1,
    'Same genre (Afrobeats), Tier 1 match — hype scores within ±9pts, cross-city split Lagos/Abuja',
    'active',
    DATE_TRUNC('week', CURRENT_DATE),
    DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days',
    0, 0,
    NULL, FALSE
)
ON CONFLICT (id) DO NOTHING;

-- ─── SECTION 2: BATTLE CONTENT LOG ────────────────────────────────────────────
-- Record that these content items have been in battles
-- so the 2-week cooling period and Tier 5 rotation work correctly

INSERT INTO battle_content_log (content_id, content_type, last_battled_at, battle_count)
VALUES
    -- Completed battle participants (last week — cooling period active)
    ('0d663d7e-6ec2-4de7-93c8-51c4d339a040', 'movie', CURRENT_DATE - INTERVAL '8 days', 1),
    ('057dd5a2-fb32-4f02-a4c4-d7657ed35ac1', 'movie', CURRENT_DATE - INTERVAL '8 days', 1),
    -- Active battle participants (this week)
    ('ffd4a6ef-cc08-4230-bbb9-64a454bd9349', 'movie', NOW(), 1),
    ('9b19467a-47e3-4d31-9b12-6505f66f16c0', 'movie', NOW(), 1)
ON CONFLICT (content_id, content_type) DO UPDATE SET
    last_battled_at = EXCLUDED.last_battled_at,
    battle_count    = battle_content_log.battle_count + 1;

INSERT INTO battle_content_log (content_id, content_type, last_battled_at, battle_count)
SELECT id, 'music', CURRENT_DATE - INTERVAL '8 days', 1
FROM music WHERE slug IN ('tems-try-me', 'tiwa-savage-49-99')
ON CONFLICT (content_id, content_type) DO UPDATE SET
    last_battled_at = EXCLUDED.last_battled_at,
    battle_count    = battle_content_log.battle_count + 1;

INSERT INTO battle_content_log (content_id, content_type, last_battled_at, battle_count)
SELECT id, 'music', NOW(), 1
FROM music WHERE slug IN ('davido-a-good-time', 'more-love-less-ego-2')
ON CONFLICT (content_id, content_type) DO UPDATE SET
    last_battled_at = NOW(),
    battle_count    = battle_content_log.battle_count + 1;

-- ─── SECTION 3: BATTLE ENGAGEMENT VOTES ───────────────────────────────────────
-- Seed votes for the two ACTIVE battles only.
-- Uses existing seed users rotated with city distribution.
-- Trigger fn_refresh_battle_votes fires on each insert
-- and updates battles.votes_a / votes_b automatically.

-- Active movie battle votes: Gangs of Lagos 2 vs Breath of Life
-- Target: ~420 votes_a (Gangs), ~280 votes_b (Breath)
INSERT INTO engagements (
    user_id, session_id, content_id, content_type,
    engagement_type, weight, city, state, country, created_at
)
SELECT
    CASE (n % 10)
        WHEN 0 THEN '00000000-0000-0000-0000-000000000020'::uuid
        WHEN 1 THEN '00000000-0000-0000-0000-000000000021'::uuid
        WHEN 2 THEN '00000000-0000-0000-0000-000000000022'::uuid
        WHEN 3 THEN '00000000-0000-0000-0000-000000000023'::uuid
        WHEN 4 THEN '00000000-0000-0000-0000-000000000024'::uuid
        WHEN 5 THEN '00000000-0000-0000-0000-000000000025'::uuid
        WHEN 6 THEN '00000000-0000-0000-0000-000000000026'::uuid
        WHEN 7 THEN '00000000-0000-0000-0000-000000000027'::uuid
        WHEN 8 THEN '00000000-0000-0000-0000-000000000028'::uuid
        ELSE        '00000000-0000-0000-0000-000000000029'::uuid
    END,
    'battle-movie-vote-' || n,
    '10000000-0000-0000-0000-000000000002'::uuid,  -- active movie battle
    'battle',
    -- 60% vote_a (Gangs of Lagos 2), 40% vote_b (Breath of Life)
    CASE WHEN n % 10 < 6 THEN 'vote_a' ELSE 'vote_b' END,
    1.0,
    CASE
        WHEN n % 100 < 42 THEN 'Lagos'
        WHEN n % 100 < 60 THEN 'Abuja'
        WHEN n % 100 < 77 THEN 'Enugu'
        WHEN n % 100 < 87 THEN 'Port Harcourt'
        WHEN n % 100 < 94 THEN 'Kano'
        ELSE                    'Ibadan'
    END,
    CASE
        WHEN n % 100 < 42 THEN 'Lagos'
        WHEN n % 100 < 60 THEN 'FCT'
        WHEN n % 100 < 77 THEN 'Enugu'
        WHEN n % 100 < 87 THEN 'Rivers'
        WHEN n % 100 < 94 THEN 'Kano'
        ELSE                    'Oyo'
    END,
    'Nigeria',
    NOW() - ((n % 168 || ' hours')::INTERVAL)  -- spread across 7 days
FROM generate_series(1, 700) AS n
ON CONFLICT DO NOTHING;

-- Active music battle votes: Davido vs Wizkid
-- Target: ~390 votes_a (Davido), ~360 votes_b (Wizkid) — closer fight
INSERT INTO engagements (
    user_id, session_id, content_id, content_type,
    engagement_type, weight, city, state, country, created_at
)
SELECT
    CASE (n % 10)
        WHEN 0 THEN '00000000-0000-0000-0000-000000000020'::uuid
        WHEN 1 THEN '00000000-0000-0000-0000-000000000021'::uuid
        WHEN 2 THEN '00000000-0000-0000-0000-000000000022'::uuid
        WHEN 3 THEN '00000000-0000-0000-0000-000000000023'::uuid
        WHEN 4 THEN '00000000-0000-0000-0000-000000000024'::uuid
        WHEN 5 THEN '00000000-0000-0000-0000-000000000025'::uuid
        WHEN 6 THEN '00000000-0000-0000-0000-000000000026'::uuid
        WHEN 7 THEN '00000000-0000-0000-0000-000000000027'::uuid
        WHEN 8 THEN '00000000-0000-0000-0000-000000000028'::uuid
        ELSE        '00000000-0000-0000-0000-000000000029'::uuid
    END,
    'battle-music-vote-' || n,
    '10000000-0000-0000-0000-000000000004'::uuid,  -- active music battle
    'battle',
    -- 52% vote_a (Davido), 48% vote_b (Wizkid) — intentionally tight
    CASE WHEN n % 25 < 13 THEN 'vote_a' ELSE 'vote_b' END,
    1.0,
    -- Music battle: Abuja leans Wizkid, Lagos splits, PH leans Davido
    CASE
        WHEN n % 100 < 38 THEN 'Lagos'
        WHEN n % 100 < 58 THEN 'Abuja'
        WHEN n % 100 < 72 THEN 'Enugu'
        WHEN n % 100 < 84 THEN 'Port Harcourt'
        WHEN n % 100 < 93 THEN 'Kano'
        ELSE                    'Ibadan'
    END,
    CASE
        WHEN n % 100 < 38 THEN 'Lagos'
        WHEN n % 100 < 58 THEN 'FCT'
        WHEN n % 100 < 72 THEN 'Enugu'
        WHEN n % 100 < 84 THEN 'Rivers'
        WHEN n % 100 < 93 THEN 'Kano'
        ELSE                    'Oyo'
    END,
    'Nigeria',
    NOW() - ((n % 168 || ' hours')::INTERVAL)
FROM generate_series(1, 750) AS n
ON CONFLICT DO NOTHING;

-- ─── SECTION 4: SNIPPET PLAYS SEED ────────────────────────────────────────────
-- Seed realistic snippet_plays counts for music tracks
-- so street_pull_score has signal on music cards

UPDATE music SET snippet_plays = 14200 WHERE slug = 'tems-try-me';
UPDATE music SET snippet_plays = 11800 WHERE slug = 'tiwa-savage-49-99';
UPDATE music SET snippet_plays = 18400 WHERE slug = 'davido-a-good-time';
UPDATE music SET snippet_plays =  9200 WHERE slug = 'blaqbonez-mr-boombastic';
UPDATE music SET snippet_plays = 21000 WHERE slug = 'unavailable-vol-2';
UPDATE music SET snippet_plays = 16300 WHERE slug = 'timeless-2';
UPDATE music SET snippet_plays = 12700 WHERE slug = 'more-love-less-ego-2';
UPDATE music SET snippet_plays =  4100 WHERE slug = 'boj-falz-ajebutter22-make-e-no-cause-fight-ii';
UPDATE music SET snippet_plays =  3800 WHERE slug = 'wurld-love-is-contagious';
UPDATE music SET snippet_plays =  2900 WHERE slug = 'lagos-love-story';

-- Seed total_views for movies (for street_pull calculation)
UPDATE movies SET total_views = 84200 WHERE slug = 'gangs-of-lagos-2';
UPDATE movies SET total_views = 71400 WHERE slug = 'a-tribe-called-judah-2';
UPDATE movies SET total_views = 43100 WHERE slug = 'king-of-boys';
UPDATE movies SET total_views = 38700 WHERE slug = 'house-of-ga-a';
UPDATE movies SET total_views = 29800 WHERE slug = 'breath-of-life';
UPDATE movies SET total_views = 22400 WHERE slug = 'amina';
UPDATE movies SET total_views = 18600 WHERE slug = 'stalker';
UPDATE movies SET total_views = 16200 WHERE slug = 'dead-tide';

-- Run initial street_pull_score computation for seeded data
SELECT fn_refresh_all_street_pull();

-- ─── SECTION 5: PERSONS ───────────────────────────────────────────────────────
-- 15 persons across disciplines — actors, directors, musicians,
-- producers, scriptwriters. Credits link to existing seeded movies/music.

INSERT INTO persons (
    id, name, slug, primary_role, bio,
    nationality, birth_year,
    is_featured, is_verified, social_links
) VALUES

-- ── Directors ────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000001',
    'Jade Osiberu', 'jade-osiberu', 'director',
    'Award-winning Nigerian filmmaker and screenwriter behind Gangs of Lagos and A Tribe Called Judah. Founder of Greoh Studios.',
    'Nigerian', 1983, TRUE, TRUE,
    '{"instagram":"https://instagram.com/jadeosiberu","twitter":"https://twitter.com/jadeosiberu","website":"https://greohstudios.com"}'
),
(
    '20000000-0000-0000-0000-000000000002',
    'Kemi Adetiba', 'kemi-adetiba', 'director',
    'Visionary director of King Of Boys and The Wedding Party. One of Nigeria''s most commercially successful filmmakers.',
    'Nigerian', 1980, TRUE, TRUE,
    '{"instagram":"https://instagram.com/kemiadetiba","twitter":"https://twitter.com/kemiadetiba"}'
),
(
    '20000000-0000-0000-0000-000000000003',
    'Editi Effiong', 'editi-effiong', 'director',
    'Director and producer of The Black Book — Netflix Nigeria''s most-watched film. Founder of Restless Minds Studio.',
    'Nigerian', 1981, FALSE, TRUE,
    '{"twitter":"https://twitter.com/editieffiong"}'
),
(
    '20000000-0000-0000-0000-000000000004',
    'Daniel Oriahi', 'daniel-oriahi', 'director',
    'Versatile director known for Mimi, Sylvester and the Voice, and Sugar Rush. A quiet force in contemporary Nollywood.',
    'Nigerian', 1979, FALSE, TRUE,
    '{"instagram":"https://instagram.com/danieloriahi"}'
),

-- ── Actors ────────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000005',
    'Sola Sobowale', 'sola-sobowale', 'actor',
    'Legendary Nollywood actress. Eniola Salami in King Of Boys. Icon of Nigerian screen for three decades.',
    'Nigerian', 1966, TRUE, TRUE,
    '{"instagram":"https://instagram.com/solasobowale_official"}'
),
(
    '20000000-0000-0000-0000-000000000006',
    'Tobi Bakre', 'tobi-bakre', 'actor',
    'Rising Nollywood powerhouse. Known for Gangs of Lagos and A Tribe Called Judah. The face of the new Nollywood generation.',
    'Nigerian', 1992, TRUE, TRUE,
    '{"instagram":"https://instagram.com/tobibakre","twitter":"https://twitter.com/tobibakre"}'
),
(
    '20000000-0000-0000-0000-000000000007',
    'Bimbo Ademoye', 'bimbo-ademoye', 'actor',
    'Critically acclaimed actress with range across comedy and drama. Known for Mimi, Breaded Life, and countless audience favourites.',
    'Nigerian', 1991, FALSE, TRUE,
    '{"instagram":"https://instagram.com/bimboademoye"}'
),
(
    '20000000-0000-0000-0000-000000000008',
    'Keppy Ekpeyong Bassey', 'keppy-ekpeyong', 'actor',
    'Veteran actor with over 200 Nollywood credits. The commanding presence behind House of Ga''a.',
    'Nigerian', 1965, FALSE, TRUE,
    '{}'
),

-- ── Musicians ─────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000009',
    'Tems', 'tems', 'musician',
    'Grammy-nominated Afro-soul singer and songwriter. Broke out with Try Me and became one of Africa''s biggest global exports.',
    'Nigerian', 1995, TRUE, TRUE,
    '{"instagram":"https://instagram.com/temsbaby","twitter":"https://twitter.com/temsbaby"}'
),
(
    '20000000-0000-0000-0000-000000000010',
    'Davido', 'davido', 'musician',
    'DMW label boss. Three-time BET Award winner. One of the defining voices of Afrobeats globally.',
    'Nigerian', 1992, TRUE, TRUE,
    '{"instagram":"https://instagram.com/davido","twitter":"https://twitter.com/davido"}'
),
(
    '20000000-0000-0000-0000-000000000011',
    'Tiwa Savage', 'tiwa-savage', 'musician',
    'Africa''s foremost female Afropop artist. Political anthem 49-99 cemented her legacy beyond music.',
    'Nigerian', 1980, TRUE, TRUE,
    '{"instagram":"https://instagram.com/tiwasavage","twitter":"https://twitter.com/tiwasavage"}'
),
(
    '20000000-0000-0000-0000-000000000012',
    'Blaqbonez', 'blaqbonez', 'musician',
    'Self-proclaimed best rapper in Africa. Chocolate City''s most consistent lyricist. Mr Boombastic broke new ground.',
    'Nigerian', 1997, FALSE, TRUE,
    '{"instagram":"https://instagram.com/blaqbonez","twitter":"https://twitter.com/blaqbonez"}'
),

-- ── Producers / Scriptwriters ─────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000013',
    'Zack Orji', 'zack-orji', 'actor',
    'Nollywood pioneer and statesman of Nigerian cinema. Over 30 years of excellence across hundreds of productions.',
    'Nigerian', 1960, FALSE, TRUE,
    '{}'
),
(
    '20000000-0000-0000-0000-000000000014',
    'Niyi Akinmolayan', 'niyi-akinmolayan', 'director',
    'CEO of Anthill Studios. Director of The Arbitration, Prophetess, and Chief Daddy. One of Nigeria''s most prolific filmmakers.',
    'Nigerian', 1980, FALSE, TRUE,
    '{"twitter":"https://twitter.com/niyiakin","instagram":"https://instagram.com/niyiakinmolayan"}'
),
(
    '20000000-0000-0000-0000-000000000015',
    'Falz', 'falz', 'musician',
    'Rapper, actor, activist. Collaborated on Make E No Cause Fight II. One of Nigeria''s most socially conscious artists.',
    'Nigerian', 1990, FALSE, TRUE,
    '{"instagram":"https://instagram.com/falzthebahdguy","twitter":"https://twitter.com/falzthebahdguy"}'
)
ON CONFLICT (slug) DO NOTHING;

-- ─── SECTION 6: PERSON CREDITS ────────────────────────────────────────────────
-- Links persons to their movies and music works.
-- Trigger fn_refresh_person_scores fires and computes
-- avg_hype_score, avg_rating_score, total_credited_works on each insert.

INSERT INTO person_credits (person_id, content_id, content_type, credit_role, credit_detail, display_order)
VALUES

-- ── Jade Osiberu ─────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000001',
    'ffd4a6ef-cc08-4230-bbb9-64a454bd9349',  -- Gangs of Lagos 2
    'movie', 'director', 'Director & Screenwriter', 1
),
(
    '20000000-0000-0000-0000-000000000001',
    (SELECT id FROM movies WHERE slug = 'a-tribe-called-judah-2'),
    'movie', 'director', 'Director & Screenwriter', 2
),

-- ── Kemi Adetiba ─────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000002',
    '0d663d7e-6ec2-4de7-93c8-51c4d339a040',  -- King Of Boys
    'movie', 'director', 'Director, Writer & Producer', 1
),
(
    '20000000-0000-0000-0000-000000000002',
    '9b19467a-47e3-4d31-9b12-6505f66f16c0',  -- Breath of Life
    'movie', 'director', 'Director', 2
),

-- ── Editi Effiong ────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000003',
    (SELECT id FROM movies WHERE slug = 'the-black-book-2'),
    'movie', 'director', 'Director & Producer', 1
),

-- ── Daniel Oriahi ────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000004',
    (SELECT id FROM movies WHERE slug = 'mimi-2025'),
    'movie', 'director', 'Director', 1
),
(
    '20000000-0000-0000-0000-000000000004',
    'b26a9368-88a8-44dd-a616-1787cd569ec2',  -- Stalker
    'movie', 'director', 'Director', 2
),

-- ── Sola Sobowale ─────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000005',
    '0d663d7e-6ec2-4de7-93c8-51c4d339a040',  -- King Of Boys
    'movie', 'actor', 'Alhaja Eniola Salami', 1
),
(
    '20000000-0000-0000-0000-000000000005',
    '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1',  -- House of Ga'a
    'movie', 'actor', 'Supporting Lead', 2
),

-- ── Tobi Bakre ────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000006',
    'ffd4a6ef-cc08-4230-bbb9-64a454bd9349',  -- Gangs of Lagos 2
    'movie', 'actor', 'Lead Role', 1
),
(
    '20000000-0000-0000-0000-000000000006',
    (SELECT id FROM movies WHERE slug = 'a-tribe-called-judah-2'),
    'movie', 'actor', 'Lead Role', 2
),

-- ── Bimbo Ademoye ────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000007',
    (SELECT id FROM movies WHERE slug = 'mimi-2025'),
    'movie', 'actor', 'Mimi', 1
),
(
    '20000000-0000-0000-0000-000000000007',
    (SELECT id FROM movies WHERE slug = 'love-at-a-cost'),
    'movie', 'actor', 'Lead Role', 2
),

-- ── Keppy Ekpeyong ───────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000008',
    '057dd5a2-fb32-4f02-a4c4-d7657ed35ac1',  -- House of Ga'a
    'movie', 'actor', 'Ga''a', 1
),

-- ── Tems ──────────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000009',
    (SELECT id FROM music WHERE slug = 'tems-try-me'),
    'music', 'musician', 'Lead Artist & Songwriter', 1
),

-- ── Davido ────────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000010',
    (SELECT id FROM music WHERE slug = 'davido-a-good-time'),
    'music', 'musician', 'Lead Artist', 1
),
(
    '20000000-0000-0000-0000-000000000010',
    (SELECT id FROM music WHERE slug = 'unavailable-vol-2'),
    'music', 'musician', 'Lead Artist', 2
),

-- ── Tiwa Savage ───────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000011',
    (SELECT id FROM music WHERE slug = 'tiwa-savage-49-99'),
    'music', 'musician', 'Lead Artist & Co-writer', 1
),

-- ── Blaqbonez ────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000012',
    (SELECT id FROM music WHERE slug = 'blaqbonez-mr-boombastic'),
    'music', 'musician', 'Lead Artist & Sole Writer', 1
),

-- ── Niyi Akinmolayan ─────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000014',
    (SELECT id FROM movies WHERE slug = 'the-arbitration'),
    'movie', 'director', 'Director', 1
),
(
    '20000000-0000-0000-0000-000000000014',
    (SELECT id FROM movies WHERE slug = 'baby-police'),
    'movie', 'producer', 'Executive Producer', 2
),

-- ── Falz ──────────────────────────────────────────────────────────────────────
(
    '20000000-0000-0000-0000-000000000015',
    (SELECT id FROM music WHERE slug = 'boj-falz-ajebutter22-make-e-no-cause-fight-ii'),
    'music', 'musician', 'Featured Artist', 1
)
ON CONFLICT ON CONSTRAINT uq_pcredits_person_content_role DO NOTHING;

-- ─── SECTION 7: FEATURED FLAGS ────────────────────────────────────────────────

UPDATE persons SET is_featured = TRUE
WHERE slug IN (
    'jade-osiberu',
    'kemi-adetiba',
    'sola-sobowale',
    'tobi-bakre',
    'tems',
    'davido',
    'tiwa-savage'
);

-- ─── SECTION 8: VERIFY COUNTS ─────────────────────────────────────────────────
-- Run these manually after migration to verify data integrity.
-- SELECT COUNT(*) FROM battles;            -- expect 4
-- SELECT COUNT(*) FROM persons;            -- expect 15
-- SELECT COUNT(*) FROM person_credits;     -- expect ~20
-- SELECT COUNT(*) FROM battle_content_log; -- expect 8
-- SELECT task_name, status, last_run_at FROM task_metadata;
-- SELECT id, votes_a, votes_b FROM battles WHERE status = 'active';
-- SELECT slug, street_pull_score, snippet_plays FROM music ORDER BY street_pull_score DESC;
-- SELECT slug, street_pull_score FROM movies ORDER BY street_pull_score DESC;