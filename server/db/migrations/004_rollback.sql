-- =============================================================
-- KritiQ Rollback — 004_rollback.sql
-- Run this FIRST to clean up the partial 004 run,
-- then rerun 004_schema_additions.sql and 005_seed_arena_spotlight.sql
-- =============================================================

-- Drop triggers first (depend on functions)
DROP TRIGGER IF EXISTS trg_refresh_battle_votes   ON engagements;
DROP TRIGGER IF EXISTS trg_refresh_person_scores  ON person_credits;
DROP TRIGGER IF EXISTS trg_battles_updated_at     ON battles;
DROP TRIGGER IF EXISTS trg_task_metadata_updated_at ON task_metadata;
DROP TRIGGER IF EXISTS trg_persons_updated_at     ON persons;

-- Drop views
DROP VIEW IF EXISTS vw_eligible_movies;
DROP VIEW IF EXISTS vw_eligible_music;

-- Drop tables (order respects FK dependencies)
DROP TABLE IF EXISTS person_credits;
DROP TABLE IF EXISTS persons;
DROP TABLE IF EXISTS battle_content_log;
DROP TABLE IF EXISTS battles;
DROP TABLE IF EXISTS task_metadata;

-- Drop functions
DROP FUNCTION IF EXISTS fn_refresh_battle_votes();
DROP FUNCTION IF EXISTS fn_refresh_person_scores();
DROP FUNCTION IF EXISTS fn_compute_street_pull(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS fn_refresh_all_street_pull();
DROP FUNCTION IF EXISTS fn_clear_zombie_task_locks();
DROP FUNCTION IF EXISTS fn_claim_task(VARCHAR, INTERVAL);
DROP FUNCTION IF EXISTS fn_complete_task(VARCHAR);
DROP FUNCTION IF EXISTS fn_fail_task(VARCHAR, TEXT);

-- Revert column additions (safe — IF EXISTS guards)
ALTER TABLE movies DROP COLUMN IF EXISTS snippet_plays;
ALTER TABLE movies DROP COLUMN IF EXISTS street_pull_score;
ALTER TABLE music  DROP COLUMN IF EXISTS snippet_plays;
ALTER TABLE music  DROP COLUMN IF EXISTS street_pull_score;

-- Revert index additions
DROP INDEX IF EXISTS idx_movies_street_pull;
DROP INDEX IF EXISTS idx_music_street_pull;
DROP INDEX IF EXISTS idx_movies_snippet_plays;
DROP INDEX IF EXISTS idx_music_snippet_plays;
DROP INDEX IF EXISTS idx_movies_genre_hype;
DROP INDEX IF EXISTS idx_music_genre_hype;
DROP INDEX IF EXISTS idx_snapshots_city_pull;
DROP INDEX IF EXISTS idx_engagements_battle_city;
DROP INDEX IF EXISTS idx_persons_slug;
DROP INDEX IF EXISTS idx_persons_role;
DROP INDEX IF EXISTS idx_persons_featured;
DROP INDEX IF EXISTS idx_persons_hype;
DROP INDEX IF EXISTS idx_persons_name_trgm;
DROP INDEX IF EXISTS idx_pcredits_person;
DROP INDEX IF EXISTS idx_pcredits_content;
DROP INDEX IF EXISTS idx_pcredits_role;
DROP INDEX IF EXISTS uq_pcredits_person_content_role;
DROP INDEX IF EXISTS idx_bcl_type_last;

-- Revert constraint changes (restore originals)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('guest','user','creator','pro','admin'));

ALTER TABLE ratings DROP COLUMN IF EXISTS role;

ALTER TABLE engagements DROP CONSTRAINT IF EXISTS engagements_content_type_check;
ALTER TABLE engagements ADD CONSTRAINT engagements_content_type_check
    CHECK (content_type IN ('movie','music'));

ALTER TABLE engagements DROP CONSTRAINT IF EXISTS engagements_engagement_type_check;
ALTER TABLE engagements ADD CONSTRAINT engagements_engagement_type_check
    CHECK (engagement_type IN ('like','dislike','hype','meh','flop','watch'));

SELECT 'Rollback complete. Ready to rerun 004_schema_additions.sql' AS status;