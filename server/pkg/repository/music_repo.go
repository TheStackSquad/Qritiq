//server/pkg/repository/music_repo.go

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

type MusicRepo struct {
	db *sqlx.DB
}

func NewMusicRepo(db *sqlx.DB) *MusicRepo {
	return &MusicRepo{db: db}
}

func (r *MusicRepo) GetBySlug(ctx context.Context, slug string) (*model.Music, error) {
	const q = `SELECT * FROM music WHERE slug = $1 AND status != 'archived'`
	var m model.Music
	if err := r.db.GetContext(ctx, &m, q, slug); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("music_repo: get_by_slug: %w", err)
	}
	return &m, nil
}

func (r *MusicRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Music, error) {
	const q = `SELECT * FROM music WHERE id = $1`
	var m model.Music
	if err := r.db.GetContext(ctx, &m, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("music_repo: get_by_id: %w", err)
	}
	return &m, nil
}

func (r *MusicRepo) ListByStatus(ctx context.Context, status model.ContentStatus, limit, offset int) ([]*model.Music, error) {
	const q = `
		SELECT * FROM music
		WHERE status = $1
		ORDER BY hype_score DESC, created_at DESC
		LIMIT $2 OFFSET $3`

	var tracks []*model.Music
	if err := r.db.SelectContext(ctx, &tracks, q, status, limit, offset); err != nil {
		return nil, fmt.Errorf("music_repo: list_by_status: %w", err)
	}
	return tracks, nil
}

func (r *MusicRepo) Search(ctx context.Context, query string, limit int) ([]*model.Music, error) {
	const q = `
		SELECT *, similarity(title, $1) AS sim
		FROM music
		WHERE status != 'archived'
		  AND (title ILIKE '%' || $1 || '%' OR artist ILIKE '%' || $1 || '%' OR similarity(title, $1) > 0.1)
		ORDER BY sim DESC, hype_score DESC
		LIMIT $2`

	var tracks []*model.Music
	if err := r.db.SelectContext(ctx, &tracks, q, query, limit); err != nil {
		return nil, fmt.Errorf("music_repo: search: %w", err)
	}
	return tracks, nil
}

func (r *MusicRepo) GetByCreator(ctx context.Context, creatorID uuid.UUID) ([]*model.Music, error) {
	const q = `SELECT * FROM music WHERE creator_id = $1 ORDER BY created_at DESC`
	var tracks []*model.Music
	if err := r.db.SelectContext(ctx, &tracks, q, creatorID); err != nil {
		return nil, fmt.Errorf("music_repo: get_by_creator: %w", err)
	}
	return tracks, nil
}

func (r *MusicRepo) IncrementViews(ctx context.Context, id uuid.UUID) error {
	const q = `UPDATE music SET total_views = total_views + 1 WHERE id = $1`
	if _, err := r.db.ExecContext(ctx, q, id); err != nil {
		return fmt.Errorf("music_repo: increment_views: %w", err)
	}
	return nil
}

func (r *MusicRepo) GetTrending(ctx context.Context, limit int) ([]*model.Music, error) {
	const q = `
		SELECT * FROM music
		WHERE status != 'archived'
		ORDER BY hype_score DESC
		LIMIT $1`

	var tracks []*model.Music
	if err := r.db.SelectContext(ctx, &tracks, q, limit); err != nil {
		return nil, fmt.Errorf("music_repo: get_trending: %w", err)
	}
	return tracks, nil
}