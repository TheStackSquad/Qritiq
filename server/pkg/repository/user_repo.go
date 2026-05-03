//sever/pkg/repository/user_repo.go

package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

// UserRepo handles all user DB operations.
// Services call this — handlers never touch DB directly.
type UserRepo struct {
	db *sqlx.DB
}

func NewUserRepo(db *sqlx.DB) *UserRepo {
	return &UserRepo{db: db}
}

// Create inserts a new user and returns the full record.
func (r *UserRepo) Create(ctx context.Context, email, username, passwordHash string, role model.UserRole, weight float64) (*model.User, error) {
	const q = `
		INSERT INTO users (email, username, password_hash, role, vote_weight)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *`

	var u model.User
	if err := r.db.GetContext(ctx, &u, q, email, username, passwordHash, role, weight); err != nil {
		return nil, fmt.Errorf("user_repo: create: %w", err)
	}
	return &u, nil
}

// GetByID fetches a user by primary key.
func (r *UserRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	const q = `SELECT * FROM users WHERE id = $1`
	var u model.User
	if err := r.db.GetContext(ctx, &u, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("user_repo: get_by_id: %w", err)
	}
	return &u, nil
}

// GetByEmail fetches a user by email (used for login).
func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	const q = `SELECT * FROM users WHERE email = $1`
	var u model.User
	if err := r.db.GetContext(ctx, &u, q, email); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("user_repo: get_by_email: %w", err)
	}
	return &u, nil
}

// UpdateProfile updates mutable profile fields.
func (r *UserRepo) UpdateProfile(ctx context.Context, id uuid.UUID, username, avatarURL *string) (*model.User, error) {
	const q = `
		UPDATE users
		SET
			username   = COALESCE($2, username),
			avatar_url = COALESCE($3, avatar_url)
		WHERE id = $1
		RETURNING *`

	var u model.User
	if err := r.db.GetContext(ctx, &u, q, id, username, avatarURL); err != nil {
		return nil, fmt.Errorf("user_repo: update_profile: %w", err)
	}
	return &u, nil
}

// UpdateRole sets a user's role and recalculates their vote weight.
func (r *UserRepo) UpdateRole(ctx context.Context, id uuid.UUID, role model.UserRole) error {
	weight := model.VoteWeightMap[role]
	const q = `UPDATE users SET role = $2, vote_weight = $3 WHERE id = $1`
	if _, err := r.db.ExecContext(ctx, q, id, role, weight); err != nil {
		return fmt.Errorf("user_repo: update_role: %w", err)
	}
	return nil
}

// EmailExists is a fast check used during signup validation.
func (r *UserRepo) EmailExists(ctx context.Context, email string) (bool, error) {
	const q = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	var exists bool
	if err := r.db.GetContext(ctx, &exists, q, email); err != nil {
		return false, fmt.Errorf("user_repo: email_exists: %w", err)
	}
	return exists, nil
}

// UsernameExists is a fast check used during signup validation.
func (r *UserRepo) UsernameExists(ctx context.Context, username string) (bool, error) {
	const q = `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`
	var exists bool
	if err := r.db.GetContext(ctx, &exists, q, username); err != nil {
		return false, fmt.Errorf("user_repo: username_exists: %w", err)
	}
	return exists, nil
}

// Sentinel errors for service layer branching.
var (
	ErrNotFound      = errors.New("record not found")
	ErrDuplicate     = errors.New("record already exists")
	ErrUnauthorized  = errors.New("unauthorized")
)