//server/pkg/model/street_pull.go

// server/pkg/model/street_pull.go

package model

import "github.com/google/uuid"

// ─── Street Pull Score ────────────────────────────────────────────────────────

// StreetPullScore is the weighted composite engagement metric for a piece of content.
// It answers: "how much did the street actually interact with this?" —
// beyond just hype votes, capturing views, likes, snippet plays, and ratings.
//
// Computed by the StreetPullService worker — never on hot request paths.
// Stored as street_pull_score on movies and music tables.
// Updated after fn_refresh_hype_score completes on each engagement change.
//
// Formula:
//   street_pull_score =
//       (TotalViews      * 0.10)   passive interest — someone clicked
//     + (TotalLikes      * 0.50)   positive sentiment — liked what they saw
//     + (SnippetPlays    * 0.30)   listened = interested (music only)
//     + (TotalHypeVotes  * 1.00)   strongest intent signal — voted
//     + (TotalRatings    * 0.80)   committed enough to leave a score
//
// Weights are intentionally conservative so the score stays meaningful
// even for content with only a few dozen interactions.
// The score is unbounded — not normalised to 100 — so it grows with engagement.

const (
	WeightView      = 0.10
	WeightLike      = 0.50
	WeightSnippet   = 0.30
	WeightHypeVote  = 1.00
	WeightRating    = 0.80
)

// StreetPullInput holds the raw counts needed to compute the score.
// Populated from movies or music table by the worker.
type StreetPullInput struct {
	ContentID   uuid.UUID `db:"id"`
	ContentType string    `db:"content_type"` // "movie" | "music"

	TotalViews     int `db:"total_views"`
	TotalLikes     int `db:"total_likes"`
	SnippetPlays   int `db:"snippet_plays"`
	TotalHypeVotes int `db:"total_hype_votes"`
	TotalRatings   int `db:"total_ratings"`
}

// Compute returns the street_pull_score for this content.
// Called by StreetPullService.Compute — result written back to DB.
func (s *StreetPullInput) Compute() float64 {
	return float64(s.TotalViews)*WeightView +
		float64(s.TotalLikes)*WeightLike +
		float64(s.SnippetPlays)*WeightSnippet +
		float64(s.TotalHypeVotes)*WeightHypeVote +
		float64(s.TotalRatings)*WeightRating
}

// StreetPullUpdate is written back to the DB after Compute().
type StreetPullUpdate struct {
	ContentID      uuid.UUID `db:"id"`
	ContentType    string    `db:"content_type"`
	StreetPullScore float64  `db:"street_pull_score"`
}

// ─── Snippet Play Input ───────────────────────────────────────────────────────

// SnippetPlayInput is the request body for POST /music/:slug/play.
// Records a snippet play event. Triggers street_pull_score recomputation.
// Auth is optional — guests can contribute play counts (same as watch).
type SnippetPlayInput struct {
	ContentID   string `json:"content_id"   binding:"required,uuid"`
	ContentType string `json:"content_type" binding:"required,oneof=music"`
}

// ─── Street Pull Leaderboard Entry ───────────────────────────────────────────

// StreetPullEntry is one row in the Street Pull leaderboard.
// Returned by GET /arena/leaderboard or embedded in the Arena page.
// Combines movies and music in a single ranked list.
type StreetPullEntry struct {
	ContentID       string  `db:"id"               json:"content_id"`
	ContentType     string  `db:"content_type"     json:"content_type"`
	Title           string  `db:"title"            json:"title"`
	Slug            string  `db:"slug"             json:"slug"`
	ImageURL        *string `db:"image_url"        json:"image_url,omitempty"`
	Genre           *string `db:"genre"            json:"genre,omitempty"`
	HypeScore       float64 `db:"hype_score"       json:"hype_score"`
	RatingScore     float64 `db:"rating_score"     json:"rating_score"`
	StreetPullScore float64 `db:"street_pull_score" json:"street_pull_score"`
	TotalViews      int     `db:"total_views"      json:"total_views"`
	TotalLikes      int     `db:"total_likes"      json:"total_likes"`
	SnippetPlays    int     `db:"snippet_plays"    json:"snippet_plays"`
	TotalHypeVotes  int     `db:"total_hype_votes" json:"total_hype_votes"`
	TotalRatings    int     `db:"total_ratings"    json:"total_ratings"`

	// Computed after scan
	Rank int `db:"-" json:"rank"`
}