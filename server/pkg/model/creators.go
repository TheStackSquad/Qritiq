//sever/model/creators.go

package model

import (
	"time"
	"github.com/google/uuid"
)
// ─── Creator (Partner Account) ────────────────────────────────────────

type CreatorTier string

const (
	TierFree    CreatorTier = "free"
	TierPremium CreatorTier = "premium"
	TierPro     CreatorTier = "pro"
)

type Creator struct {
	ID           uuid.UUID   `db:"id"           json:"id"`
	UserID       uuid.UUID   `db:"user_id"      json:"user_id"`
	CompanyName  *string     `db:"company_name" json:"company_name,omitempty"`
	Bio          *string     `db:"bio"          json:"bio,omitempty"`
	Tier         CreatorTier `db:"tier"         json:"tier"`
	IsVerified   bool        `db:"is_verified"  json:"is_verified"`
	WebsiteURL   *string     `db:"website_url"  json:"website_url,omitempty"`
	SocialHandle *string     `db:"social_handle" json:"social_handle,omitempty"`
	CreatedAt    time.Time   `db:"created_at"   json:"created_at"`
	UpdatedAt    time.Time   `db:"updated_at"   json:"updated_at"`
}