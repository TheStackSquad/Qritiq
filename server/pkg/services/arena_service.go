// server/pkg/services/arena_service.go

package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
)

type ArenaService struct {
	battleRepo *repository.BattleRepo
	arenaRepo  *repository.ArenaRepo
	cfg        model.SchedulerConfig
}

func NewArenaService(
	battleRepo *repository.BattleRepo,
	arenaRepo  *repository.ArenaRepo,
	cfg        model.SchedulerConfig,
) *ArenaService {
	return &ArenaService{
		battleRepo: battleRepo,
		arenaRepo:  arenaRepo,
		cfg:        cfg,
	}
}

// ─── Public API ───────────────────────────────────────────────────────────────

// GetArena returns the full Arena page payload.
// Splits active battles into movies/music slices for the client.
func (s *ArenaService) GetArena(ctx context.Context) (*repository.ArenaPayload, error) {
	payload, err := s.arenaRepo.GetArenaPayload(ctx, 5)
	if err != nil {
		return nil, fmt.Errorf("arena_service: get_arena: %w", err)
	}
	return payload, nil
}

// GetBattle returns a single battle by ID with the user's vote state.
// userID is nil for unauthenticated requests.
func (s *ArenaService) GetBattle(
	ctx context.Context,
	battleID uuid.UUID,
	userID *uuid.UUID,
) (*model.Battle, error) {
	battle, err := s.battleRepo.GetByID(ctx, battleID)
	if err != nil {
		return nil, fmt.Errorf("arena_service: get_battle: %w", err)
	}

	if userID != nil {
		vote, err := s.battleRepo.GetUserVote(ctx, *userID, battleID)
		if err != nil {
			return nil, fmt.Errorf("arena_service: get_battle vote: %w", err)
		}
		if vote != "" {
			battle.UserVote = &vote
		}
	}

	return battle, nil
}

// Vote submits or toggles a user's vote on a battle.
// Returns voted=true if the vote was recorded, false if toggled off.
func (s *ArenaService) Vote(
	ctx context.Context,
	input model.BattleVoteInput,
	userID uuid.UUID,
	userRole model.UserRole,
	city string,
	state string,
) (bool, error) {
	battleID, err := uuid.Parse(input.BattleID)
	if err != nil {
		return false, fmt.Errorf("arena_service: vote: invalid battle_id")
	}

	// Verify battle is still active
	battle, err := s.battleRepo.GetByID(ctx, battleID)
	if err != nil {
		return false, fmt.Errorf("arena_service: vote: %w", err)
	}
	if battle.Status != model.BattleActive {
		return false, fmt.Errorf("arena_service: vote: battle is not active")
	}
	if time.Now().UTC().After(battle.EndsAt) {
		return false, fmt.Errorf("arena_service: vote: battle has ended")
	}

	weight := model.VoteWeightMap[userRole]

	voted, err := s.battleRepo.SubmitVote(
		ctx, battleID, userID, input.Side, weight, city, state,
	)
	if err != nil {
		return false, fmt.Errorf("arena_service: vote: %w", err)
	}
	return voted, nil
}

// GetLeaderboard returns the Street Pull leaderboard.
// contentType: "movie", "music", or "" for combined.
func (s *ArenaService) GetLeaderboard(
	ctx context.Context,
	contentType string,
	limit int,
) ([]*model.StreetPullEntry, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	if contentType == "" {
		return s.arenaRepo.GetStreetPullLeaderboard(ctx, limit)
	}
	return s.arenaRepo.GetStreetPullByType(ctx, contentType, limit)
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

// StartScheduler launches the goroutine-based weekly face-off scheduler.
// Call once from main.go after DB connection is established.
//
// Architecture:
//   1. Startup catch-up check — fires immediately if any task is overdue
//   2. Hourly heartbeat ticker — checks task_metadata every hour
//   3. Atomic DB claim — prevents double-trigger and race conditions
//
// All state lives in task_metadata — no in-memory timers.
// Survives Railway hard restarts, crashes, and downtime blackouts.
func (s *ArenaService) StartScheduler(ctx context.Context) {
	log.Println("[arena_scheduler] starting")

	// Step 1: Startup catch-up — run immediately for any overdue task
	for _, taskName := range model.AllScheduledTasks {
		s.runTaskIfDue(ctx, taskName)
	}

	// Step 2: Hourly heartbeat
	ticker := time.NewTicker(s.cfg.HeartbeatInterval)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				for _, taskName := range model.AllScheduledTasks {
					s.runTaskIfDue(ctx, taskName)
				}
			case <-ctx.Done():
				log.Println("[arena_scheduler] context cancelled — shutting down")
				return
			}
		}
	}()
}

