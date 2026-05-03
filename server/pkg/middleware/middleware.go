//server/pkg/middleware/middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/services"
)

// ─── Context Keys ─────────────────────────────────────────────────
const (
	CtxUserID    = "user_id"
	CtxUserRole  = "user_role"
	CtxUserEmail = "user_email"
	CtxSessionID = "session_id"
	CtxIsGuest   = "is_guest"
)

// ─── Auth Middleware ──────────────────────────────────────────────
func RequireAuth(authSvc *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		raw := extractToken(c)
		if raw == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			return
		}

		claims, err := authSvc.ValidateAccessToken(c.Request.Context(), raw)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "malformed token"})
			return
		}

		c.Set(CtxUserID, userID)
		c.Set(CtxUserRole, claims.Role)
		c.Set(CtxUserEmail, claims.Email)
		c.Set(CtxIsGuest, false)
		c.Next()
	}
}

// ─── Role Guard Middleware ─────────────────────────────────────────
func RequireRole(roles ...string) gin.HandlerFunc {
	allowed := make(map[string]bool)
	for _, r := range roles {
		allowed[r] = true
	}

	return func(c *gin.Context) {
		role, exists := c.Get(CtxUserRole)
		if !exists || !allowed[role.(string)] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "insufficient permissions",
				"hint":  "this route requires a creator or pro account",
			})
			return
		}
		c.Next()
	}
}

// ─── Request ID Middleware ────────────────────────────────────────
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			id = uuid.New().String()
		}
		c.Set("request_id", id)
		c.Header("X-Request-ID", id)
		c.Next()
	}
}

// ─── Helpers ──────────────────────────────────────────────────────

func extractToken(c *gin.Context) string {
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}
	if token, err := c.Cookie("access_token"); err == nil {
		return token
	}
	return ""
}