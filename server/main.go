// server/main.go

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/qritiq/server/pkg/db"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
	"github.com/qritiq/server/pkg/router"
	"github.com/qritiq/server/pkg/services"
	cloudsvc "github.com/qritiq/server/pkg/services/cloudinary"
)

func main() {
	if os.Getenv("APP_ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("⚠️  No .env file found — using environment variables")
		}
	}

	// ─── Database Connections ─────────────────────────────────────────────

	postgres, err := db.NewPostgres()
	if err != nil {
		log.Fatalf("❌ Postgres: %v", err)
	}
	defer postgres.Close()

	rdb, err := db.NewRedis()
	if err != nil {
		log.Fatalf("❌ Redis: %v", err)
	}
	defer rdb.Close()

	// ─── Cloudinary ───────────────────────────────────────────────────────

	cloudClient, err := cloudsvc.New()
	if err != nil {
		log.Fatalf("❌ Cloudinary: %v", err)
	}

	// ─── Repositories ─────────────────────────────────────────────────────

	userRepo         := repository.NewUserRepo(postgres)
	movieRepo        := repository.NewMovieRepo(postgres)
	musicRepo        := repository.NewMusicRepo(postgres)
	engagementRepo   := repository.NewEngagementRepo(postgres)
	ratingRepo       := repository.NewRatingRepo(postgres)
	refreshTokenRepo := repository.NewRefreshTokenRepo(postgres)
	blacklistRepo    := repository.NewTokenBlacklistRepo(postgres)
	analyticsRepo    := repository.NewAnalyticsRepository(postgres)
	trendingRepo     := repository.NewTrendingRepo(postgres)
	battleRepo       := repository.NewBattleRepo(postgres)
	arenaRepo        := repository.NewArenaRepo(postgres)
	personRepo       := repository.NewPersonRepo(postgres)
	streetPullRepo   := repository.NewStreetPullRepo(postgres)

	_ = musicRepo

	// ─── Services ─────────────────────────────────────────────────────────

	ipSvc := services.NewIPService()

	authSvc := services.NewAuthService(
		userRepo,
		refreshTokenRepo,
		blacklistRepo,
		rdb,
	)

	movieSvc := services.NewMovieService(
		movieRepo,
		engagementRepo,
		ratingRepo,
		rdb,
	)

	// streetPullSvc and spotlightSvc must be constructed before engSvc
	// because engSvc depends on both
	streetPullSvc := services.NewStreetPullService(streetPullRepo)
	spotlightSvc  := services.NewSpotlightService(personRepo)

	engSvc := services.NewEngagementService(
		engagementRepo,
		ratingRepo,
		rdb,
		ipSvc,
		streetPullSvc,
		spotlightSvc,
	)

	analyticsSvc := services.NewAnalyticsService(analyticsRepo)
	trendingSvc  := services.NewTrendingService(trendingRepo, rdb)

	arenaSvc := services.NewArenaService(
		battleRepo,
		arenaRepo,
		model.DefaultSchedulerConfig(),
	)

	// ─── Scheduler ────────────────────────────────────────────────────────
	// Context tied to process lifetime — cancelled by defer stopScheduler()
	// which fires before graceful shutdown completes.

	schedulerCtx, stopScheduler := context.WithCancel(context.Background())
	defer stopScheduler()
	arenaSvc.StartScheduler(schedulerCtx)

	// ─── Router ───────────────────────────────────────────────────────────

	engine := router.New(
		authSvc,
		movieSvc,
		engSvc,
		analyticsSvc,
		trendingSvc,
		arenaSvc,
		spotlightSvc,
		cloudClient,
		rdb,
	)

	// ─── HTTP Server ──────────────────────────────────────────────────────

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      engine,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 KritiQ API running on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server error: %v", err)
		}
	}()

	// ─── Graceful Shutdown ────────────────────────────────────────────────

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("⏳ Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("⚠️  Forced shutdown: %v", err)
	}

	log.Println("✅ KritiQ API stopped cleanly")
}