// runTaskIfDue checks task_metadata and fires the task if it is due.
// Uses IsDue() as a pre-check before the atomic DB claim to avoid
// unnecessary DB writes on every hourly tick.
func (s *ArenaService) runTaskIfDue(ctx context.Context, taskName string) {
	meta, err := s.battleRepo.GetTaskMetadata(ctx, taskName)
	if err != nil {
		log.Printf("[arena_scheduler] get_task_metadata %s: %v", taskName, err)
		return
	}

	if !meta.IsDue() {
		return
	}

	// Log zombie detection (fn_claim_task handles the actual unlock)
	if meta.IsZombie() {
		log.Printf("[arena_scheduler] zombie detected on %s — started_at %v, releasing",
			taskName, meta.StartedAt)
	}

	// Atomic claim — only one process wins
	claimed, err := s.battleRepo.ClaimTask(ctx, taskName)
	if err != nil {
		log.Printf("[arena_scheduler] claim_task %s: %v", taskName, err)
		return
	}
	if !claimed {
		log.Printf("[arena_scheduler] %s already claimed by another process — skipping", taskName)
		return
	}

	log.Printf("[arena_scheduler] claimed %s — running weekly face-off", taskName)
	result := s.runWeeklyFaceoff(ctx, taskName)

	if result.Error != "" {
		log.Printf("[arena_scheduler] %s FAILED: %s (duration %dms)",
			taskName, result.Error, result.DurationMs)
		if err := s.battleRepo.FailTask(ctx, taskName,
			fmt.Errorf("%s", result.Error)); err != nil {
			log.Printf("[arena_scheduler] fail_task %s: %v", taskName, err)
		}
		return
	}

	log.Printf("[arena_scheduler] %s completed — closed=%d created=%v tier=%d duration=%dms",
		taskName, result.BattlesClosed, result.BattleCreated,
		result.MatchTier, result.DurationMs)

	if err := s.battleRepo.CompleteTask(ctx, taskName); err != nil {
		log.Printf("[arena_scheduler] complete_task %s: %v", taskName, err)
	}
}

