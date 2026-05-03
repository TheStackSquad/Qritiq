//server/model/music.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Music ────────────────────────────────────────────────────────────

type Music struct {
	ID             uuid.UUID     `db:"id"              json:"id"`
	Title          string        `db:"title"           json:"title"`
	Slug           string        `db:"slug"            json:"slug"`
	Artist         string        `db:"artist"          json:"artist"`
	Description    *string       `db:"description"     json:"description,omitempty"`
	ReleaseDate    *time.Time    `db:"release_date"    json:"release_date,omitempty"`
	Status         ContentStatus `db:"status"          json:"status"`
	CoverURL       *string       `db:"cover_url"       json:"cover_url,omitempty"`
	PreviewURL     *string       `db:"preview_url"     json:"preview_url,omitempty"` // Cloudinary 30s clip
	Genre          *string       `db:"genre"           json:"genre,omitempty"`
	Label          *string       `db:"label"           json:"label,omitempty"`
	HypeScore      float64       `db:"hype_score"      json:"hype_score"`
	RatingScore    float64       `db:"rating_score"    json:"rating_score"`
	TotalHypeVotes int           `db:"total_hype_votes" json:"total_hype_votes"`
	TotalRatings   int           `db:"total_ratings"   json:"total_ratings"`
	TotalLikes     int           `db:"total_likes"     json:"total_likes"`
	TotalDislikes  int           `db:"total_dislikes"  json:"total_dislikes"`
	TotalViews     int           `db:"total_views"     json:"total_views"`
	CreatorID      *uuid.UUID    `db:"creator_id"      json:"creator_id,omitempty"`
	IsFeatured     bool          `db:"is_featured"     json:"is_featured"`
	CreatedAt      time.Time     `db:"created_at"      json:"created_at"`
	UpdatedAt      time.Time     `db:"updated_at"      json:"updated_at"`

	UserEngagement   *UserEngagementState `db:"-" json:"user_engagement,omitempty"`
	DaysUntilRelease *int                 `db:"-" json:"days_until_release,omitempty"`
}

type CreateMusicInput struct {
	Title       string `json:"title"        binding:"required,min=1,max=255"`
	Artist      string `json:"artist"       binding:"required,min=1,max=255"`
	Description string `json:"description"`
	ReleaseDate string `json:"release_date" binding:"omitempty"` // YYYY-MM-DD
	Status      string `json:"status"       binding:"omitempty"`
	CoverURL    string `json:"cover_url"    binding:"omitempty,url"`
	PreviewURL  string `json:"preview_url"  binding:"omitempty,url"`
	Genre       string `json:"genre"        binding:"omitempty,max=100"`
	Label       string `json:"label"        binding:"omitempty,max=255"`
}
