// server/pkg/repository/battle_repo.go

package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type BattleRepo struct {
	db *sqlx.DB
}

func NewBattleRepo(db *sqlx.DB) *BattleRepo {
	return &BattleRepo{db: db}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// hydrate unmarshals CityPulseRaw into CityPulse and calls ComputeDerived.
// Called after every scan to ensure the battle is ready to return to the client.
func hydrateBattle(b *model.Battle) error {
	if len(b.CityPulseRaw) > 0 {
		if err := json.Unmarshal(b.CityPulseRaw, &b.CityPulse); err != nil {
			return fmt.Errorf("battle_repo: unmarshal city_pulse: %w", err)
		}
	} else {
		b.CityPulse = model.CityPulse{}
	}
	b.ComputeDerived()
	return nil
}

func hydrateBattles(battles []*model.Battle) error {
	for _, b := range battles {
		if err := hydrateBattle(b); err != nil {
			return err
		}
	}
	return nil
}

// ─── Read ─────────────────────────────────────────────────────────────────────

// GetByID fetches a single battle by its UUID.
func (r *BattleRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Battle, error) {
	const q = `SELECT * FROM battles WHERE id = $1`
	var b model.Battle
	if err := r.db.GetContext(ctx, &b, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("battle_repo: get_by_id: %w", err)
	}
	if err := hydrateBattle(&b); err != nil {
		return nil, err
	}
	return &b, nil
}

// GetActive returns all currently active battles for a given content type.
// Used by the Arena page to render live face-off cards.
func (r *BattleRepo) GetActive(ctx context.Context, contentType string) ([]*model.Battle, error) {
	const q = `
		SELECT * FROM battles
		WHERE status = 'active'
		  AND content_type = $1
		  AND ends_at > NOW()
		ORDER BY starts_at DESC`

	var battles []*model.Battle
	if err := r.db.SelectContext(ctx, &battles, q, contentType); err != nil {
		return nil, fmt.Errorf("battle_repo: get_active: %w", err)
	}
	if err := hydrateBattles(battles); err != nil {
		return nil, err
	}
	return battles, nil
}

// GetAllActive returns active battles for both movies and music in one call.
// Used by GET /arena to build the full BattleListResponse.
func (r *BattleRepo) GetAllActive(ctx context.Context) ([]*model.Battle, error) {
	const q = `
		SELECT * FROM battles
		WHERE status = 'active'
		  AND ends_at > NOW()
		ORDER BY content_type ASC, starts_at DESC`

	var battles []*model.Battle
	if err := r.db.SelectContext(ctx, &battles, q); err != nil {
		return nil, fmt.Errorf("battle_repo: get_all_active: %w", err)
	}
	if err := hydrateBattles(battles); err != nil {
		return nil, err
	}
	return battles, nil
}

// GetCompleted returns the N most recently completed battles for a content type.
// Used by the Battle History section on the Arena page.
func (r *BattleRepo) GetCompleted(
	ctx context.Context,
	contentType string,
	limit int,
) ([]*model.Battle, error) {
	const q = `
		SELECT * FROM battles
		WHERE status = 'completed'
		  AND content_type = $1
		ORDER BY ends_at DESC
		LIMIT $2`

	var battles []*model.Battle
	if err := r.db.SelectContext(ctx, &battles, q, contentType, limit); err != nil {
		return nil, fmt.Errorf("battle_repo: get_completed: %w", err)
	}
	if err := hydrateBattles(battles); err != nil {
		return nil, err
	}
	return battles, nil
}

// GetAllCompleted returns recent completed battles for both content types.
// Limit applies per type — so limit=5 returns up to 10 rows total.
func (r *BattleRepo) GetAllCompleted(ctx context.Context, limitPerType int) ([]*model.Battle, error) {
	const q = `
		SELECT * FROM (
			SELECT *, ROW_NUMBER() OVER (
				PARTITION BY content_type ORDER BY ends_at DESC
			) AS rn
			FROM battles
			WHERE status = 'completed'
		) ranked
		WHERE rn <= $1
		ORDER BY content_type ASC, ends_at DESC`

	var battles []*model.Battle
	if err := r.db.SelectContext(ctx, &battles, q, limitPerType); err != nil {
		return nil, fmt.Errorf("battle_repo: get_all_completed: %w", err)
	}
	if err := hydrateBattles(battles); err != nil {
		return nil, err
	}
	return battles, nil
}

// ─── Create ───────────────────────────────────────────────────────────────────

// Create inserts a new battle row.
// Called by the arena scheduler after fn_find_battle_match returns a pair.
// Denormalised fields (titles, slugs, images) are pre-filled by the scheduler
// service from the movie/music rows it already fetched.
func (r *BattleRepo) Create(ctx context.Context, input *model.CreateBattleInput) (*model.Battle, error) {
	const q = `
		INSERT INTO battles (
			content_type,
			content_a_id, content_b_id,
			content_a_title, content_b_title,
			content_a_slug, content_b_slug,
			content_a_image, content_b_image,
			content_a_genre, content_b_genre,
			content_a_hype, content_b_hype,
			match_tier, match_reason,
			starts_at, ends_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
		)
		RETURNING *`

	var b model.Battle
	if err := r.db.GetContext(ctx, &b, q,
		input.ContentType,
		input.ContentAID,    input.ContentBID,
		input.ContentATitle, input.ContentBTitle,
		input.ContentASlug,  input.ContentBSlug,
		input.ContentAImage, input.ContentBImage,
		input.ContentAGenre, input.ContentBGenre,
		input.ContentAHype,  input.ContentBHype,
		input.MatchTier,     input.MatchReason,
		input.StartsAt,      input.EndsAt,
	); err != nil {
		return nil, fmt.Errorf("battle_repo: create: %w", err)
	}
	if err := hydrateBattle(&b); err != nil {
		return nil, err
	}
	return &b, nil
}

// ─── Close expired ────────────────────────────────────────────────────────────

// CloseExpired calls fn_close_expired_battles and returns how many were closed.
// Called by the scheduler at the start of each weekly run.
func (r *BattleRepo) CloseExpired(ctx context.Context) (int, error) {
	var closed int
	if err := r.db.GetContext(ctx, &closed, `SELECT fn_close_expired_battles()`); err != nil {
		return 0, fmt.Errorf("battle_repo: close_expired: %w", err)
	}
	return closed, nil
}

// ─── Content log ──────────────────────────────────────────────────────────────

// LogContent calls fn_log_battle_content to upsert the rotation tracker.
// Called by the scheduler after creating each new battle — once per side.
func (r *BattleRepo) LogContent(ctx context.Context, contentID uuid.UUID, contentType string) error {
	if _, err := r.db.ExecContext(
		ctx,
		`SELECT fn_log_battle_content($1, $2)`,
		contentID, contentType,
	); err != nil {
		return fmt.Errorf("battle_repo: log_content: %w", err)
	}
	return nil
}

// ─── Vote ─────────────────────────────────────────────────────────────────────

// GetUserVote checks whether a user has already voted on a battle.
// Returns "a", "b", or "" (no vote).
// Uses the engagements table: hype = voted A, flop = voted B.
func (r *BattleRepo) GetUserVote(
	ctx context.Context,
	userID uuid.UUID,
	battleID uuid.UUID,
) (string, error) {
	const q = `
		SELECT engagement_type
		FROM engagements
		WHERE user_id      = $1
		  AND content_id   = $2
		  AND content_type = 'battle'
		  AND engagement_type IN ('hype', 'flop')
		LIMIT 1`

	var engType string
	err := r.db.GetContext(ctx, &engType, q, userID, battleID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", nil // not voted yet — not an error
		}
		return "", fmt.Errorf("battle_repo: get_user_vote: %w", err)
	}

	// Translate engagement_type back to side label
	if engType == "hype" {
		return "a", nil
	}
	return "b", nil
}

