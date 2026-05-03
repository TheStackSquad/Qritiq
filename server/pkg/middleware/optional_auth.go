//server/pkg/middleware/optional_auth.go

package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/services"
)

// OptionalAuth enriches context if a token is present but does NOT block.
func OptionalAuth(authSvc *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		sessionID := getOrCreateSessionID(c)
		c.Set(CtxSessionID, sessionID)
		c.Set(CtxIsGuest, true)

		raw := extractToken(c)
		if raw != "" {
			if claims, err := authSvc.ValidateAccessToken(c.Request.Context(), raw); err == nil {
				if userID, err := uuid.Parse(claims.UserID); err == nil {
					c.Set(CtxUserID, userID)
					c.Set(CtxUserRole, claims.Role)
					c.Set(CtxIsGuest, false)
				}
			}
		}

		c.Next()
	}
}

func getOrCreateSessionID(c *gin.Context) string {
	if id, err := c.Cookie("session_id"); err == nil && id != "" {
		return id
	}
	id := uuid.New().String()
	c.SetCookie("session_id", id, int((30*24*time.Hour).Seconds()), "/", "", false, false)
	return id
}

