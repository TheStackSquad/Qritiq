// server/pkg/services/engagement_services.go
// Updated: hooks StreetPullService and SpotlightService after engagement/rating events

package services

import (
	"context"
	"fmt"
	"log"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/qritiq/server/pkg/db"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
)

// ─── Service ──────────────────────────────────────────────────────────────────

type EngagementService struct {
	engRepo        *repository.EngagementRepo
	ratingRepo     *repository.RatingRepo
	redis          *redis.Client
	ipSvc          *IPService
	streetPullSvc  *StreetPullService  // recomputes street_pull_score after each event
	spotlightSvc   *SpotlightService   // refreshes person scores after each event
}

func NewEngagementService(
	engRepo       *repository.EngagementRepo,
	ratingRepo    *repository.RatingRepo,
	rdb           *redis.Client,
	ipSvc         *IPService,
	streetPullSvc *StreetPullService,
	spotlightSvc  *SpotlightService,
) *EngagementService {
	return &EngagementService{
		engRepo:       engRepo,
		ratingRepo:    ratingRepo,
		redis:         rdb,
		ipSvc:         ipSvc,
		streetPullSvc: streetPullSvc,
		spotlightSvc:  spotlightSvc,
	}
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Submit processes a like, dislike, hype, meh, flop, or watch engagement.
// After the engagement is recorded:
//   - street_pull_score is recomputed for the content (single-row, fast)
//   - person scores are refreshed for credited persons (small N, acceptable)
//   - Redis cache is invalidated
func (s *EngagementService) Submit(
	ctx context.Context,
	input model.EngagementInput,
	userID *uuid.UUID,
	sessionID string,
	ipAddress string,
	userRole model.UserRole,
) (bool, error) {
	city, state := s.ipSvc.GetLocation(ipAddress)

	contentID, err := uuid.Parse(input.ContentID)
	if err != nil {
		return false, fmt.Errorf("invalid content_id")
	}

	engType := model.EngagementType(input.EngagementType)
	weight  := model.VoteWeightMap[userRole]

	// ── Hype toggle ───────────────────────────────────────────────────────────
	if userID != nil && isHypeType(engType) {
		exists, existingType, err := s.engRepo.GetExistingHypeVote(ctx, *userID, contentID, input.ContentType)
		if err != nil {
			return false, err
		}
		if exists {
			if err := s.engRepo.Delete(ctx, *userID, contentID, input.ContentType, existingType); err != nil {
				return false, err
			}
			s.invalidateCache(ctx, input.ContentID)
			if existingType == engType {
				// Toggled off — recompute score after deletion
				s.recomputeAsync(ctx, contentID, input.ContentType)
				return false, nil
			}
		}
	}

	// ── Like toggle ───────────────────────────────────────────────────────────
	if userID != nil && isLikeType(engType) {
		exists, existingType, err := s.engRepo.GetExistingLikeVote(ctx, *userID, contentID, input.ContentType)
		if err != nil {
			return false, err
		}
		if exists {
			if err := s.engRepo.Delete(ctx, *userID, contentID, input.ContentType, existingType); err != nil {
				return false, err
			}
			s.invalidateCache(ctx, input.ContentID)
			if existingType == engType {
				s.recomputeAsync(ctx, contentID, input.ContentType)
				return false, nil
			}
		}
	}

	// ── Insert ────────────────────────────────────────────────────────────────
	eng := &model.Engagement{
		UserID:         userID,
		ContentID:      contentID,
		ContentType:    input.ContentType,
		EngagementType: engType,
		Weight:         weight,
		City:           &city,
		State:          &state,
	}
	if userID == nil && sessionID != "" {
		eng.SessionID = &sessionID
	}

	isNew, err := s.engRepo.Upsert(ctx, eng)
	if err != nil {
		return false, err
	}

	if isNew {
		s.invalidateCache(ctx, input.ContentID)

		// Recompute street pull score — single row, fast
		s.recomputeAsync(ctx, contentID, input.ContentType)

		// Refresh person scores for credited persons on this content
		s.refreshPersonsAsync(ctx, contentID, input.ContentType)
	}

	return isNew, nil
}

// SubmitRating submits or updates a post-release star rating (1.0–5.0).
// Triggers street_pull_score recompute and person score refresh.
func (s *EngagementService) SubmitRating(
	ctx context.Context,
	input model.RatingInput,
	userID uuid.UUID,
	userRole model.UserRole,
) error {
	contentID, err := uuid.Parse(input.ContentID)
	if err != nil {
		return fmt.Errorf("invalid content_id")
	}

	ratingRole := "user"
	if userRole == model.RoleCritic {
		ratingRole = "critic"
	}

	rating := &model.Rating{
		UserID:      userID,
		ContentID:   contentID,
		ContentType: input.ContentType,
		Score:       input.Score,
		Weight:      model.VoteWeightMap[userRole],
		Role:        ratingRole,
	}

	if err := s.ratingRepo.Upsert(ctx, rating); err != nil {
		return err
	}

	s.invalidateCache(ctx, input.ContentID)

	// Recompute street pull — rating weight is 0.80, meaningful signal
	s.recomputeAsync(ctx, contentID, input.ContentType)

	// Refresh person scores — ratings on works affect person avg_rating
	s.refreshPersonsAsync(ctx, contentID, input.ContentType)

	return nil
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

func isHypeType(t model.EngagementType) bool {
	return t == model.EngageHype || t == model.EngageMeh || t == model.EngageFlop
}

func isLikeType(t model.EngagementType) bool {
	return t == model.EngageLike || t == model.EngageDislike
}

func (s *EngagementService) invalidateCache(ctx context.Context, contentID string) {
	s.redis.Del(ctx,
		fmt.Sprintf(db.KeyMovieCard, contentID),
		fmt.Sprintf(db.KeyMusicCard, contentID),
	)
}

// recomputeAsync recomputes street_pull_score in a goroutine.
// Fire-and-forget — a failure here does not affect the engagement response.
// Score will self-correct on next event or nightly bulk recompute.
func (s *EngagementService) recomputeAsync(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) {
	go func() {
		if err := s.streetPullSvc.RecomputeOne(ctx, contentID, contentType); err != nil {
			log.Printf("[engagement] recompute_street_pull %s %s: %v",
				contentType, contentID, err)
		}
	}()
}

// refreshPersonsAsync refreshes person scores in a goroutine.
// Fire-and-forget — person scores are eventually consistent, not real-time.
func (s *EngagementService) refreshPersonsAsync(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) {
	go func() {
		if err := s.spotlightSvc.RefreshScoresForContent(ctx, contentID, contentType); err != nil {
			log.Printf("[engagement] refresh_persons %s %s: %v",
				contentType, contentID, err)
		}
	}()
}