// server/pkg/handlers/analytics_handlers.go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/middleware"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/utils"
)

type AnalyticsHandler struct {
	analyticsSvc *services.AnalyticsService
}

func NewAnalyticsHandler(analyticsSvc *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsSvc: analyticsSvc}
}

// GET /api/v1/pro/dashboard/:movieID
func (h *AnalyticsHandler) GetDashboard(c *gin.Context) {
	movieID, err := uuid.Parse(c.Param("movieID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("invalid movie ID"))
		return
	}

	// creatorUserID is the user's UUID from the JWT — not the creators.id
	// The repo resolves creators.id via JOIN on creators.user_id = $2
	creatorUserID := c.MustGet(middleware.CtxUserID).(uuid.UUID)

	payload, err := h.analyticsSvc.GetDashboard(c.Request.Context(), movieID, creatorUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("dashboard load failed"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("ok", payload))
}

// GET /api/v1/pro/movies
func (h *AnalyticsHandler) GetCreatorMovies(c *gin.Context) {
	creatorUserID := c.MustGet(middleware.CtxUserID).(uuid.UUID)

	movies, err := h.analyticsSvc.GetCreatorMovies(c.Request.Context(), creatorUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load movies"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("ok", movies))
}