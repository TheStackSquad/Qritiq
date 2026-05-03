//server/pkg/middleware/guest_middleware.go

package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GuestOnly blocks authenticated users from auth routes (login, signup).
func GuestOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		if _, exists := c.Get(CtxUserID); exists {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "already authenticated"})
			return
		}
		c.Next()
	}
}