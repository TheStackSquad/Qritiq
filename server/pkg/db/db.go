//server/pkg/db/db.go

package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

// ─── PostgreSQL ────────────────────────────────────────────────────

// Config holds all connection parameters.
// Currently wired to local pgAdmin Postgres.
// To migrate to Supabase: swap DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
// from env and nothing else changes in this file — that's the point.
type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

func configFromEnv() Config {
	return Config{
		Host:     getEnv("DB_HOST", "host.docker.internal"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "astronautdesh"),
		Password: getEnv("DB_PASSWORD", "astronautdesh"),
		DBName:   getEnv("DB_NAME", "KritiQ"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
	}
}

// DSN builds the Postgres connection string.
// For Supabase production the format is identical — just different values.
func (c Config) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=Africa/Lagos",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// NewPostgres initialises a sqlx DB pool with production-grade settings.
func NewPostgres() (*sqlx.DB, error) {
	cfg := configFromEnv()
	db, err := sqlx.Open("postgres", cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("db: open failed: %w", err)
	}

	// Pool tuning — conservative for a dev/pitch environment
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(2 * time.Minute)

	// Verify connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("db: ping failed — is pgAdmin running? DSN=%s err=%w", cfg.DSN(), err)
	}

	log.Printf("✅ Postgres connected: %s:%s/%s", cfg.Host, cfg.Port, cfg.DBName)
	return db, nil
}

// ─── Redis ────────────────────────────────────────────────────────

// NewRedis initialises the Redis client (Upstash-compatible for Vercel).
// Vercel KV uses the same redis protocol — swap REDIS_URL in prod and done.
func NewRedis() (*redis.Client, error) {
	addr := fmt.Sprintf("%s:%s",
		getEnv("REDIS_HOST", "localhost"),
		getEnv("REDIS_PORT", "6379"),
	)
	password := getEnv("REDIS_PASSWORD", "")

	rdb := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           0,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     20,
		MinIdleConns: 5,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis: ping failed: %w", err)
	}

	log.Printf("✅ Redis connected: %s", addr)
	return rdb, nil
}

// ─── Redis Key Helpers ────────────────────────────────────────────
// Centralised key schema keeps cache invalidation predictable.

const (
	// Movie/Music aggregate caches — SET by trigger-aware service, GET by card handler
	KeyMovieCard   = "movie:card:%s"          // movie slug
	KeyMusicCard   = "music:card:%s"          // music slug
	KeyMovieList   = "movie:list:%s:%d"        // status:page
	KeyMusicList   = "music:list:%s:%d"        // status:page
	KeySearchCache = "search:%s"              // query string
	KeyHypeScore   = "hype:%s:%s"             // content_type:content_id
	KeyLikeCount   = "likes:%s:%s"            // content_type:content_id
	// User engagement state cache — avoids DB lookup for button states
	KeyUserEngagement = "ue:%s:%s:%s"         // user_id:content_type:content_id
	// Analytics for partner dashboard
	KeyDashboard   = "dashboard:%s:%s"        // creator_id:content_id
	// Rate limiting
	KeyRateLimit   = "rl:%s:%s"               // ip:endpoint
)

// TTL constants
const (
	TTLCardShort     = 30 * time.Second  // live hype data on cards
	TTLCardMedium    = 5 * time.Minute   // general card data
	TTLList          = 2 * time.Minute   // browse/home lists
	TTLSearch        = 1 * time.Minute   // search results
	TTLDashboard     = 10 * time.Minute  // partner dashboard
	TTLUserEngage    = 24 * time.Hour    // user engagement state
)

// ─── Helpers ──────────────────────────────────────────────────────

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}