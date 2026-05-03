//server/pkg/model/trending.go

package model

import "github.com/google/uuid"

// HypeRadarItem is the per-movie payload for the Hype Radar component.
// WeeklyDelta is pre-computed at the query layer via analytics_snapshots JOIN.
type HypeRadarItem struct {
	ID           uuid.UUID `db:"id"           json:"id"`
	Title        string    `db:"title"        json:"title"`
	Slug         string    `db:"slug"         json:"slug"`
	Genre        *string   `db:"genre"        json:"genre,omitempty"`
	Status       string    `db:"status"       json:"status"`
	CurrentScore float64   `db:"current_score" json:"currentScore"`
	WeeklyDelta  float64   `db:"weekly_delta"  json:"weeklyDelta"`
	TotalVotes   int       `db:"total_votes"   json:"totalVotes"`
}

// VerdictSplitItem is the per-movie payload for the Verdict Split component.
// CriticScore and StreetScore are normalised to 0–100 (rating 1–5 × 20).
// Only movies with BOTH critic and user ratings are included.
type VerdictSplitItem struct {
	ID          uuid.UUID `db:"id"           json:"id"`
	Title       string    `db:"title"        json:"title"`
	Slug        string    `db:"slug"         json:"slug"`
	Status      string    `db:"status"       json:"status"`
	CriticScore float64   `db:"critic_score" json:"criticScore"`
	StreetScore float64   `db:"street_score" json:"streetScore"`
	TotalVotes  int       `db:"total_votes"  json:"totalVotes"`
}