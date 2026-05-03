//server/model/ratings.go

package model

import(
	"time"
	"github.com/google/uuid"
)

// ─── Rating ───────────────────────────────────────────────────────────

type Rating struct {
	ID          uuid.UUID `db:"id"           json:"id"`
	UserID      uuid.UUID `db:"user_id"      json:"user_id"`
	ContentID   uuid.UUID `db:"content_id"   json:"content_id"`
	ContentType string    `db:"content_type" json:"content_type"`
	Score       float64   `db:"score"        json:"score"` // 1.0-5.0
	Weight      float64   `db:"weight"       json:"weight"`
	Role        string    `db:"role"         json:"role"`  // "user" | "critic"
	CreatedAt   time.Time `db:"created_at"   json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"   json:"updated_at"`
}

type RatingInput struct {
	ContentID   string  `json:"content_id"   binding:"required,uuid"`
	ContentType string  `json:"content_type" binding:"required,oneof=movie music"`
	Score       float64 `json:"score"        binding:"required,min=1,max=5"`
	Role        string  `json:"role"         binding:"omitempty,oneof=user critic"`
}