// SubmitVote inserts or toggles a battle vote in the engagements table.
// Reuses the existing engagement upsert pattern:
//   same side → toggles off (deletes)
//   different side → replaces
// The fn_refresh_battle_votes trigger updates votes_a/votes_b automatically.
func (r *BattleRepo) SubmitVote(
	ctx context.Context,
	battleID uuid.UUID,
	userID uuid.UUID,
	side string, // "a" or "b"
	weight float64,
	city string,
	state string,
) (voted bool, err error) {
	engType := "hype" // side a
	if side == "b" {
		engType = "flop"
	}

	// Check existing vote on this battle
	existing, err := r.GetUserVote(ctx, userID, battleID)
	if err != nil {
		return false, err
	}

	// Toggle off — same side clicked again
	if existing == side {
		const del = `
			DELETE FROM engagements
			WHERE user_id      = $1
			  AND content_id   = $2
			  AND content_type = 'battle'
			  AND engagement_type = $3`
		if _, err := r.db.ExecContext(ctx, del, userID, battleID, engType); err != nil {
			return false, fmt.Errorf("battle_repo: submit_vote toggle_off: %w", err)
		}
		return false, nil
	}

	// Switch side — delete existing vote first
	if existing != "" {
		const del = `
			DELETE FROM engagements
			WHERE user_id      = $1
			  AND content_id   = $2
			  AND content_type = 'battle'`
		if _, err := r.db.ExecContext(ctx, del, userID, battleID); err != nil {
			return false, fmt.Errorf("battle_repo: submit_vote delete_old: %w", err)
		}
	}

	// Insert new vote
	const ins = `
		INSERT INTO engagements (
			user_id, content_id, content_type,
			engagement_type, weight, city, state, country
		) VALUES ($1, $2, 'battle', $3, $4, $5, $6, 'Nigeria')
		ON CONFLICT DO NOTHING`

	res, err := r.db.ExecContext(ctx, ins,
		userID, battleID, engType, weight, city, state,
	)
	if err != nil {
		return false, fmt.Errorf("battle_repo: submit_vote insert: %w", err)
	}

	rows, _ := res.RowsAffected()
	return rows > 0, nil
}

