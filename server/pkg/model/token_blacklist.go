//server/model/token_blacklist.go

package model

import (
	"time"
	"github.com/google/uuid"
)



type TokenBlacklist struct {
	ID        uuid.UUID `db:"id"         json:"id"`
	TokenHash string    `db:"token_hash" json:"-"`
	ExpiresAt time.Time `db:"expires_at" json:"expires_at"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}