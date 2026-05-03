//server/pkg/repository/ratings_repo.go

package repository
import (
	"context"
	"fmt"

	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type RatingRepo struct {
	db *sqlx.DB
}

func NewRatingRepo(db *sqlx.DB) *RatingRepo {
	return &RatingRepo{db: db}
}

// Upsert inserts or updates a user's rating for a content item.
func (r *RatingRepo) Upsert(ctx context.Context, rating *model.Rating) error {
	const q = `
		INSERT INTO ratings (user_id, content_id, content_type, score, weight, role)
		VALUES ($1,$2,$3,$4,$5,$6)
		ON CONFLICT (user_id, content_id, content_type)
		DO UPDATE SET score = EXCLUDED.score, role = EXCLUDED.role, updated_at = NOW()`

	if _, err := r.db.ExecContext(ctx, q,
		rating.UserID,
		rating.ContentID,
		rating.ContentType,
		rating.Score,
		rating.Weight,
		rating.Role,
	); err != nil {
		return fmt.Errorf("rating_repo: upsert: %w", err)
	}
	return nil
}