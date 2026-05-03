//server/pkg/services/trending_services.go

package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
)

// Cache TTLs — trending data is slow-moving, 10 min is safe.
// Short enough that a real engagement spike shows up within one window.
const (
	ttlHypeRadar    = 10 * time.Minute
	ttlVerdictSplit = 10 * time.Minute

	keyHypeRadar    = "trending:hype_radar"
	keyVerdictSplit = "trending:verdict_split"
)

type TrendingService struct {
	repo  *repository.TrendingRepo
	redis *redis.Client
}

func NewTrendingService(repo *repository.TrendingRepo, rdb *redis.Client) *TrendingService {
	return &TrendingService{repo: repo, redis: rdb}
}

func (s *TrendingService) GetHypeRadar(ctx context.Context) ([]*model.HypeRadarItem, error) {
	// Cache read
	if cached, err := s.redis.Get(ctx, keyHypeRadar).Bytes(); err == nil {
		var items []*model.HypeRadarItem
		if err := json.Unmarshal(cached, &items); err == nil {
			return items, nil
		}
	}

	items, err := s.repo.GetHypeRadar(ctx, 20)
	if err != nil {
		return nil, fmt.Errorf("trending_svc: hype_radar: %w", err)
	}

	// Cache write — best effort
	if b, err := json.Marshal(items); err == nil {
		s.redis.Set(ctx, keyHypeRadar, b, ttlHypeRadar)
	}

	return items, nil
}

func (s *TrendingService) GetVerdictSplit(ctx context.Context) ([]*model.VerdictSplitItem, error) {
	// Cache read
	if cached, err := s.redis.Get(ctx, keyVerdictSplit).Bytes(); err == nil {
		var items []*model.VerdictSplitItem
		if err := json.Unmarshal(cached, &items); err == nil {
			return items, nil
		}
	}

	items, err := s.repo.GetVerdictSplit(ctx, 10)
	if err != nil {
		return nil, fmt.Errorf("trending_svc: verdict_split: %w", err)
	}

	if b, err := json.Marshal(items); err == nil {
		s.redis.Set(ctx, keyVerdictSplit, b, ttlVerdictSplit)
	}

	return items, nil
}
