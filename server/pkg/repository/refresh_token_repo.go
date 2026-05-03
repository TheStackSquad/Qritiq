//server/pkg/repository/refresh_token_repo.go

package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)


// ─── Refresh Token Repo ──────────────────────────────────────────

type RefreshTokenRepo struct {
	db *sqlx.DB
}

func NewRefreshTokenRepo(db *sqlx.DB) *RefreshTokenRepo {
	return &RefreshTokenRepo{db: db}
}

func (r *RefreshTokenRepo) Create(ctx context.Context, userID uuid.UUID, tokenHash string, expiresAt time.Time, userAgent string) error {
	const q = `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent)
		VALUES ($1,$2,$3,$4)`

	if _, err := r.db.ExecContext(ctx, q, userID, tokenHash, expiresAt, userAgent); err != nil {
		return fmt.Errorf("refresh_token_repo: create: %w", err)
	}
	return nil
}

func (r *RefreshTokenRepo) GetByHash(ctx context.Context, hash string) (*model.RefreshToken, error) {
	const q = `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()`
	var t model.RefreshToken
	if err := r.db.GetContext(ctx, &t, q, hash); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("refresh_token_repo: get_by_hash: %w", err)
	}
	return &t, nil
}

func (r *RefreshTokenRepo) DeleteByHash(ctx context.Context, hash string) error {
	const q = `DELETE FROM refresh_tokens WHERE token_hash = $1`
	if _, err := r.db.ExecContext(ctx, q, hash); err != nil {
		return fmt.Errorf("refresh_token_repo: delete: %w", err)
	}
	return nil
}

func (r *RefreshTokenRepo) DeleteAllForUser(ctx context.Context, userID uuid.UUID) error {
	const q = `DELETE FROM refresh_tokens WHERE user_id = $1`
	if _, err := r.db.ExecContext(ctx, q, userID); err != nil {
		return fmt.Errorf("refresh_token_repo: delete_all_for_user: %w", err)
	}
	return nil
}