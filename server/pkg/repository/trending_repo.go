//server/pkg/repository/trending_repo.go

package repository

import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type TrendingRepo struct {
	db *sqlx.DB
}

func NewTrendingRepo(db *sqlx.DB) *TrendingRepo {
	return &TrendingRepo{db: db}
}

// GetHypeRadar returns movies ordered by the absolute size of their
// 7-day hype_score delta. Movies with no snapshot default to delta=0
// and are excluded by the hype_score > 0 filter — no division by zero,
// no noise from un-seeded content.
func (r *TrendingRepo) GetHypeRadar(ctx context.Context, limit int) ([]*model.HypeRadarItem, error) {
	const q = `
		SELECT
			m.id,
			m.title,
			m.slug,
			m.genre,
			m.status,
			m.hype_score                                                       AS current_score,
			m.total_hype_votes                                                 AS total_votes,
			ROUND(
				m.hype_score - COALESCE(snap.hype_score, m.hype_score), 2
			)                                                                  AS weekly_delta
		FROM movies m
		LEFT JOIN analytics_snapshots snap
			ON  snap.content_id   = m.id
			AND snap.content_type = 'movie'
			AND snap.snapshot_date = CURRENT_DATE - INTERVAL '7 days'
		WHERE m.status != 'archived'
		  AND m.hype_score > 0
		ORDER BY ABS(
			m.hype_score - COALESCE(snap.hype_score, m.hype_score)
		) DESC
		LIMIT $1`

	var items []*model.HypeRadarItem
	if err := r.db.SelectContext(ctx, &items, q, limit); err != nil {
		return nil, fmt.Errorf("trending_repo: hype_radar: %w", err)
	}
	return items, nil
}

// GetVerdictSplit returns movies that have BOTH critic and user ratings,
// ordered by the size of the gap between the two groups.
// Score is normalised from 1–5 to 0–100 (× 20) to match component expectations.
// Movies with only one role type are excluded via HAVING — no misleading splits.
func (r *TrendingRepo) GetVerdictSplit(ctx context.Context, limit int) ([]*model.VerdictSplitItem, error) {
	const q = `
		SELECT
			m.id,
			m.title,
			m.slug,
			m.status,
			m.total_ratings                                                        AS total_votes,
			ROUND(AVG(r.score) FILTER (WHERE r.role = 'critic') * 20, 1)          AS critic_score,
			ROUND(AVG(r.score) FILTER (WHERE r.role = 'user')   * 20, 1)          AS street_score
		FROM movies m
		INNER JOIN ratings r
			ON  r.content_id   = m.id
			AND r.content_type = 'movie'
		WHERE m.status != 'archived'
		GROUP BY m.id, m.title, m.slug, m.status, m.total_ratings
		HAVING
			COUNT(r.id) FILTER (WHERE r.role = 'critic') > 0
			AND COUNT(r.id) FILTER (WHERE r.role = 'user') > 0
		ORDER BY ABS(
			AVG(r.score) FILTER (WHERE r.role = 'user') -
			AVG(r.score) FILTER (WHERE r.role = 'critic')
		) DESC
		LIMIT $1`

	var items []*model.VerdictSplitItem
	if err := r.db.SelectContext(ctx, &items, q, limit); err != nil {
		return nil, fmt.Errorf("trending_repo: verdict_split: %w", err)
	}
	return items, nil
}