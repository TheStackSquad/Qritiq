//server/pkg/handlers/user_handlers.go

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/qritiq/server/pkg/middleware"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/utils"
)

// AuthHandler coordinates all authentication and user-profile actions.
type AuthHandler struct {
	authSvc *services.AuthService
}

// NewAuthHandler is the single constructor for the AuthHandler.
func NewAuthHandler(authSvc *services.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

// Register POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var input model.CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}

	pair, err := h.authSvc.Register(c.Request.Context(), input)
	if err != nil {
		c.JSON(http.StatusConflict, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusCreated, utils.SuccessResponse("account created", pair))
}

// Login POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var input model.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}

	pair, err := h.authSvc.Login(c.Request.Context(), input, c.GetHeader("User-Agent"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("login successful", pair))
}

// Me GET /api/v1/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get(middleware.CtxUserID)
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", gin.H{"user_id": userID}))
}