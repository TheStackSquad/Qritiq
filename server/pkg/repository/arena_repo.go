// server/pkg/repository/arena_repo.go

package repository

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type ArenaRepo struct {
	db *sqlx.DB
}

func NewArenaRepo(db *sqlx.DB) *ArenaRepo {
	return &ArenaRepo{db: db}
}

// ─── Arena Page Payload ───────────────────────────────────────────────────────

// GetArenaPayload returns the full payload for GET /arena in one method.
// Runs three queries sequentially — active battles, recent history, leaderboard.
// The service layer splits the active battles into movies/music slices.
func (r *ArenaRepo) GetArenaPayload(
	ctx context.Context,
	historyLimit int,
) (*ArenaPayload, error) {
	payload := &ArenaPayload{}
	battleRepo := NewBattleRepo(r.db)

	// Active battles — all content types
	active, err := battleRepo.GetAllActive(ctx)
	if err != nil {
		return nil, fmt.Errorf("arena_repo: get_arena_payload active: %w", err)
	}
	payload.ActiveBattles = active

	// Completed battles — most recent per type
	completed, err := battleRepo.GetAllCompleted(ctx, historyLimit)
	if err != nil {
		return nil, fmt.Errorf("arena_repo: get_arena_payload completed: %w", err)
	}
	payload.CompletedBattles = completed

	// Street Pull leaderboard — top 20 across movies and music
	leaderboard, err := r.GetStreetPullLeaderboard(ctx, 20)
	if err != nil {
		return nil, fmt.Errorf("arena_repo: get_arena_payload leaderboard: %w", err)
	}
	payload.Leaderboard = leaderboard

	return payload, nil
}

// ArenaPayload is the full shape returned to GET /arena.
type ArenaPayload struct {
	ActiveBattles    []*model.Battle          `json:"active_battles"`
	CompletedBattles []*model.Battle          `json:"completed_battles"`
	Leaderboard      []*model.StreetPullEntry `json:"leaderboard"`
}

// ─── Street Pull Leaderboard ──────────────────────────────────────────────────

// GetStreetPullLeaderboard returns the top N content by street_pull_score
// across both movies and music. Used in the Arena page sidebar and as the
// basis for the Top Rated / Certified replacement feature.
func (r *ArenaRepo) GetStreetPullLeaderboard(
	ctx context.Context,
	limit int,
) ([]*model.StreetPullEntry, error) {
	const q = `
		SELECT
			id::TEXT,
			'movie' AS content_type,
			title,
			slug,
			poster_url    AS image_url,
			genre,
			hype_score,
			rating_score,
			street_pull_score,
			total_views,
			total_likes,
			snippet_plays,
			total_hype_votes,
			total_ratings
		FROM movies
		WHERE status != 'archived'
		  AND street_pull_score > 0

		UNION ALL

		SELECT
			id::TEXT,
			'music' AS content_type,
			title,
			slug,
			cover_url     AS image_url,
			genre,
			hype_score,
			rating_score,
			street_pull_score,
			total_views,
			total_likes,
			snippet_plays,
			total_hype_votes,
			total_ratings
		FROM music
		WHERE status != 'archived'
		  AND street_pull_score > 0

		ORDER BY street_pull_score DESC
		LIMIT $1`

	var entries []*model.StreetPullEntry
	if err := r.db.SelectContext(ctx, &entries, q, limit); err != nil {
		return nil, fmt.Errorf("arena_repo: get_street_pull_leaderboard: %w", err)
	}

	// Assign rank after fetch — not computed in SQL to keep query simple
	for i, e := range entries {
		e.Rank = i + 1
	}

	return entries, nil
}

// GetStreetPullByType returns the leaderboard filtered by content type.
// Used when the client requests separate movie vs music rankings.
func (r *ArenaRepo) GetStreetPullByType(
	ctx context.Context,
	contentType string,
	limit int,
) ([]*model.StreetPullEntry, error) {
	var q string

	switch contentType {
	case "movie":
		q = `
			SELECT
				id::TEXT,
				'movie' AS content_type,
				title, slug,
				poster_url AS image_url,
				genre, hype_score, rating_score,
				street_pull_score, total_views, total_likes,
				snippet_plays, total_hype_votes, total_ratings
			FROM movies
			WHERE status != 'archived'
			  AND street_pull_score > 0
			ORDER BY street_pull_score DESC
			LIMIT $1`
	case "music":
		q = `
			SELECT
				id::TEXT,
				'music' AS content_type,
				title, slug,
				cover_url AS image_url,
				genre, hype_score, rating_score,
				street_pull_score, total_views, total_likes,
				snippet_plays, total_hype_votes, total_ratings
			FROM music
			WHERE status != 'archived'
			  AND street_pull_score > 0
			ORDER BY street_pull_score DESC
			LIMIT $1`
	default:
		return nil, fmt.Errorf("arena_repo: get_street_pull_by_type: unknown type %q", contentType)
	}

	var entries []*model.StreetPullEntry
	if err := r.db.SelectContext(ctx, &entries, q, limit); err != nil {
		return nil, fmt.Errorf("arena_repo: get_street_pull_by_type: %w", err)
	}

	for i, e := range entries {
		e.Rank = i + 1
	}

	return entries, nil
}

// ─── City breakdown for Arena ─────────────────────────────────────────────────

// GetCityBattleStats returns how each city has voted across all battles.
// Powers the "City Pulse" analytics view on the Arena page.
// Shows which cities are most engaged with battles overall.
func (r *ArenaRepo) GetCityBattleStats(ctx context.Context) ([]*CityBattleStat, error) {
	const q = `
		SELECT
			city,
			COUNT(*)                                      AS total_votes,
			COUNT(*) FILTER (WHERE engagement_type = 'hype') AS votes_a,
			COUNT(*) FILTER (WHERE engagement_type = 'flop') AS votes_b
		FROM engagements
		WHERE content_type = 'battle'
		  AND city IS NOT NULL
		GROUP BY city
		ORDER BY total_votes DESC`

	var stats []*CityBattleStat
	if err := r.db.SelectContext(ctx, &stats, q); err != nil {
		return nil, fmt.Errorf("arena_repo: get_city_battle_stats: %w", err)
	}
	return stats, nil
}

// CityBattleStat is the per-city engagement breakdown for the Arena pulse view.
type CityBattleStat struct {
	City       string `db:"city"        json:"city"`
	TotalVotes int    `db:"total_votes" json:"total_votes"`
	VotesA     int    `db:"votes_a"     json:"votes_a"`
	VotesB     int    `db:"votes_b"     json:"votes_b"`
}