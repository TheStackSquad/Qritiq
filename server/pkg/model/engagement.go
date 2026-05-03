//server/mode/engagement.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Engagement ───────────────────────────────────────────────────────

type EngagementType string

const (
	EngageLike    EngagementType = "like"
	EngageDislike EngagementType = "dislike"
	EngageHype    EngagementType = "hype"
	EngageMeh     EngagementType = "meh"
	EngageFlop    EngagementType = "flop"
	EngageWatch   EngagementType = "watch"
)

type Engagement struct {
	ID             uuid.UUID      `db:"id"              json:"id"`
	UserID         *uuid.UUID     `db:"user_id"         json:"user_id,omitempty"`
	SessionID      *string        `db:"session_id"      json:"session_id,omitempty"`
	ContentID      uuid.UUID      `db:"content_id"      json:"content_id"`
	ContentType    string         `db:"content_type"    json:"content_type"` // "movie" | "music"
	EngagementType EngagementType `db:"engagement_type" json:"engagement_type"`
	Weight         float64        `db:"weight"          json:"weight"`
	City           *string        `db:"city"            json:"city,omitempty"`
	State          *string        `db:"state"           json:"state,omitempty"`
	Country        *string        `db:"country"         json:"country,omitempty"`
	CreatedAt      time.Time      `db:"created_at"      json:"created_at"`
}

type EngagementInput struct {
	ContentID      string `json:"content_id"      binding:"required,uuid"`
	ContentType    string `json:"content_type"    binding:"required,oneof=movie music"`
	EngagementType string `json:"engagement_type" binding:"required,oneof=like dislike hype meh flop watch"`
}