//sever/pkg/repository/movie_repo.go

package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type MovieRepo struct {
	db *sqlx.DB
}

func NewMovieRepo(db *sqlx.DB) *MovieRepo {
	return &MovieRepo{db: db}
}

// GetBySlug fetches a full movie record by its URL slug.
// Used on movie detail page — returns everything.
func (r *MovieRepo) GetBySlug(ctx context.Context, slug string) (*model.Movie, error) {
	const q = `SELECT * FROM movies WHERE slug = $1 AND status != 'archived'`
	var m model.Movie
	if err := r.db.GetContext(ctx, &m, q, slug); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("movie_repo: get_by_slug: %w", err)
	}
	return &m, nil
}

// GetByID fetches a full movie record by primary key.
func (r *MovieRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Movie, error) {
	const q = `SELECT * FROM movies WHERE id = $1`
	var m model.Movie
	if err := r.db.GetContext(ctx, &m, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("movie_repo: get_by_id: %w", err)
	}
	return &m, nil
}

// ListByStatus returns paginated movies for a given status (home page / browse).
// Ordered by hype_score DESC so hottest content is always first.
func (r *MovieRepo) ListByStatus(ctx context.Context, status model.ContentStatus, limit, offset int) ([]*model.Movie, error) {
	const q = `
		SELECT * FROM movies
		WHERE status = $1
		ORDER BY hype_score DESC, created_at DESC
		LIMIT $2 OFFSET $3`

	var movies []*model.Movie
	if err := r.db.SelectContext(ctx, &movies, q, status, limit, offset); err != nil {
		return nil, fmt.Errorf("movie_repo: list_by_status: %w", err)
	}
	return movies, nil
}

// ListAll returns paginated movies of any active status.
func (r *MovieRepo) ListAll(ctx context.Context, limit, offset int) ([]*model.Movie, error) {
	const q = `
		SELECT * FROM movies
		WHERE status != 'archived'
		ORDER BY is_featured DESC, hype_score DESC, created_at DESC
		LIMIT $1 OFFSET $2`

	var movies []*model.Movie
	if err := r.db.SelectContext(ctx, &movies, q, limit, offset); err != nil {
		return nil, fmt.Errorf("movie_repo: list_all: %w", err)
	}
	return movies, nil
}

// server/pkg/repository/movie_repo.go

// Search uses the GIN trigram index via the % operator for index-compatible
// fuzzy matching. similarity() in SELECT is kept for sort order only —
// it does not affect index usage.
// At small row counts Postgres correctly chooses a seq scan over the GIN index;
// the planner will switch automatically as the table grows past ~500 rows.
// server/pkg/repository/movie_repo.go

func (r *MovieRepo) Search(ctx context.Context, query string, limit int) ([]*model.SearchResult, error) {
	const q = `
		SELECT
			id,
			title,
			slug,
			status,
			poster_url,
			genre,
			hype_score,
			rating_score,
			release_date
		FROM movies
		WHERE status != 'archived'
		  AND title % $1
		ORDER BY similarity(title, $1) DESC, hype_score DESC
		LIMIT $2`

	var results []*model.SearchResult
	if err := r.db.SelectContext(ctx, &results, q, query, limit); err != nil {
		return nil, fmt.Errorf("movie_repo: search: %w", err)
	}
	return results, nil
}

// Create inserts a new movie record.
func (r *MovieRepo) Create(ctx context.Context, input *model.CreateMovieInput, slug string, creatorID *uuid.UUID) (*model.Movie, error) {
	const q = `
		INSERT INTO movies (title, slug, description, release_date, status, poster_url, trailer_url,
		                    genre, production_company, director, cast_list, creator_id)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
		RETURNING *`

	var releaseDate *time.Time
	if input.ReleaseDate != "" {
		t, err := time.Parse("2006-01-02", input.ReleaseDate)
		if err != nil {
			return nil, fmt.Errorf("movie_repo: invalid release_date: %w", err)
		}
		releaseDate = &t
	}

	status := model.ContentStatus(input.Status)
	if status == "" {
		status = model.StatusPreRelease
	}

	var m model.Movie
	err := r.db.GetContext(ctx, &m, q,
		input.Title, slug, nullString(input.Description), releaseDate,
		status, nullString(input.PosterURL), nullString(input.TrailerURL),
		nullString(input.Genre), nullString(input.ProductionCompany),
		nullString(input.Director), input.CastList, creatorID,
	)
	if err != nil {
		return nil, fmt.Errorf("movie_repo: create: %w", err)
	}
	return &m, nil
}

// IncrementViews atomically increments the view counter.
// Called on every movie detail page load (debounced at service layer).
func (r *MovieRepo) IncrementViews(ctx context.Context, id uuid.UUID) error {
	const q = `UPDATE movies SET total_views = total_views + 1 WHERE id = $1`
	if _, err := r.db.ExecContext(ctx, q, id); err != nil {
		return fmt.Errorf("movie_repo: increment_views: %w", err)
	}
	return nil
}

// GetByCreator returns all movies registered by a creator (for their dashboard).
func (r *MovieRepo) GetByCreator(ctx context.Context, creatorID uuid.UUID) ([]*model.Movie, error) {
	const q = `
		SELECT * FROM movies
		WHERE creator_id = $1
		ORDER BY created_at DESC`

	var movies []*model.Movie
	if err := r.db.SelectContext(ctx, &movies, q, creatorID); err != nil {
		return nil, fmt.Errorf("movie_repo: get_by_creator: %w", err)
	}
	return movies, nil
}

// GetTrending returns the top N movies by hype_score (competitor benchmarking).
func (r *MovieRepo) GetTrending(ctx context.Context, limit int) ([]*model.Movie, error) {
	const q = `
		SELECT * FROM movies
		WHERE status != 'archived'
		ORDER BY hype_score DESC
		LIMIT $1`

	var movies []*model.Movie
	if err := r.db.SelectContext(ctx, &movies, q, limit); err != nil {
		return nil, fmt.Errorf("movie_repo: get_trending: %w", err)
	}
	return movies, nil
}

// helpers
func nullString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}