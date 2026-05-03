// server/pkg/repository/analytics_repo.go
package repository

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type AnalyticsRepository struct {
	db *sqlx.DB
}

func NewAnalyticsRepository(db *sqlx.DB) *AnalyticsRepository {
	return &AnalyticsRepository{db: db}
}

// ─── DashboardPayload is the full shape returned to the partner dashboard ─────

type DashboardPayload struct {
	Movie       *model.Movie              `json:"movie"`
	Stats       DashboardStats            `json:"stats"`
	Demography  model.DemographyBreakdown `json:"demography"`
	Snapshots   []*model.AnalyticsSnapshot `json:"snapshots"`
	Competitors []*model.Movie            `json:"competitors"`
}

type DashboardStats struct {
	TotalViews    int     `json:"total_views"    db:"total_views"`
	TotalLikes    int     `json:"total_likes"    db:"total_likes"`
	TotalDislikes int     `json:"total_dislikes" db:"total_dislikes"`
	TotalHype     int     `json:"total_hype"     db:"total_hype_votes"`
	TotalRatings  int     `json:"total_ratings"  db:"total_ratings"`
	HypeScore     float64 `json:"hype_score"     db:"hype_score"`
	RatingScore   float64 `json:"rating_score"   db:"rating_score"`
}

// GetDashboardMetrics fetches the full dashboard payload for one movie.
// Verifies creator ownership before returning data.
func (r *AnalyticsRepository) GetDashboardMetrics(
	ctx context.Context,
	movieID uuid.UUID,
	creatorID uuid.UUID,
) (*DashboardPayload, error) {

	// ── 1. Fetch the movie and verify ownership ────────────────────────────
	const movieQ = `
		SELECT * FROM movies
		WHERE id = $1 AND creator_id = (
			SELECT id FROM creators WHERE user_id = $2
		)`

	var movie model.Movie
	if err := r.db.GetContext(ctx, &movie, movieQ, movieID, creatorID); err != nil {
		return nil, fmt.Errorf("analytics_repo: movie not found or access denied: %w", err)
	}

	// ── 2. Pull aggregate stats directly from the movie row ────────────────
	stats := DashboardStats{
		TotalViews:    movie.TotalViews,
		TotalLikes:    movie.TotalLikes,
		TotalDislikes: movie.TotalDislikes,
		TotalHype:     movie.TotalHypeVotes,
		TotalRatings:  movie.TotalRatings,
		HypeScore:     movie.HypeScore,
		RatingScore:   movie.RatingScore,
	}

	// ── 3. City demography from engagements ───────────────────────────────
	const demoQ = `
		SELECT
			COUNT(*) FILTER (WHERE city = 'Lagos')         AS lagos_count,
			COUNT(*) FILTER (WHERE city = 'Abuja')         AS abuja_count,
			COUNT(*) FILTER (WHERE city = 'Enugu')         AS enugu_count,
			COUNT(*) FILTER (WHERE city = 'Kano')          AS kano_count,
			COUNT(*) FILTER (WHERE city = 'Port Harcourt') AS ph_count,
			COUNT(*) FILTER (WHERE city NOT IN (
				'Lagos','Abuja','Enugu','Kano','Port Harcourt'
			) OR city IS NULL)                              AS other_count,
			COUNT(*)                                        AS total_count
		FROM engagements
		WHERE content_id = $1 AND content_type = 'movie'`

	var raw struct {
		LagosCount int `db:"lagos_count"`
		AbujaCount int `db:"abuja_count"`
		EnuguCount int `db:"enugu_count"`
		KanoCount  int `db:"kano_count"`
		PHCount    int `db:"ph_count"`
		OtherCount int `db:"other_count"`
		TotalCount int `db:"total_count"`
	}
	if err := r.db.GetContext(ctx, &raw, demoQ, movieID); err != nil {
		return nil, fmt.Errorf("analytics_repo: demography query failed: %w", err)
	}

	pct := func(count int) float64 {
		if raw.TotalCount == 0 {
			return 0
		}
		return float64(count) / float64(raw.TotalCount) * 100
	}

	demography := model.DemographyBreakdown{
		Lagos:        model.CityDataPoint{City: "Lagos",        Count: raw.LagosCount, Percentage: pct(raw.LagosCount)},
		Abuja:        model.CityDataPoint{City: "Abuja",        Count: raw.AbujaCount, Percentage: pct(raw.AbujaCount)},
		Enugu:        model.CityDataPoint{City: "Enugu",        Count: raw.EnuguCount, Percentage: pct(raw.EnuguCount)},
		Kano:         model.CityDataPoint{City: "Kano",         Count: raw.KanoCount,  Percentage: pct(raw.KanoCount)},
		PortHarcourt: model.CityDataPoint{City: "Port Harcourt",Count: raw.PHCount,    Percentage: pct(raw.PHCount)},
		Other:        model.CityDataPoint{City: "Other",        Count: raw.OtherCount, Percentage: pct(raw.OtherCount)},
	}

	// ── 4. Last 30 days of snapshots ───────────────────────────────────────
	const snapQ = `
		SELECT * FROM analytics_snapshots
		WHERE content_id = $1 AND content_type = 'movie'
		  AND snapshot_date >= CURRENT_DATE - '30 days'::INTERVAL
		ORDER BY snapshot_date ASC`

	var snapshots []*model.AnalyticsSnapshot
	if err := r.db.SelectContext(ctx, &snapshots, snapQ, movieID); err != nil {
		return nil, fmt.Errorf("analytics_repo: snapshots query failed: %w", err)
	}

	// ── 5. Competitor benchmarking — top 5 movies by hype_score ───────────
	const compQ = `
		SELECT * FROM movies
		WHERE status != 'archived'
		ORDER BY hype_score DESC
		LIMIT 5`

	var competitors []*model.Movie
	if err := r.db.SelectContext(ctx, &competitors, compQ); err != nil {
		return nil, fmt.Errorf("analytics_repo: competitors query failed: %w", err)
	}

	return &DashboardPayload{
		Movie:       &movie,
		Stats:       stats,
		Demography:  demography,
		Snapshots:   snapshots,
		Competitors: competitors,
	}, nil
}

