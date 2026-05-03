//server/pkg/services/auth_services.go

package services

import (
	"context"
	"crypto/sha256"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/repository"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles registration, login, and token lifecycle.
type AuthService struct {
	userRepo      *repository.UserRepo
	refreshRepo   *repository.RefreshTokenRepo
	blacklistRepo *repository.TokenBlacklistRepo
	redis         *redis.Client
}

func NewAuthService(
	userRepo *repository.UserRepo,
	refreshRepo *repository.RefreshTokenRepo,
	blacklistRepo *repository.TokenBlacklistRepo,
	rdb *redis.Client,
) *AuthService {
	return &AuthService{
		userRepo:      userRepo,
		refreshRepo:   refreshRepo,
		blacklistRepo: blacklistRepo,
		redis:         rdb,
	}
}

// Register creates a new consumer user account.
func (s *AuthService) Register(ctx context.Context, input model.CreateUserInput) (*model.AuthTokenPair, error) {
	// Check uniqueness before hashing password (fail fast)
	if exists, err := s.userRepo.EmailExists(ctx, input.Email); err != nil || exists {
		if exists {
			return nil, fmt.Errorf("email already registered")
		}
		return nil, err
	}
	if exists, err := s.userRepo.UsernameExists(ctx, input.Username); err != nil || exists {
		if exists {
			return nil, fmt.Errorf("username already taken")
		}
		return nil, err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("auth: hash password: %w", err)
	}

	user, err := s.userRepo.Create(ctx, input.Email, input.Username, string(hash),
		model.RoleUser, model.VoteWeightMap[model.RoleUser])
	if err != nil {
		return nil, err
	}

	return s.issueTokenPair(ctx, user, "")
}

// Login verifies credentials and returns a token pair.
func (s *AuthService) Login(ctx context.Context, input model.LoginInput, userAgent string) (*model.AuthTokenPair, error) {
	user, err := s.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, fmt.Errorf("invalid email or password")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	return s.issueTokenPair(ctx, user, userAgent)
}

// RefreshTokens validates a refresh token and issues a new pair.
func (s *AuthService) RefreshTokens(ctx context.Context, rawRefreshToken string, userAgent string) (*model.AuthTokenPair, error) {
	hash := hashToken(rawRefreshToken)

	rt, err := s.refreshRepo.GetByHash(ctx, hash)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired refresh token")
	}

	// Rotate: delete old refresh token (one-use)
	if err := s.refreshRepo.DeleteByHash(ctx, hash); err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetByID(ctx, rt.UserID)
	if err != nil {
		return nil, err
	}

	return s.issueTokenPair(ctx, user, userAgent)
}

// Logout blacklists the access token and revokes the refresh token.
func (s *AuthService) Logout(ctx context.Context, accessTokenRaw string, refreshTokenRaw string) error {
	// Blacklist the access token so it can't be used until expiry
	claims, err := parseTokenClaims(accessTokenRaw)
	if err == nil && claims != nil {
		exp, _ := claims.GetExpirationTime()
		_ = s.blacklistRepo.Add(ctx, hashToken(accessTokenRaw), exp.Time)
		// Also cache in Redis for sub-millisecond auth middleware check
		ttl := time.Until(exp.Time)
		if ttl > 0 {
			s.redis.Set(ctx, "bl:"+hashToken(accessTokenRaw), "1", ttl)
		}
	}

	if refreshTokenRaw != "" {
		_ = s.refreshRepo.DeleteByHash(ctx, hashToken(refreshTokenRaw))
	}
	return nil
}

// ValidateAccessToken verifies signature, expiry, and blacklist status.
func (s *AuthService) ValidateAccessToken(ctx context.Context, raw string) (*JWTClaims, error) {
	// Fast path: Redis blacklist check (< 1ms)
	exists, _ := s.redis.Exists(ctx, "bl:"+hashToken(raw)).Result()
	if exists > 0 {
		return nil, fmt.Errorf("token has been revoked")
	}

	claims, err := parseTokenClaims(raw)
	if err != nil {
		return nil, err
	}
	return claims, nil
}

// ─── Internal Helpers ─────────────────────────────────────────────

// issueTokenPair creates a JWT access token and a refresh token.
func (s *AuthService) issueTokenPair(ctx context.Context, user *model.User, userAgent string) (*model.AuthTokenPair, error) {
	expiryMins, _ := strconv.Atoi(getEnv("JWT_EXPIRY_MINUTES", "60"))
	expiresAt := time.Now().Add(time.Duration(expiryMins) * time.Minute)

	claims := JWTClaims{
		UserID:   user.ID.String(),
		Email:    user.Email,
		Username: user.Username,
		Role:     string(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "kritiq",
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(getEnv("JWT_SECRET", "dev-secret")))
	if err != nil {
		return nil, fmt.Errorf("auth: sign token: %w", err)
	}

	// Refresh token: random UUID, stored as a hash
	rawRefresh := uuid.New().String() + "-" + uuid.New().String()
	refreshHash := hashToken(rawRefresh)
	refreshExpiry := time.Now().Add(30 * 24 * time.Hour)

	if err := s.refreshRepo.Create(ctx, user.ID, refreshHash, refreshExpiry, userAgent); err != nil {
		return nil, err
	}

	return &model.AuthTokenPair{
		AccessToken:  signed,
		RefreshToken: rawRefresh,
		ExpiresAt:    expiresAt,
		User:         user.ToResponse(),
	}, nil
}

// JWTClaims is the payload embedded in every KritiQ access token.
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func parseTokenClaims(raw string) (*JWTClaims, error) {
	raw = strings.TrimPrefix(raw, "Bearer ")
	token, err := jwt.ParseWithClaims(raw, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(getEnv("JWT_SECRET", "dev-secret")), nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}
	return claims, nil
}

// hashToken creates a SHA-256 digest of a raw token for safe DB storage.
func hashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%x", h)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}