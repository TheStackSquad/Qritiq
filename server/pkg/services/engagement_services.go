// server/pkg/services/engagement_services.go

package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/qritiq/server/pkg/db"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
)

// ─── Service ──────────────────────────────────────────────────────────────────

type EngagementService struct {
	engRepo    *repository.EngagementRepo
	ratingRepo *repository.RatingRepo
	redis      *redis.Client
	ipSvc      *IPService
}

func NewEngagementService(
	engRepo    *repository.EngagementRepo,
	ratingRepo *repository.RatingRepo,
	rdb        *redis.Client,
	ipSvc      *IPService,
) *EngagementService {
	return &EngagementService{
		engRepo:    engRepo,
		ratingRepo: ratingRepo,
		redis:      rdb,
		ipSvc:      ipSvc,
	}
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Submit processes a like, dislike, hype, meh, flop, or watch engagement.
// Hype-type and like-type votes toggle — same type removes the vote,
// different type replaces it. One vote per category per user per content.
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

	// ── Hype toggle — hype / meh / flop ──────────────────────────────────
	// Same type → toggle off. Different type → delete old, insert new.
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
				return false, nil // toggled off — done
			}
			// Different type — fall through to insert
		}
	}

	// ── Like toggle — like / dislike ──────────────────────────────────────
	// Same type → toggle off. Different type → delete old, insert new.
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
				return false, nil // toggled off — done
			}
			// Different type — fall through to insert
		}
	}

	// ── Insert ────────────────────────────────────────────────────────────
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
	}

	return isNew, nil
}

// SubmitRating submits or updates a post-release star rating (1.0–5.0).
// The DB trigger recalculates rating_score automatically on upsert.
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

	// Derive rating role from authenticated user's platform role.
	// Never trust the client to self-identify as a critic.
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