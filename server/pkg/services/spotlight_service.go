// server/pkg/services/spotlight_service.go

package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
)

type SpotlightService struct {
	personRepo *repository.PersonRepo
}

func NewSpotlightService(personRepo *repository.PersonRepo) *SpotlightService {
	return &SpotlightService{personRepo: personRepo}
}

// ─── Spotlight list ───────────────────────────────────────────────────────────

// GetSpotlight returns the full Spotlight page payload.
// Featured persons + paginated list with optional role filter and search.
func (s *SpotlightService) GetSpotlight(
	ctx context.Context,
	filter model.SpotlightFilter,
) (*model.SpotlightListResponse, error) {
	payload, err := s.personRepo.GetSpotlightPayload(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("spotlight_service: get_spotlight: %w", err)
	}
	return payload, nil
}

// ─── Person slug page ─────────────────────────────────────────────────────────

// GetPerson returns a full person profile with their credited works.
// Used by GET /spotlight/:slug.
func (s *SpotlightService) GetPerson(
	ctx context.Context,
	slug string,
) (*model.Person, error) {
	person, err := s.personRepo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("spotlight_service: get_person: %w", err)
	}

	credits, err := s.personRepo.GetCreditsForPerson(ctx, person.ID)
	if err != nil {
		return nil, fmt.Errorf("spotlight_service: get_person credits: %w", err)
	}

	person.Credits = credits
	return person, nil
}

// ─── Crew panel for content pages ────────────────────────────────────────────

// GetPersonsForContent returns all persons credited on a movie or track.
// Used by the crew panel on /movies/:slug and /music/:slug.
func (s *SpotlightService) GetPersonsForContent(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) ([]*repository.PersonOnContent, error) {
	persons, err := s.personRepo.GetPersonsForContent(ctx, contentID, contentType)
	if err != nil {
		return nil, fmt.Errorf("spotlight_service: get_persons_for_content: %w", err)
	}
	return persons, nil
}

// ─── Person score refresh ─────────────────────────────────────────────────────

// RefreshScoresForContent refreshes avg_hype_score and avg_rating for all
// persons credited on a given content item.
//
// Called by EngagementService and RatingService after hype/rating events
// so that person scores stay in sync when their works gain engagement.
//
// This runs synchronously for now — acceptable because person_credits per
// content is small (typically 2-10 persons). If it becomes a bottleneck,
// move to a goroutine fire-and-forget pattern.
func (s *SpotlightService) RefreshScoresForContent(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) error {
	personIDs, err := s.personRepo.GetPersonIDsForContent(ctx, contentID, contentType)
	if err != nil {
		return fmt.Errorf("spotlight_service: refresh_scores_for_content get_ids: %w", err)
	}

	for _, id := range personIDs {
		if err := s.personRepo.RefreshPersonScores(ctx, id); err != nil {
			// Log and continue — one person failing should not block others
			// In production, structured logging replaces this
			_ = fmt.Errorf("spotlight_service: refresh_person_scores %s: %w", id, err)
		}
	}

	return nil
}