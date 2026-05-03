// server/pkg/services/movie_services.go

package services

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/db"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
	"github.com/qritiq/server/pkg/utils"
	"github.com/redis/go-redis/v9"
)

// ─── Service ──────────────────────────────────────────────────────────────────

type MovieService struct {
	repo           *repository.MovieRepo
	engagementRepo *repository.EngagementRepo
	ratingRepo     *repository.RatingRepo
	redis          *redis.Client
}

func NewMovieService(
	repo *repository.MovieRepo,
	engagementRepo *repository.EngagementRepo,
	ratingRepo *repository.RatingRepo,
	rdb *redis.Client,
) *MovieService {
	return &MovieService{
		repo:           repo,
		engagementRepo: engagementRepo,
		ratingRepo:     ratingRepo,
		redis:          rdb,
	}
}

// ─── Public API ───────────────────────────────────────────────────────────────

// ListHome returns the home page content feed as lightweight card DTOs.
// Fetches pre_release and released concurrently via goroutines.
func (s *MovieService) ListHome(ctx context.Context, page int) (map[string][]*model.MovieCardResponse, error) {
	const perPage = 12
	offset := (page - 1) * perPage

	type result struct {
		key  string
		data []*model.Movie
		err  error
	}

	ch := make(chan result, 2)

	go func() {
		movies, err := s.repo.ListByStatus(ctx, model.StatusPreRelease, perPage, offset)
		ch <- result{"pre_release", movies, err}
	}()
	go func() {
		movies, err := s.repo.ListByStatus(ctx, model.StatusReleased, perPage, offset)
		ch <- result{"released", movies, err}
	}()

	out := map[string][]*model.MovieCardResponse{}
	for i := 0; i < 2; i++ {
		r := <-ch
		if r.err != nil {
			return nil, r.err
		}
		for _, m := range r.data {
			s.computeDaysUntilRelease(m)
		}
		// Map to card DTO — description, cast_list, trailer_url,
		// production_company, director stripped here.
		// Not needed by the card, not sent over the wire.
		out[r.key] = toCardResponses(r.data)
	}

	return out, nil
}

// GetCard returns a single movie with computed fields.
// Checks Redis first; falls back to Postgres on miss.
func (s *MovieService) GetCard(ctx context.Context, slug string, userID *uuid.UUID) (*model.Movie, error) {
	cacheKey := fmt.Sprintf(db.KeyMovieCard, slug)

	// Redis cache read
	if cached, err := s.redis.Get(ctx, cacheKey).Bytes(); err == nil {
		var m model.Movie
		if err := json.Unmarshal(cached, &m); err == nil {
			s.attachUserEngagement(ctx, &m, userID)
			s.computeDaysUntilRelease(&m)
			return &m, nil
		}
	}

	// Cache miss — read from Postgres
	m, err := s.repo.GetBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	s.computeDaysUntilRelease(m)
	s.attachUserEngagement(ctx, m, userID)

	// Write back to Redis
	if b, err := json.Marshal(m); err == nil {
		s.redis.Set(ctx, cacheKey, b, db.TTLCardMedium)
	}

	// Async view increment — fire and forget, doesn't block the response
	go func() {
		bgCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = s.repo.IncrementViews(bgCtx, m.ID)
	}()

	return m, nil
}

// Search runs a trigram search and returns lightweight search results.
// Results are cached in Redis for the TTLSearch window.
func (s *MovieService) Search(ctx context.Context, query string) ([]*model.SearchResult, error) {
	cacheKey := fmt.Sprintf(db.KeySearchCache, query)

	if cached, err := s.redis.Get(ctx, cacheKey).Bytes(); err == nil {
		var results []*model.SearchResult
		if err := json.Unmarshal(cached, &results); err == nil {
			return results, nil
		}
	}

	results, err := s.repo.Search(ctx, query, 20)
	if err != nil {
		return nil, err
	}

	if b, err := json.Marshal(results); err == nil {
		s.redis.Set(ctx, cacheKey, b, db.TTLSearch)
	}

	return results, nil
}

