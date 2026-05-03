//server/model/refresh_token.go

package model

import (
	"time"
	"github.com/google/uuid"
)

// ─── Tokens ───────────────────────────────────────────────────────────

type RefreshToken struct {
	ID        uuid.UUID `db:"id"         json:"id"`
	UserID    uuid.UUID `db:"user_id"    json:"user_id"`
	TokenHash string    `db:"token_hash" json:"-"`
	ExpiresAt time.Time `db:"expires_at" json:"expires_at"`
	UserAgent *string   `db:"user_agent" json:"user_agent,omitempty"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}


// AuthTokenPair is returned on login / token refresh.
type AuthTokenPair struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         UserResponse `json:"user"`
}