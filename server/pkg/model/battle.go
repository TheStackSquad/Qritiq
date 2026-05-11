// server/pkg/model/battle.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Enums & Supporting Types ────────────────────────────────────────────────

type BattleStatus string

const (
	BattleActive    BattleStatus = "active"
	BattleCompleted BattleStatus = "completed"
	BattleCancelled BattleStatus = "cancelled"
)

type BattleWinner string

const (
	WinnerA   BattleWinner = "a"
	WinnerB   BattleWinner = "b"
	WinnerTie BattleWinner = ""
)

// CityPulseEntry holds the vote split for a single city.
type CityPulseEntry struct {
	A int `json:"a"` // votes for content_a
	B int `json:"b"` // votes for content_b
}

// CityPulse is the full city breakdown map returned to the client.
type CityPulse map[string]CityPulseEntry

// ─── Core Battle Model ───────────────────────────────────────────────────────

// Battle represents one weekly face-off between two pieces of content.
type Battle struct {
	ID          uuid.UUID `db:"id"           json:"id"`
	ContentType string    `db:"content_type" json:"content_type"`

	// Content A
	ContentAID    uuid.UUID `db:"content_a_id"    json:"content_a_id"`
	ContentATitle string    `db:"content_a_title" json:"content_a_title"`
	ContentASlug  string    `db:"content_a_slug"  json:"content_a_slug"`
	ContentAImage *string   `db:"content_a_image" json:"content_a_image,omitempty"`
	ContentAGenre *string   `db:"content_a_genre" json:"content_a_genre,omitempty"`
	ContentAHype  float64   `db:"content_a_hype"  json:"content_a_hype"`

	// Content B
	ContentBID    uuid.UUID `db:"content_b_id"    json:"content_b_id"`
	ContentBTitle string    `db:"content_b_title" json:"content_b_title"`
	ContentBSlug  string    `db:"content_b_slug"  json:"content_b_slug"`
	ContentBImage *string   `db:"content_b_image" json:"content_b_image,omitempty"`
	ContentBGenre *string   `db:"content_b_genre" json:"content_b_genre,omitempty"`
	ContentBHype  float64   `db:"content_b_hype"  json:"content_b_hype"`

	// Matchmaking audit
	MatchTier   int     `db:"match_tier"   json:"match_tier"`
	MatchReason *string `db:"match_reason" json:"match_reason,omitempty"`

	// Vote tallies
	VotesA int `db:"votes_a" json:"votes_a"`
	VotesB int `db:"votes_b" json:"votes_b"`

	// City breakdown
	CityPulseRaw []byte    `db:"city_pulse" json:"-"`
	CityPulse    CityPulse `db:"-"            json:"city_pulse"`

	// State
	Status   BattleStatus  `db:"status"    json:"status"`
	Winner   *BattleWinner `db:"winner"    json:"winner,omitempty"`
	StartsAt time.Time     `db:"starts_at" json:"starts_at"`
	EndsAt   time.Time     `db:"ends_at"   json:"ends_at"`

	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`

	// Computed fields
	PctA       float64 `db:"-" json:"pct_a"`
	PctB       float64 `db:"-" json:"pct_b"`
	TotalVotes int     `db:"-" json:"total_votes"`
	DaysLeft   int     `db:"-" json:"days_left"`

	// User context
	UserVote *string `db:"-" json:"user_vote,omitempty"`
}

func (b *Battle) ComputeDerived() {
	b.TotalVotes = b.VotesA + b.VotesB
	if b.TotalVotes > 0 {
		b.PctA = float64(b.VotesA) / float64(b.TotalVotes) * 100
		b.PctB = float64(b.VotesB) / float64(b.TotalVotes) * 100
	}
	remaining := time.Until(b.EndsAt)
	if remaining > 0 {
		b.DaysLeft = int(remaining.Hours() / 24)
	}
}

// ─── API Communication ───────────────────────────────────────────────────────

// BattleVoteInput is the request body for POST /arena/vote.
type BattleVoteInput struct {
	BattleID string `json:"battle_id" binding:"required,uuid"`
	Side     string `json:"side"      binding:"required,oneof=a b"`
}

func (b *BattleVoteInput) EngagementType() string {
	if b.Side == "a" {
		return "hype"
	}
	return "flop"
}

// BattleListResponse is the payload returned by GET /arena.
type BattleListResponse struct {
	ActiveMovies    []*Battle `json:"active_movies"`
	ActiveMusic     []*Battle `json:"active_music"`
	CompletedMovies []*Battle `json:"completed_movies"`
	CompletedMusic  []*Battle `json:"completed_music"`
}

// ─── Internal Scheduler & Matchmaking ────────────────────────────────────────

// CreateBattleInput includes denormalized fields needed for insertion.
type CreateBattleInput struct {
	ContentType string    `json:"content_type"`

	// Content A
	ContentAID    uuid.UUID `json:"content_a_id"`
	ContentATitle string    `json:"content_a_title"`
	ContentASlug  string    `json:"content_a_slug"`
	ContentAImage *string   `json:"content_a_image"`
	ContentAGenre *string   `json:"content_a_genre"`
	ContentAHype  float64   `json:"content_a_hype"`

	// Content B
	ContentBID    uuid.UUID `json:"content_b_id"`
	ContentBTitle string    `json:"content_b_title"`
	ContentBSlug  string    `json:"content_b_slug"`
	ContentBImage *string   `json:"content_b_image"`
	ContentBGenre *string   `json:"content_b_genre"`
	ContentBHype  float64   `json:"content_b_hype"`

	MatchTier     int       `json:"match_tier"`
	MatchReason   string    `json:"match_reason"`
	StartsAt      time.Time `json:"starts_at"`
	EndsAt        time.Time `json:"ends_at"`
}

type MatchmakingResult struct {
	MatchedID   uuid.UUID `db:"matched_id"`
	MatchTier   int       `db:"match_tier"`
	MatchReason string    `db:"match_reason"`
}

type BattleContentLog struct {
	ID            uuid.UUID `db:"id"               json:"id"`
	ContentID     uuid.UUID `db:"content_id"       json:"content_id"`
	ContentType   string    `db:"content_type"     json:"content_type"`
	LastBattledAt time.Time `db:"last_battled_at" json:"last_battled_at"`
	BattleCount   int       `db:"battle_count"     json:"battle_count"`
}