// Create registers a new movie (creator / admin only).
// Invalidates the pre_release list cache on success.
func (s *MovieService) Create(ctx context.Context, input *model.CreateMovieInput, creatorID *uuid.UUID) (*model.Movie, error) {
	slug := utils.Slugify(input.Title)

	m, err := s.repo.Create(ctx, input, slug, creatorID)
	if err != nil {
		return nil, err
	}

	s.redis.Del(ctx, fmt.Sprintf(db.KeyMovieList, "pre_release", 1))

	return m, nil
}

// ─── Cache Invalidation ───────────────────────────────────────────────────────

// InvalidateListCaches clears paginated list caches for both statuses.
// Call after any engagement or rating write that could shift sort order
// (hype_score / rating_score). Uses a pipeline for a single Redis round-trip.
//
// Run in a goroutine at the call site — cache invalidation is best-effort
// and must never block a user-facing write response:
//
//	go s.movieSvc.InvalidateListCaches(context.Background())
func (s *MovieService) InvalidateListCaches(ctx context.Context) {
	pipe := s.redis.Pipeline()

	// Pages 1–5 cover 99% of real traffic.
	// Deeper pages self-expire via TTL — not worth chasing on every write.
	for page := 1; page <= 5; page++ {
		pipe.Del(ctx, fmt.Sprintf(db.KeyMovieList, string(model.StatusPreRelease), page))
		pipe.Del(ctx, fmt.Sprintf(db.KeyMovieList, string(model.StatusReleased), page))
	}

	pipe.Exec(ctx)
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

// computeDaysUntilRelease populates DaysUntilRelease on pre-release movies.
func (s *MovieService) computeDaysUntilRelease(m *model.Movie) {
	if m.Status == model.StatusPreRelease && m.ReleaseDate != nil {
		days := int(math.Ceil(time.Until(*m.ReleaseDate).Hours() / 24))
		if days >= 0 {
			m.DaysUntilRelease = &days
		}
	}
}

// attachUserEngagement fetches and attaches the current user's engagement state.
// Returns silently on error — engagement state is non-critical to page render.
func (s *MovieService) attachUserEngagement(ctx context.Context, m *model.Movie, userID *uuid.UUID) {
	if userID == nil {
		return
	}

	types, err := s.engagementRepo.GetUserState(ctx, *userID, m.ID, "movie")
	if err != nil {
		return
	}

	state := &model.UserEngagementState{}
	for _, t := range types {
		switch t {
		case model.EngageLike:
			state.HasLiked = true
		case model.EngageDislike:
			state.HasDisliked = true
		case model.EngageHype:
			state.HypeVote = "hype"
		case model.EngageMeh:
			state.HypeVote = "meh"
		case model.EngageFlop:
			state.HypeVote = "flop"
		}
	}

	m.UserEngagement = state
}

// ─── DTO Mappers ──────────────────────────────────────────────────────────────

// toCardResponse maps a full Movie to the lightweight card DTO.
func toCardResponse(m *model.Movie) *model.MovieCardResponse {
	return &model.MovieCardResponse{
		ID:               m.ID,
		Title:            m.Title,
		Slug:             m.Slug,
		Status:           m.Status,
		PosterURL:        m.PosterURL,
		Genre:            m.Genre,
		HypeScore:        m.HypeScore,
		TotalLikes:       m.TotalLikes,
		TotalDislikes:    m.TotalDislikes,
		TotalViews:       m.TotalViews,
		ReleaseDate:      m.ReleaseDate,
		DaysUntilRelease: m.DaysUntilRelease,
		UserEngagement:   m.UserEngagement,
	}
}

// toCardResponses maps a Movie slice — called once per list result.
func toCardResponses(movies []*model.Movie) []*model.MovieCardResponse {
	out := make([]*model.MovieCardResponse, len(movies))
	for i, m := range movies {
		out[i] = toCardResponse(m)
	}
	return out
}