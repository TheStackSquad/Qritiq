//server/pkg/middleware/rate_limiting.go

package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"golang.org/x/time/rate"
)

type ipLimiterStore struct {
	limiters map[string]*rate.Limiter
}

func RateLimit(rdb *redis.Client, rps float64, burst int) gin.HandlerFunc {
	limiters := make(map[string]*rate.Limiter)

	getLimiter := func(ip string) *rate.Limiter {
		if l, ok := limiters[ip]; ok {
			return l
		}
		l := rate.NewLimiter(rate.Limit(rps), burst)
		limiters[ip] = l
		return l
	}

	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := getLimiter(ip)

		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "rate limit exceeded",
				"retry_after": time.Now().Add(time.Second).Unix(),
			})
			return
		}
		c.Next()
	}
}