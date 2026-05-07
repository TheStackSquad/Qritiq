// server/pkg/repository/engagement_repo.go

package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

// ─── Repo ───────────────────────────────────────────────────────────────

type EngagementRepo struct {
	db *sqlx.DB
}

func NewEngagementRepo(db *sqlx.DB) *EngagementRepo {
	return &EngagementRepo{db: db}
}

// ─── Writes ──────────────────────────────────────────────────────────────

// Upsert inserts a new engagement or does nothing on duplicate.
// The DB unique constraint enforces one vote per type per user per content.
// Returns (isNew, error) so the service knows whether to invalidate Redis.
func (r *EngagementRepo) Upsert(ctx context.Context, e *model.Engagement) (bool, error) {
	const q = `
		INSERT INTO engagements
			(user_id, session_id, content_id, content_type, engagement_type, weight, city, state, country, ip_address)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
		ON CONFLICT DO NOTHING
		RETURNING id`

	var id uuid.UUID
	err := r.db.GetContext(ctx, &id, q,
		e.UserID, e.SessionID, e.ContentID, e.ContentType,
		e.EngagementType, e.Weight, e.City, e.State, e.Country, nil,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil // conflict — duplicate, not inserted
	}
	if err != nil {
		return false, fmt.Errorf("engagement_repo: upsert: %w", err)
	}
	return true, nil
}

// Delete removes an engagement (unlike / unhype).
// The hype and rating score triggers fire automatically on delete.
func (r *EngagementRepo) Delete(
	ctx context.Context,
	userID uuid.UUID,
	contentID uuid.UUID,
	contentType string,
	engType model.EngagementType,
) error {
	const q = `
		DELETE FROM engagements
		WHERE user_id = $1
		  AND content_id = $2
		  AND content_type = $3
		  AND engagement_type = $4`

	if _, err := r.db.ExecContext(ctx, q, userID, contentID, contentType, engType); err != nil {
		return fmt.Errorf("engagement_repo: delete: %w", err)
	}
	return nil
}

// ─── Reads ───────────────────────────────────────────────────────────────

// GetUserState returns all engagement types a user has on a content item.
// Used to build UserEngagementState for button rendering on the detail page.
func (r *EngagementRepo) GetUserState(
	ctx context.Context,
	userID uuid.UUID,
	contentID uuid.UUID,
	contentType string,
) ([]model.EngagementType, error) {
	const q = `
		SELECT engagement_type FROM engagements
		WHERE user_id = $1
		  AND content_id = $2
		  AND content_type = $3`

	var types []model.EngagementType
	if err := r.db.SelectContext(ctx, &types, q, userID, contentID, contentType); err != nil {
		return nil, fmt.Errorf("engagement_repo: get_user_state: %w", err)
	}
	return types, nil
}

// GetExistingHypeVote returns the user's current hype/meh/flop vote on a content item.
// Returns (exists, type, error) — type is empty string when no vote exists.
func (r *EngagementRepo) GetExistingHypeVote(
	ctx context.Context,
	userID uuid.UUID,
	contentID uuid.UUID,
	contentType string,
) (bool, model.EngagementType, error) {
	const q = `
		SELECT engagement_type FROM engagements
		WHERE user_id = $1
		  AND content_id = $2
		  AND content_type = $3
		  AND engagement_type IN ('hype', 'meh', 'flop')
		LIMIT 1`

	var engType model.EngagementType
	err := r.db.GetContext(ctx, &engType, q, userID, contentID, contentType)
	if errors.Is(err, sql.ErrNoRows) {
		return false, "", nil
	}
	if err != nil {
		return false, "", fmt.Errorf("engagement_repo: get_existing_hype_vote: %w", err)
	}
	return true, engType, nil
}

// GetExistingLikeVote returns the user's current like/dislike vote on a content item.
// Returns (exists, type, error) — type is empty string when no vote exists.
func (r *EngagementRepo) GetExistingLikeVote(
	ctx context.Context,
	userID uuid.UUID,
	contentID uuid.UUID,
	contentType string,
) (bool, model.EngagementType, error) {
	const q = `
		SELECT engagement_type FROM engagements
		WHERE user_id = $1
		  AND content_id = $2
		  AND content_type = $3
		  AND engagement_type IN ('like', 'dislike')
		LIMIT 1`

	var engType model.EngagementType
	err := r.db.GetContext(ctx, &engType, q, userID, contentID, contentType)
	if errors.Is(err, sql.ErrNoRows) {
		return false, "", nil
	}
	if err != nil {
		return false, "", fmt.Errorf("engagement_repo: get_existing_like_vote: %w", err)
	}
	return true, engType, nil
}

// ─── Analytics ───────────────────────────────────────────────────────────

// GetCityBreakdown returns geographic vote distribution for a content item.
// Powers the Nigeria heatmap on the creator dashboard.
func (r *EngagementRepo) GetCityBreakdown(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) (*model.DemographyBreakdown, error) {
	const q = `
		SELECT city, COUNT(*) AS count
		FROM engagements
		WHERE content_id = $1
		  AND content_type = $2
		  AND city IS NOT NULL
		GROUP BY city
		ORDER BY count DESC`

	type row struct {
		City  string `db:"city"`
		Count int    `db:"count"`
	}

	var rows []row
	if err := r.db.SelectContext(ctx, &rows, q, contentID, contentType); err != nil {
		return nil, fmt.Errorf("engagement_repo: city_breakdown: %w", err)
	}

	total := 0
	cityMap := map[string]int{}
	for _, r := range rows {
		total += r.Count
		cityMap[r.City] = r.Count
	}

	pct := func(city string) float64 {
		if total == 0 {
			return 0
		}
		return float64(cityMap[city]) / float64(total) * 100
	}

	return &model.DemographyBreakdown{
		Lagos: model.CityDataPoint{
			City:       "Lagos",
			Count:      cityMap["Lagos"],
			Percentage: pct("Lagos"),
		},
		Abuja: model.CityDataPoint{
			City:       "Abuja",
			Count:      cityMap["Abuja"],
			Percentage: pct("Abuja"),
		},
		Enugu: model.CityDataPoint{
			City:       "Enugu",
			Count:      cityMap["Enugu"],
			Percentage: pct("Enugu"),
		},
		Kano: model.CityDataPoint{
			City:       "Kano",
			Count:      cityMap["Kano"],
			Percentage: pct("Kano"),
		},
		PortHarcourt: model.CityDataPoint{
			City:       "Port Harcourt",
			Count:      cityMap["Port Harcourt"],
			Percentage: pct("Port Harcourt"),
		},
		Other: model.CityDataPoint{
			City:       "Other",
			Count:      total - cityMap["Lagos"] - cityMap["Abuja"] - cityMap["Enugu"] - cityMap["Kano"] - cityMap["Port Harcourt"],
			Percentage: 0,
		},
	}, nil
}