// ─── Scheduler helpers ────────────────────────────────────────────────────────

// GetTaskMetadata fetches the current state of a scheduler task.
// Used by the heartbeat ticker and startup catch-up check.
func (r *BattleRepo) GetTaskMetadata(
	ctx context.Context,
	taskName string,
) (*model.TaskMetadata, error) {
	const q = `SELECT * FROM task_metadata WHERE task_name = $1`
	var t model.TaskMetadata
	if err := r.db.GetContext(ctx, &t, q, taskName); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("battle_repo: get_task_metadata: %w", err)
	}
	return &t, nil
}

// ClaimTask attempts atomic task claim via fn_claim_task.
// Returns true if this process won the claim.
// Handles zombie unlock internally before attempting claim.
func (r *BattleRepo) ClaimTask(ctx context.Context, taskName string) (bool, error) {
	var claimed bool
	if err := r.db.GetContext(ctx, &claimed,
		`SELECT fn_claim_task($1)`, taskName,
	); err != nil {
		return false, fmt.Errorf("battle_repo: claim_task: %w", err)
	}
	return claimed, nil
}

// CompleteTask marks a task idle and schedules its next run.
func (r *BattleRepo) CompleteTask(ctx context.Context, taskName string) error {
	if _, err := r.db.ExecContext(ctx,
		`SELECT fn_complete_task($1)`, taskName,
	); err != nil {
		return fmt.Errorf("battle_repo: complete_task: %w", err)
	}
	return nil
}

// FailTask resets a task to idle with an error message.
// Next run is scheduled for 1 hour from now (not full week).
func (r *BattleRepo) FailTask(ctx context.Context, taskName string, taskErr error) error {
	if _, err := r.db.ExecContext(ctx,
		`SELECT fn_fail_task($1, $2)`, taskName, taskErr.Error(),
	); err != nil {
		return fmt.Errorf("battle_repo: fail_task: %w", err)
	}
	return nil
}

// GetAllTaskMetadata returns current state of all scheduled tasks.
// Used by admin health endpoint (future) and startup logging.
func (r *BattleRepo) GetAllTaskMetadata(ctx context.Context) ([]*model.TaskMetadata, error) {
	const q = `SELECT * FROM task_metadata ORDER BY task_name ASC`
	var tasks []*model.TaskMetadata
	if err := r.db.SelectContext(ctx, &tasks, q); err != nil {
		return nil, fmt.Errorf("battle_repo: get_all_task_metadata: %w", err)
	}
	return tasks, nil
}

// ─── Content lookup for matchmaking ──────────────────────────────────────────

// GetContentForBattle fetches the fields needed to populate a CreateBattleInput
// for a given content type and ID. Called by the scheduler after matchmaking
// to fill denormalised title/slug/image/genre/hype on the new battle row.
func (r *BattleRepo) GetContentForBattle(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) (*model.CreateBattleInput, error) {
	type contentRow struct {
		ID        uuid.UUID `db:"id"`
		Title     string    `db:"title"`
		Slug      string    `db:"slug"`
		ImageURL  *string   `db:"image_url"`
		Genre     *string   `db:"genre"`
		HypeScore float64   `db:"hype_score"`
	}

	var row contentRow
	var q string

	switch contentType {
	case "movie":
		q = `SELECT id, title, slug, poster_url AS image_url, genre, hype_score
			 FROM movies WHERE id = $1`
	case "music":
		q = `SELECT id, title, slug, cover_url AS image_url, genre, hype_score
			 FROM music WHERE id = $1`
	default:
		return nil, fmt.Errorf("battle_repo: get_content_for_battle: unknown content_type %q", contentType)
	}

	if err := r.db.GetContext(ctx, &row, q, contentID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("battle_repo: get_content_for_battle: %w", err)
	}

	return &model.CreateBattleInput{
		ContentType:   contentType,
		ContentAID:    row.ID,
		ContentATitle: row.Title,
		ContentASlug:  row.Slug,
		ContentAImage: row.ImageURL,
		ContentAGenre: row.Genre,
		ContentAHype:  row.HypeScore,
		StartsAt:      time.Now().UTC(),
	}, nil
}

