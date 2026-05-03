//server/pkg/repository/token_blacklist_repo.go

package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

// ─── Token Blacklist Repo ─────────────────────────────────────────

type TokenBlacklistRepo struct {
	db *sqlx.DB
}

func NewTokenBlacklistRepo(db *sqlx.DB) *TokenBlacklistRepo {
	return &TokenBlacklistRepo{db: db}
}

func (r *TokenBlacklistRepo) Add(ctx context.Context, tokenHash string, expiresAt time.Time) error {
	const q = `
		INSERT INTO token_blacklist (token_hash, expires_at)
		VALUES ($1,$2)
		ON CONFLICT (token_hash) DO NOTHING`

	if _, err := r.db.ExecContext(ctx, q, tokenHash, expiresAt); err != nil {
		return fmt.Errorf("blacklist_repo: add: %w", err)
	}
	return nil
}

func (r *TokenBlacklistRepo) IsBlacklisted(ctx context.Context, tokenHash string) (bool, error) {
	const q = `SELECT EXISTS(SELECT 1 FROM token_blacklist WHERE token_hash = $1 AND expires_at > NOW())`
	var exists bool
	if err := r.db.GetContext(ctx, &exists, q, tokenHash); err != nil {
		return false, fmt.Errorf("blacklist_repo: is_blacklisted: %w", err)
	}
	return exists, nil
}
