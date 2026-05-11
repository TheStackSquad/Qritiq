// server/pkg/router/routes.go

package router

import (
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/qritiq/server/pkg/handlers"
	"github.com/qritiq/server/pkg/middleware"
	"github.com/qritiq/server/pkg/services"
	cloudsvc "github.com/qritiq/server/pkg/services/cloudinary"
	"github.com/redis/go-redis/v9"
)

func New(
	authSvc      *services.AuthService,
	movieSvc     *services.MovieService,
	engSvc       *services.EngagementService,
	analyticsSvc *services.AnalyticsService,
	trendingSvc  *services.TrendingService,
	arenaSvc     *services.ArenaService,
	spotlightSvc *services.SpotlightService,
	cloud        *cloudsvc.Client,
	rdb          *redis.Client,
) *gin.Engine {
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.RequestID())

	// ─── CORS ─────────────────────────────────────────────────────────────

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("ALLOWED_ORIGINS"), "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-CSRF-Token", "X-Request-ID"},
		ExposeHeaders:    []string{"X-Request-ID"},
		AllowCredentials: true,
	}))

	// ─── Health ───────────────────────────────────────────────────────────

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "kritiq-api"})
	})

	// ─── Handlers ─────────────────────────────────────────────────────────

	authH       := handlers.NewAuthHandler(authSvc)
	movieH      := handlers.NewMovieHandler(movieSvc)
	engH        := handlers.NewEngagementHandler(engSvc)
	analyticsH  := handlers.NewAnalyticsHandler(analyticsSvc)
	mediaH      := handlers.NewMediaHandler(cloud)
	trendingH   := handlers.NewTrendingHandler(trendingSvc)
	arenaH      := handlers.NewArenaHandler(arenaSvc)
	spotlightH  := handlers.NewSpotlightHandler(spotlightSvc)

	// ─── API v1 ───────────────────────────────────────────────────────────

	api := r.Group("/api/v1")

	// ── Auth ──────────────────────────────────────────────────────────────

	auth := api.Group("/auth")
	auth.Use(middleware.RateLimit(rdb, 10.0/60, 5))
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login",    authH.Login)
		auth.POST("/refresh",  authH.Refresh)
		auth.POST("/logout",   authH.Logout)
		auth.GET("/me",        middleware.RequireAuth(authSvc), authH.Me)
	}

	// ── Content — public reads ────────────────────────────────────────────

	content := api.Group("")
	content.Use(middleware.OptionalAuth(authSvc))
	content.Use(middleware.RateLimit(rdb, 60.0/60, 30))
	{
		content.GET("/movies",        movieH.List)
		content.GET("/movies/search", movieH.Search)
		content.GET("/movies/:slug",  movieH.GetBySlug)

		// Music — public reads (handlers wired in Layer 5 client work)
		// content.GET("/music",         musicH.List)
		// content.GET("/music/search",  musicH.Search)
		// content.GET("/music/:slug",   musicH.GetBySlug)
	}

	// ── Trending — public, cached ─────────────────────────────────────────

	trending := api.Group("/trending")
	trending.Use(middleware.RateLimit(rdb, 60.0/60, 30))
	{
		trending.GET("/hype-radar",    trendingH.HypeRadar)
		trending.GET("/verdict-split", trendingH.VerdictSplit)
	}

	// ── Arena — public reads, auth required for voting ────────────────────

	arena := api.Group("/arena")
	arena.Use(middleware.RateLimit(rdb, 60.0/60, 30))
	{
		// Public
		arena.GET("",                  middleware.OptionalAuth(authSvc), arenaH.GetArena)
		arena.GET("/battles/:id",      middleware.OptionalAuth(authSvc), arenaH.GetBattle)
		arena.GET("/leaderboard",      arenaH.GetLeaderboard)

		// Auth required
		arena.POST("/vote", middleware.RequireAuth(authSvc),
			middleware.RateLimit(rdb, 30.0/60, 10),
			arenaH.Vote,
		)
	}

	// ── Spotlight — public reads ──────────────────────────────────────────

	spotlight := api.Group("/spotlight")
	spotlight.Use(middleware.RateLimit(rdb, 60.0/60, 30))
	{
		spotlight.GET("",       spotlightH.GetSpotlight)
		spotlight.GET("/:slug", spotlightH.GetPerson)
	}

	
	snippets := api.Group("/music")
	snippets.Use(middleware.OptionalAuth(authSvc))
	snippets.POST("/:id/play", engH.RecordSnippetPlay)

	// ── Engage ────────────────────────────────────────────────────────────

	engage := api.Group("/engage")
	engage.Use(middleware.RequireAuth(authSvc))
	engage.Use(middleware.RateLimit(rdb, 60.0/60, 20))
	{
		engage.POST("", engH.Submit)
	}

	// ── Rate ──────────────────────────────────────────────────────────────

	rate := api.Group("/rate")
	rate.Use(middleware.RequireAuth(authSvc))
	rate.Use(middleware.RateLimit(rdb, 30.0/60, 10))
	{
		rate.POST("", engH.SubmitRating)
	}

	// ── Media ─────────────────────────────────────────────────────────────

	media := api.Group("/media")
	media.Use(middleware.RequireAuth(authSvc))
	media.Use(middleware.RateLimit(rdb, 30.0/60, 10))
	{
		media.POST("/upload", mediaH.Upload)
		media.DELETE("/delete", mediaH.Delete)
	}

	// ── Pro ───────────────────────────────────────────────────────────────

	pro := api.Group("/pro")
	pro.Use(middleware.RequireAuth(authSvc))
	pro.Use(middleware.RequireRole("creator", "pro", "admin"))
	pro.Use(middleware.RateLimit(rdb, 60.0/60, 15))
	{
		pro.GET("/movies",             analyticsH.GetCreatorMovies)
		pro.GET("/dashboard/:movieID", analyticsH.GetDashboard)
		pro.POST("/movies",            movieH.Create)
	}

	return r
}