// runWeeklyFaceoff executes the full battle lifecycle for one content type:
//   1. Close expired battles
//   2. Pick Content A (anchor)
//   3. Find Content B (matchmaking via fn_find_battle_match)
//   4. Create new battle row
//   5. Log both sides in battle_content_log
func (s *ArenaService) runWeeklyFaceoff(
	ctx context.Context,
	taskName string,
) model.SchedulerRunResult {
	start := time.Now()
	result := model.SchedulerRunResult{
		TaskName: taskName,
		RanAt:    start,
	}

	contentType := "movie"
	if taskName == model.TaskWeeklyFaceoffMusic {
		contentType = "music"
	}
	result.ContentType = contentType

	// Step 1: Close expired battles
	closed, err := s.battleRepo.CloseExpired(ctx)
	if err != nil {
		result.Error = fmt.Sprintf("close_expired: %v", err)
		result.DurationMs = time.Since(start).Milliseconds()
		return result
	}
	result.BattlesClosed = closed
	log.Printf("[arena_scheduler] closed %d expired %s battles", closed, contentType)

	// Step 2: Pick anchor (Content A)
	anchorID, anchorGenre, anchorHype, err := s.battleRepo.GetAnchorContent(ctx, contentType)
	if err != nil {
		// No eligible content — not a fatal error, just nothing to battle
		log.Printf("[arena_scheduler] no eligible anchor for %s: %v", contentType, err)
		result.DurationMs = time.Since(start).Milliseconds()
		return result
	}

	// Step 3: Get anchor's dominant city for Tier 4 matchmaking
	anchorCity, err := s.battleRepo.GetDominantCity(ctx, anchorID, contentType)
	if err != nil {
		anchorCity = "Lagos" // safe default
	}

	// Step 4: Find match (Content B) — fn_find_battle_match tries Tier 1→5
	matchID, err := s.battleRepo.FindMatch(
		ctx, anchorID, contentType, anchorGenre, anchorHype, anchorCity,
	)
	if err != nil {
		log.Printf("[arena_scheduler] no match found for %s anchor %s: %v",
			contentType, anchorID, err)
		result.DurationMs = time.Since(start).Milliseconds()
		return result
	}

	// Step 5: Fetch full content rows to build CreateBattleInput
	inputA, err := s.battleRepo.GetContentForBattle(ctx, anchorID, contentType)
	if err != nil {
		result.Error = fmt.Sprintf("get_content_a: %v", err)
		result.DurationMs = time.Since(start).Milliseconds()
		return result
	}

	inputB, err := s.battleRepo.GetContentForBattle(ctx, matchID, contentType)
	if err != nil {
		result.Error = fmt.Sprintf("get_content_b: %v", err)
		result.DurationMs = time.Since(start).Milliseconds()
		return result
	}

	// Step 6: Build and insert the battle
	now := time.Now().UTC()
	createInput := &model.CreateBattleInput{
		ContentType:   contentType,
		ContentAID:    inputA.ContentAID,
		ContentATitle: inputA.ContentATitle,
		ContentASlug:  inputA.ContentASlug,
		ContentAImage: inputA.ContentAImage,
		ContentAGenre: inputA.ContentAGenre,
		ContentAHype:  inputA.ContentAHype,
		ContentBID:    inputB.ContentAID, // inputB was fetched as "A" position
		ContentBTitle: inputB.ContentATitle,
		ContentBSlug:  inputB.ContentASlug,
		ContentBImage: inputB.ContentAImage,
		ContentBGenre: inputB.ContentAGenre,
		ContentBHype:  inputB.ContentAHype,
		MatchTier:     s.inferTier(anchorGenre, inputB.ContentAGenre, anchorHype, inputB.ContentAHype),
		MatchReason:   s.buildMatchReason(anchorGenre, inputB.ContentAGenre, anchorHype, inputB.ContentAHype, anchorCity),
		StartsAt:      now,
		EndsAt:        now.Add(s.cfg.BattleDuration),
	}

	battle, err := s.battleRepo.Create(ctx, createInput)
	if err != nil {
		result.Error = fmt.Sprintf("create_battle: %v", err)
		result.DurationMs = time.Since(start).Milliseconds()
		return result
	}

	result.BattleCreated = true
	result.MatchTier = battle.MatchTier
	if battle.MatchReason != nil {
		result.MatchReason = *battle.MatchReason
	}

	// Step 7: Log both sides in battle_content_log (cooling period + rotation)
	if err := s.battleRepo.LogContent(ctx, anchorID, contentType); err != nil {
		log.Printf("[arena_scheduler] log_content A %s: %v", anchorID, err)
	}
	if err := s.battleRepo.LogContent(ctx, matchID, contentType); err != nil {
		log.Printf("[arena_scheduler] log_content B %s: %v", matchID, err)
	}

	result.DurationMs = time.Since(start).Milliseconds()
	return result
}

// ─── Match reason helpers ─────────────────────────────────────────────────────

// inferTier approximates which tier produced the match for the match_tier column.
// The DB function fn_find_battle_match doesn't return the tier it used — this
// approximates it from the input conditions for audit/display purposes.
func (s *ArenaService) inferTier(
	genreA string,
	genreB *string,
	hypeA float64,
	hypeB float64,
) int {
	sameGenre := genreB != nil && *genreB == genreA
	hypeDiff := hypeA - hypeB
	if hypeDiff < 0 {
		hypeDiff = -hypeDiff
	}

	switch {
	case sameGenre && hypeDiff <= 15:
		return 1
	case sameGenre:
		return 2
	case hypeDiff <= 20:
		return 3
	default:
		return 4
	}
}

// buildMatchReason constructs a human-readable description of why these two
// pieces of content were matched. Stored in battles.match_reason for transparency.
func (s *ArenaService) buildMatchReason(
	genreA string,
	genreB *string,
	hypeA float64,
	hypeB float64,
	city string,
) string {
	hypeDiff := hypeA - hypeB
	if hypeDiff < 0 {
		hypeDiff = -hypeDiff
	}

	genreBStr := "unknown"
	if genreB != nil {
		genreBStr = *genreB
	}

	if genreB != nil && *genreB == genreA {
		return fmt.Sprintf("Same genre (%s), hype gap %.1f pts", genreA, hypeDiff)
	}
	return fmt.Sprintf(
		"Cross-genre (%s vs %s), hype gap %.1f pts, %s city affinity",
		genreA, genreBStr, hypeDiff, city,
	)
}

// convertGenrePtr safely dereferences a *string genre from GetContentForBattle.
func convertGenrePtr(g *string) string {
	if g == nil {
		return ""
	}
	return *g
}