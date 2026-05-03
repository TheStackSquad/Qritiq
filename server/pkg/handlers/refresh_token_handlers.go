//server/pkg/handlers/refresh_token_handlers.go

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/qritiq/server/pkg/utils"
)

// Refresh POST /api/v1/auth/refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("refresh_token required"))
		return
	}

	pair, err := h.authSvc.RefreshTokens(c.Request.Context(), body.RefreshToken, c.GetHeader("User-Agent"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse("invalid or expired refresh token"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("tokens refreshed", pair))
}

// Logout POST /api/v1/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	_ = c.ShouldBindJSON(&body)

	raw := c.GetHeader("Authorization")
	_ = h.authSvc.Logout(c.Request.Context(), raw, body.RefreshToken)

	c.JSON(http.StatusOK, utils.SuccessResponse("logged out", nil))
}