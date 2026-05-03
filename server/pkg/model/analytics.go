//server/mode/analytics.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Analytics Snapshot ───────────────────────────────────────────────

// AnalyticsSnapshot is a daily aggregate for the partner dashboard.
// Populated by a scheduled Go service worker, not on hot paths.
type AnalyticsSnapshot struct {
	ID          uuid.UUID `db:"id"           json:"id"`
	ContentID   uuid.UUID `db:"content_id"   json:"content_id"`
	ContentType string    `db:"content_type" json:"content_type"`
	SnapshotDate time.Time `db:"snapshot_date" json:"snapshot_date"`
	TotalViews  int       `db:"total_views"  json:"total_views"`
	TotalLikes  int       `db:"total_likes"  json:"total_likes"`
	TotalDislikes int     `db:"total_dislikes" json:"total_dislikes"`
	TotalHype   int       `db:"total_hype"   json:"total_hype"`
	TotalMeh    int       `db:"total_meh"    json:"total_meh"`
	TotalFlop   int       `db:"total_flop"   json:"total_flop"`
	HypeScore   float64   `db:"hype_score"   json:"hype_score"`
	LagosCount  int       `db:"lagos_count"  json:"lagos_count"`
	AbujaCount  int       `db:"abuja_count"  json:"abuja_count"`
	EnuguCount  int       `db:"enugu_count"  json:"enugu_count"`
	KanoCount   int       `db:"kano_count"   json:"kano_count"`
	PHCount     int       `db:"ph_count"     json:"ph_count"`
	OtherCount  int       `db:"other_count"  json:"other_count"`
	CreatedAt   time.Time `db:"created_at"   json:"created_at"`
}

// DemographyBreakdown is the structured city breakdown used by the heatmap.
type DemographyBreakdown struct {
	Lagos       CityDataPoint `json:"lagos"`
	Abuja       CityDataPoint `json:"abuja"`
	Enugu       CityDataPoint `json:"enugu"`
	Kano        CityDataPoint `json:"kano"`
	PortHarcourt CityDataPoint `json:"port_harcourt"`
	Other       CityDataPoint `json:"other"`
}

type CityDataPoint struct {
	City       string  `json:"city"`
	Count      int     `json:"count"`
	Percentage float64 `json:"percentage"`
}

// CompetitorBenchmark is the comparison table data for the partner dashboard.
type CompetitorBenchmark struct {
	ContentID   uuid.UUID `json:"content_id"`
	Title       string    `json:"title"`
	HypeScore   float64   `json:"hype_score"`
	TotalVotes  int       `json:"total_votes"`
	TotalLikes  int       `json:"total_likes"`
	RatingScore float64   `json:"rating_score"`
	Status      string    `json:"status"`
	IsTarget    bool      `json:"is_target"` // true = the creator's own movie
}