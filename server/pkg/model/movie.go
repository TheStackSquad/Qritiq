//server/model/movie.go

package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ContentStatus represents the lifecycle phase of a movie/music item.
type ContentStatus string

const (
	StatusPreRelease ContentStatus = "pre_release" // hype collection active
	StatusReleased   ContentStatus = "released"    // rating + review active
	StatusArchived   ContentStatus = "archived"    // removed from listings
)

// Movie represents a Nollywood film on the KritiQ platform.
// Aggregate fields (hype_score, rating_score etc.) are maintained
// by Postgres triggers on the engagements and ratings tables,
// so reads are always O(1) — no JOIN aggregation on hot paths.
type Movie struct {
	ID                uuid.UUID      `db:"id"                 json:"id"`
	Title             string         `db:"title"              json:"title"`
	Slug              string         `db:"slug"               json:"slug"`
	Description       *string        `db:"description"        json:"description,omitempty"`
	ReleaseDate       *time.Time     `db:"release_date"       json:"release_date,omitempty"`
	Status            ContentStatus  `db:"status"             json:"status"`
	PosterURL         *string        `db:"poster_url"         json:"poster_url,omitempty"`
	TrailerURL        *string        `db:"trailer_url"        json:"trailer_url,omitempty"` // YouTube ID
	Genre             *string        `db:"genre"              json:"genre,omitempty"`
	ProductionCompany *string        `db:"production_company" json:"production_company,omitempty"`
	Director          *string        `db:"director"           json:"director,omitempty"`
	CastList          pq.StringArray `db:"cast_list"          json:"cast_list,omitempty"`
	// Cached aggregates — written by DB triggers, read by Go
	HypeScore       float64    `db:"hype_score"        json:"hype_score"`
	RatingScore     float64    `db:"rating_score"      json:"rating_score"`
	TotalHypeVotes  int        `db:"total_hype_votes"  json:"total_hype_votes"`
	TotalRatings    int        `db:"total_ratings"     json:"total_ratings"`
	TotalLikes      int        `db:"total_likes"       json:"total_likes"`
	TotalDislikes   int        `db:"total_dislikes"    json:"total_dislikes"`
	TotalViews      int        `db:"total_views"       json:"total_views"`
	CreatorID       *uuid.UUID `db:"creator_id"        json:"creator_id,omitempty"`
	IsFeatured      bool       `db:"is_featured"       json:"is_featured"`
	CreatedAt       time.Time  `db:"created_at"        json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"        json:"updated_at"`

	// Computed fields — populated by service layer, not stored
	// UserEngagement is set when an authenticated user fetches a movie
	// so the frontend knows their current vote state.
	UserEngagement *UserEngagementState `db:"-" json:"user_engagement,omitempty"`
	// DaysUntilRelease is computed for pre-release countdown UIs
	DaysUntilRelease *int `db:"-" json:"days_until_release,omitempty"`
}

// UserEngagementState is the current user's interaction with a piece of content.
// Returned alongside movie/music data so the frontend can render
// button states (liked, hyped etc.) correctly without a second request.
type UserEngagementState struct {
	HasLiked    bool   `json:"has_liked"`
	HasDisliked bool   `json:"has_disliked"`
	HypeVote    string `json:"hype_vote,omitempty"` // "hype" | "meh" | "flop" | ""
	HasRated    bool   `json:"has_rated"`
	UserRating  *float64 `json:"user_rating,omitempty"`
}

// --- Request / Response DTOs ---

type CreateMovieInput struct {
	Title             string   `json:"title"              binding:"required,min=1,max=255"`
	Description       string   `json:"description"`
	ReleaseDate       string   `json:"release_date"       binding:"omitempty"`        // YYYY-MM-DD
	Status            string   `json:"status"             binding:"omitempty"`
	PosterURL         string   `json:"poster_url"         binding:"omitempty,url"`
	TrailerURL        string   `json:"trailer_url"        binding:"omitempty"`
	Genre             string   `json:"genre"              binding:"omitempty,max=100"`
	ProductionCompany string   `json:"production_company" binding:"omitempty,max=255"`
	Director          string   `json:"director"           binding:"omitempty,max=255"`
	CastList          []string `json:"cast_list"          binding:"omitempty"`
}

// MovieCardResponse is the minimal payload for homepage/browse cards.
// Intentionally light — posters are served from Cloudinary CDN,
// and aggregate numbers come from the Redis cache layer.
type MovieCardResponse struct {
	ID             uuid.UUID     `json:"id"`
	Title          string        `json:"title"`
	Slug           string        `json:"slug"`
	Status         ContentStatus `json:"status"`
	PosterURL      *string       `json:"poster_url,omitempty"`
	Genre          *string       `json:"genre,omitempty"`
	HypeScore      float64       `json:"hype_score"`
	TotalLikes     int           `json:"total_likes"`
	TotalDislikes  int           `json:"total_dislikes"`
	TotalViews     int           `json:"total_views"`
	ReleaseDate    *time.Time    `json:"release_date,omitempty"`
	DaysUntilRelease *int        `json:"days_until_release,omitempty"`
	UserEngagement *UserEngagementState `json:"user_engagement,omitempty"`
}


// SearchResult is the minimal projection for search dropdown and results page.
// Intentionally excludes description, cast_list, trailer_url, production_company
// and director — none of these are rendered in search UI.
type SearchResult struct {
	ID          uuid.UUID     `db:"id"           json:"id"`
	Title       string        `db:"title"        json:"title"`
	Slug        string        `db:"slug"         json:"slug"`
	Status      ContentStatus `db:"status"       json:"status"`
	PosterURL   *string       `db:"poster_url"   json:"poster_url,omitempty"`
	Genre       *string       `db:"genre"        json:"genre,omitempty"`
	HypeScore   float64       `db:"hype_score"   json:"hype_score"`
	RatingScore float64       `db:"rating_score" json:"rating_score"`
	ReleaseDate *time.Time    `db:"release_date" json:"release_date,omitempty"`
}