// GetDominantCity returns the city with the highest engagement count
// for a given content from analytics_snapshots.
// Used by fn_find_battle_match Tier 4 and by the scheduler to pass
// p_anchor_city when calling the matchmaking function.
func (r *BattleRepo) GetDominantCity(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) (string, error) {
	const q = `
		SELECT
			CASE
				WHEN lagos_count >= abuja_count
				 AND lagos_count >= enugu_count
				 AND lagos_count >= kano_count
				 AND lagos_count >= ph_count    THEN 'Lagos'
				WHEN abuja_count >= enugu_count
				 AND abuja_count >= kano_count
				 AND abuja_count >= ph_count    THEN 'Abuja'
				WHEN enugu_count >= kano_count
				 AND enugu_count >= ph_count    THEN 'Enugu'
				WHEN kano_count >= ph_count     THEN 'Kano'
				ELSE                                 'Port Harcourt'
			END AS dominant_city
		FROM analytics_snapshots
		WHERE content_id   = $1
		  AND content_type = $2
		ORDER BY snapshot_date DESC
		LIMIT 1`

	var city string
	err := r.db.GetContext(ctx, &city, q, contentID, contentType)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "Lagos", nil // default — Lagos is always the largest market
		}
		return "", fmt.Errorf("battle_repo: get_dominant_city: %w", err)
	}
	return city, nil
}

// FindMatch calls fn_find_battle_match and returns the matched content UUID.
// The DB function handles all 5 tiers internally — the repo just executes it.
func (r *BattleRepo) FindMatch(
	ctx context.Context,
	anchorID uuid.UUID,
	contentType string,
	anchorGenre string,
	anchorHype float64,
	anchorCity string,
) (uuid.UUID, error) {
	const q = `SELECT fn_find_battle_match($1, $2, $3, $4, $5)`
	var matchID uuid.UUID
	if err := r.db.GetContext(ctx, &matchID, q,
		anchorID, contentType, anchorGenre, anchorHype, anchorCity,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return uuid.Nil, ErrNotFound
		}
		return uuid.Nil, fmt.Errorf("battle_repo: find_match: %w", err)
	}
	if matchID == uuid.Nil {
		return uuid.Nil, ErrNotFound
	}
	return matchID, nil
}

// GetAnchorContent picks Content A for a new battle.
// Selects the content with highest street_pull_score that:
//   - has not been in a battle in the last 4 weeks
//   - is not currently in an active battle
// Called by the scheduler at the start of each weekly run.
func (r *BattleRepo) GetAnchorContent(
	ctx context.Context,
	contentType string,
) (uuid.UUID, string, float64, error) {
	type anchorRow struct {
		ID        uuid.UUID `db:"id"`
		Genre     string    `db:"genre"`
		HypeScore float64   `db:"hype_score"`
	}

	table := "movies"
	if contentType == "music" {
		table = "music"
	}

	q := fmt.Sprintf(`
		SELECT c.id, COALESCE(c.genre, '') AS genre, c.hype_score
		FROM %s c
		LEFT JOIN battle_content_log bcl
			ON bcl.content_id = c.id AND bcl.content_type = $1
		WHERE c.id NOT IN (
			SELECT content_a_id FROM battles
			WHERE status = 'active' AND content_type = $1
			UNION ALL
			SELECT content_b_id FROM battles
			WHERE status = 'active' AND content_type = $1
		)
		AND (
			bcl.last_battled_at IS NULL
			OR bcl.last_battled_at < NOW() - INTERVAL '28 days'
		)
		ORDER BY c.street_pull_score DESC, bcl.last_battled_at ASC NULLS FIRST
		LIMIT 1`, table)

	var row anchorRow
	if err := r.db.GetContext(ctx, &row, q, contentType); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return uuid.Nil, "", 0, ErrNotFound
		}
		return uuid.Nil, "", 0, fmt.Errorf("battle_repo: get_anchor_content: %w", err)
	}
	return row.ID, row.Genre, row.HypeScore, nil
}