// GetMoviesByCreator fetches all movies belonging to a creator user.
// Joins via creators table since movies.creator_id references creators.id.
func (r *AnalyticsRepository) GetMoviesByCreator(
	ctx context.Context,
	creatorUserID uuid.UUID,
) ([]model.Movie, error) {
	const q = `
		SELECT m.* FROM movies m
		INNER JOIN creators c ON c.id = m.creator_id
		WHERE c.user_id = $1
		ORDER BY m.created_at DESC`

	var movies []model.Movie
	if err := r.db.SelectContext(ctx, &movies, q, creatorUserID); err != nil {
		return nil, fmt.Errorf("analytics_repo: get_movies_by_creator: %w", err)
	}
	return movies, nil
}

// GetSnapshots returns daily snapshots for a trend chart (last N days).
func (r *AnalyticsRepository) GetSnapshots(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
	days int,
) ([]*model.AnalyticsSnapshot, error) {
	const q = `
		SELECT * FROM analytics_snapshots
		WHERE content_id = $1 AND content_type = $2
		  AND snapshot_date >= CURRENT_DATE - ($3 || ' days')::INTERVAL
		ORDER BY snapshot_date ASC`

	var snaps []*model.AnalyticsSnapshot
	if err := r.db.SelectContext(ctx, &snaps, q, contentID, contentType, days); err != nil {
		return nil, fmt.Errorf("analytics_repo: get_snapshots: %w", err)
	}
	return snaps, nil
}

// UpsertSnapshot writes or updates a daily snapshot record.
func (r *AnalyticsRepository) UpsertSnapshot(
	ctx context.Context,
	s *model.AnalyticsSnapshot,
) error {
	const q = `
		INSERT INTO analytics_snapshots
			(content_id, content_type, snapshot_date,
			 total_views, total_likes, total_dislikes,
			 total_hype, total_meh, total_flop, hype_score,
			 lagos_count, abuja_count, enugu_count,
			 kano_count, ph_count, other_count)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
		ON CONFLICT (content_id, content_type, snapshot_date)
		DO UPDATE SET
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
			other_count    = EXCLUDED.other_count`

	_, err := r.db.ExecContext(ctx, q,
		s.ContentID, s.ContentType, s.SnapshotDate,
		s.TotalViews, s.TotalLikes, s.TotalDislikes,
		s.TotalHype, s.TotalMeh, s.TotalFlop, s.HypeScore,
		s.LagosCount, s.AbujaCount, s.EnuguCount,
		s.KanoCount, s.PHCount, s.OtherCount,
	)
	return err
}