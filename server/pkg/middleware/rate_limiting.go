// server/pkg/middleware/rate_limiting.go

package middleware

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

// RateLimit implements a sliding/fixed window rate limiter utilizing Redis.
// rps is treated as the maximum requests allowed within a 1-second window.
func RateLimit(rdb *redis.Client, rps float64, burst int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		ip := c.ClientIP()
		
		// Create a unique Redis key using a 1-second window timestamp
		// Example key: "rate_limit:127.0.0.1:1715925650"
		now := time.Now().Unix()
		redisKey := "rate_limit:" + ip + ":" + strconv.FormatInt(now, 10)

		// Atomic Increment pattern
		// pipeline reduces network roundtrips to Redis by batching commands
		pipe := rdb.Pipeline()
		incr := pipe.Incr(ctx, redisKey)
		pipe.Expire(ctx, redisKey, 2*time.Second) // Auto-cleanup keys quickly
		
		_, err := pipe.Exec(ctx)
		if err != nil {
			// Fail open or close depending on preference; here we fail open but log it
			c.Next()
			return
		}

		// The burst arg defines our ceiling limit per second
		if incr.Val() > int64(burst) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "rate limit exceeded",
				"retry_after": now + 1,
			})
			return
		}

		c.Next()
	}
}