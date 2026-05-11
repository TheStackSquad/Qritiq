// server/pkg/services/street_pull_service.go

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

type StreetPullService struct {
	repo *repository.StreetPullRepo
}

func NewStreetPullService(repo *repository.StreetPullRepo) *StreetPullService {
	return &StreetPullService{repo: repo}
}

// ─── Single content recompute ─────────────────────────────────────────────────

// RecomputeOne fetches the engagement counts for one content item,
// computes the street_pull_score, and writes it back to the DB.
//
// Called after every engagement or rating event on a content item.
// Runs on the hot path but only touches one row — acceptable latency.
//
// contentType: "movie" | "music"
func (s *StreetPullService) RecomputeOne(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) error {
	input, err := s.repo.GetSingleInput(ctx, contentID, contentType)
	if err != nil {
		return fmt.Errorf("street_pull_service: recompute_one get_input: %w", err)
	}

	score := input.Compute()

	if err := s.repo.UpdateScore(ctx, &model.StreetPullUpdate{
		ContentID:       contentID,
		ContentType:     contentType,
		StreetPullScore: score,
	}); err != nil {
		return fmt.Errorf("street_pull_service: recompute_one update: %w", err)
	}

	return nil
}

// ─── Snippet play ─────────────────────────────────────────────────────────────

// RecordSnippetPlay increments snippet_plays on a music track and
// immediately recomputes its street_pull_score.
//
// Called by POST /music/:slug/play.
// Auth is optional — guests contribute play counts.
func (s *StreetPullService) RecordSnippetPlay(
	ctx context.Context,
	musicID uuid.UUID,
) error {
	if err := s.repo.IncrementSnippetPlays(ctx, musicID); err != nil {
		return fmt.Errorf("street_pull_service: record_snippet_play increment: %w", err)
	}

	// Recompute score immediately — snippet_plays just changed
	if err := s.RecomputeOne(ctx, musicID, "music"); err != nil {
		// Non-fatal — play was recorded, score will catch up on next full recompute
		log.Printf("[street_pull] recompute after snippet_play failed for %s: %v", musicID, err)
	}

	return nil
}

// ─── Full bulk recompute ──────────────────────────────────────────────────────

// RecomputeAll recomputes street_pull_score for every non-archived movie and
// music track in a single pass. Uses bulk UPDATE via unnest arrays.
//
// Called nightly by a scheduled task (future: add task_metadata entry).
// Also safe to call manually after data migrations or bulk imports.
func (s *StreetPullService) RecomputeAll(ctx context.Context) error {
	start := time.Now()
	log.Println("[street_pull] starting full recompute")

	// Movies
	movieInputs, err := s.repo.GetMovieInputs(ctx)
	if err != nil {
		return fmt.Errorf("street_pull_service: recompute_all get_movies: %w", err)
	}

	movieUpdates := make([]*model.StreetPullUpdate, 0, len(movieInputs))
	for _, input := range movieInputs {
		movieUpdates = append(movieUpdates, &model.StreetPullUpdate{
			ContentID:       input.ContentID,
			ContentType:     "movie",
			StreetPullScore: input.Compute(),
		})
	}

	if err := s.repo.BulkUpdateMovieScores(ctx, movieUpdates); err != nil {
		return fmt.Errorf("street_pull_service: recompute_all bulk_movies: %w", err)
	}

	// Music
	musicInputs, err := s.repo.GetMusicInputs(ctx)
	if err != nil {
		return fmt.Errorf("street_pull_service: recompute_all get_music: %w", err)
	}

	musicUpdates := make([]*model.StreetPullUpdate, 0, len(musicInputs))
	for _, input := range musicInputs {
		musicUpdates = append(musicUpdates, &model.StreetPullUpdate{
			ContentID:       input.ContentID,
			ContentType:     "music",
			StreetPullScore: input.Compute(),
		})
	}

	if err := s.repo.BulkUpdateMusicScores(ctx, musicUpdates); err != nil {
		return fmt.Errorf("street_pull_service: recompute_all bulk_music: %w", err)
	}

	log.Printf("[street_pull] full recompute done — movies=%d music=%d duration=%dms",
		len(movieUpdates), len(musicUpdates), time.Since(start).Milliseconds())

	return nil
}