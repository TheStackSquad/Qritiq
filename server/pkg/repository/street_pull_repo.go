// server/pkg/repository/street_pull_repo.go

package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type StreetPullRepo struct {
	db *sqlx.DB
}

func NewStreetPullRepo(db *sqlx.DB) *StreetPullRepo {
	return &StreetPullRepo{db: db}
}

// ─── Fetch for computation ────────────────────────────────────────────────────

// GetMovieInputs fetches all movies that need street_pull_score recomputation.
// Returns movies whose engagement counts have changed since last score update.
// In practice this is all non-archived movies — the score is cheap to compute.
func (r *StreetPullRepo) GetMovieInputs(ctx context.Context) ([]*model.StreetPullInput, error) {
	const q = `
		SELECT
			id,
			'movie'          AS content_type,
			total_views,
			total_likes,
			snippet_plays,
			total_hype_votes,
			total_ratings
		FROM movies
		WHERE status != 'archived'
		ORDER BY updated_at DESC`

	var inputs []*model.StreetPullInput
	if err := r.db.SelectContext(ctx, &inputs, q); err != nil {
		return nil, fmt.Errorf("street_pull_repo: get_movie_inputs: %w", err)
	}
	return inputs, nil
}

// GetMusicInputs fetches all music tracks that need recomputation.
func (r *StreetPullRepo) GetMusicInputs(ctx context.Context) ([]*model.StreetPullInput, error) {
	const q = `
		SELECT
			id,
			'music'          AS content_type,
			total_views,
			total_likes,
			snippet_plays,
			total_hype_votes,
			total_ratings
		FROM music
		WHERE status != 'archived'
		ORDER BY updated_at DESC`

	var inputs []*model.StreetPullInput
	if err := r.db.SelectContext(ctx, &inputs, q); err != nil {
		return nil, fmt.Errorf("street_pull_repo: get_music_inputs: %w", err)
	}
	return inputs, nil
}

// GetSingleInput fetches the street pull inputs for one content item.
// Called after an engagement or rating event to recompute that item only.
// This is the hot-path version — only touches one row.
func (r *StreetPullRepo) GetSingleInput(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) (*model.StreetPullInput, error) {
	var q string
	switch contentType {
	case "movie":
		q = `
			SELECT id, 'movie' AS content_type,
				total_views, total_likes, snippet_plays,
				total_hype_votes, total_ratings
			FROM movies WHERE id = $1`
	case "music":
		q = `
			SELECT id, 'music' AS content_type,
				total_views, total_likes, snippet_plays,
				total_hype_votes, total_ratings
			FROM music WHERE id = $1`
	default:
		return nil, fmt.Errorf("street_pull_repo: get_single_input: unknown type %q", contentType)
	}

	var input model.StreetPullInput
	if err := r.db.GetContext(ctx, &input, q, contentID); err != nil {
		return nil, fmt.Errorf("street_pull_repo: get_single_input: %w", err)
	}
	return &input, nil
}

// ─── Write-back ───────────────────────────────────────────────────────────────

// UpdateMovieScore writes a computed street_pull_score back to a movie row.
func (r *StreetPullRepo) UpdateMovieScore(
	ctx context.Context,
	contentID uuid.UUID,
	score float64,
) error {
	const q = `
		UPDATE movies
		SET street_pull_score = $1
		WHERE id = $2`

	if _, err := r.db.ExecContext(ctx, q, score, contentID); err != nil {
		return fmt.Errorf("street_pull_repo: update_movie_score: %w", err)
	}
	return nil
}

// UpdateMusicScore writes a computed street_pull_score back to a music row.
func (r *StreetPullRepo) UpdateMusicScore(
	ctx context.Context,
	contentID uuid.UUID,
	score float64,
) error {
	const q = `
		UPDATE music
		SET street_pull_score = $1
		WHERE id = $2`

	if _, err := r.db.ExecContext(ctx, q, score, contentID); err != nil {
		return fmt.Errorf("street_pull_repo: update_music_score: %w", err)
	}
	return nil
}

// UpdateScore routes to the correct table based on content_type.
// Convenience method used by the service after calling input.Compute().
func (r *StreetPullRepo) UpdateScore(
	ctx context.Context,
	update *model.StreetPullUpdate,
) error {
	switch update.ContentType {
	case "movie":
		return r.UpdateMovieScore(ctx, update.ContentID, update.StreetPullScore)
	case "music":
		return r.UpdateMusicScore(ctx, update.ContentID, update.StreetPullScore)
	default:
		return fmt.Errorf("street_pull_repo: update_score: unknown type %q", update.ContentType)
	}
}

// BulkUpdateMovieScores updates street_pull_score for all movies in one
// batch using unnest — avoids N individual UPDATE calls.
// Called by the full recomputation worker that runs nightly.
func (r *StreetPullRepo) BulkUpdateMovieScores(
	ctx context.Context,
	updates []*model.StreetPullUpdate,
) error {
	if len(updates) == 0 {
		return nil
	}

	ids := make([]uuid.UUID, len(updates))
	scores := make([]float64, len(updates))
	for i, u := range updates {
		ids[i] = u.ContentID
		scores[i] = u.StreetPullScore
	}

	const q = `
		UPDATE movies AS m
		SET street_pull_score = u.score
		FROM (
			SELECT unnest($1::uuid[]) AS id, unnest($2::numeric[]) AS score
		) AS u
		WHERE m.id = u.id`

	if _, err := r.db.ExecContext(ctx, q, ids, scores); err != nil {
		return fmt.Errorf("street_pull_repo: bulk_update_movie_scores: %w", err)
	}
	return nil
}

// BulkUpdateMusicScores updates street_pull_score for all music in one batch.
func (r *StreetPullRepo) BulkUpdateMusicScores(
	ctx context.Context,
	updates []*model.StreetPullUpdate,
) error {
	if len(updates) == 0 {
		return nil
	}

	ids := make([]uuid.UUID, len(updates))
	scores := make([]float64, len(updates))
	for i, u := range updates {
		ids[i] = u.ContentID
		scores[i] = u.StreetPullScore
	}

	const q = `
		UPDATE music AS m
		SET street_pull_score = u.score
		FROM (
			SELECT unnest($1::uuid[]) AS id, unnest($2::numeric[]) AS score
		) AS u
		WHERE m.id = u.id`

	if _, err := r.db.ExecContext(ctx, q, ids, scores); err != nil {
		return fmt.Errorf("street_pull_repo: bulk_update_music_scores: %w", err)
	}
	return nil
}

// ─── Snippet play increment ───────────────────────────────────────────────────

// IncrementSnippetPlays increments snippet_plays on a music row by 1.
// Called by POST /music/:slug/play.
// Does NOT update street_pull_score inline — the service triggers
// a lightweight recompute via GetSingleInput + UpdateScore after this.
func (r *StreetPullRepo) IncrementSnippetPlays(
	ctx context.Context,
	musicID uuid.UUID,
) error {
	const q = `
		UPDATE music
		SET snippet_plays = snippet_plays + 1
		WHERE id = $1`

	if _, err := r.db.ExecContext(ctx, q, musicID); err != nil {
		return fmt.Errorf("street_pull_repo: increment_snippet_plays: %w", err)
	}
	return nil
}