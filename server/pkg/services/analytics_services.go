// server/pkg/services/analytics_service.go
package services

import (
	"context"

	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
)

type AnalyticsService struct {
	repo *repository.AnalyticsRepository
}

func NewAnalyticsService(repo *repository.AnalyticsRepository) *AnalyticsService {
	return &AnalyticsService{repo: repo}
}

// GetDashboard returns the full dashboard payload for one movie.
// Returns a typed *repository.DashboardPayload (not interface{}).
func (s *AnalyticsService) GetDashboard(
	ctx context.Context,
	movieID uuid.UUID,
	creatorUserID uuid.UUID,
) (*repository.DashboardPayload, error) {
	return s.repo.GetDashboardMetrics(ctx, movieID, creatorUserID)
}

// GetCreatorMovies returns all movies belonging to a creator user.
func (s *AnalyticsService) GetCreatorMovies(
	ctx context.Context,
	creatorUserID uuid.UUID,
) ([]model.Movie, error) {
	return s.repo.GetMoviesByCreator(ctx, creatorUserID)
}