// server/pkg/handlers/arena_handlers.go

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/middleware"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/utils"
)

type ArenaHandler struct {
	arenaSvc *services.ArenaService
}

func NewArenaHandler(arenaSvc *services.ArenaService) *ArenaHandler {
	return &ArenaHandler{arenaSvc: arenaSvc}
}

// GET /api/v1/arena
func (h *ArenaHandler) GetArena(c *gin.Context) {
	payload, err := h.arenaSvc.GetArena(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load arena"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", payload))
}

// GET /api/v1/arena/battles/:id
func (h *ArenaHandler) GetBattle(c *gin.Context) {
	battleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("invalid battle ID"))
		return
	}

	var userID *uuid.UUID
	if id, exists := c.Get(middleware.CtxUserID); exists {
		uid := id.(uuid.UUID)
		userID = &uid
	}

	battle, err := h.arenaSvc.GetBattle(c.Request.Context(), battleID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("battle not found"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", battle))
}

// POST /api/v1/arena/vote
func (h *ArenaHandler) Vote(c *gin.Context) {
	var input model.BattleVoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}

	userID   := c.MustGet(middleware.CtxUserID).(uuid.UUID)
	userRole := model.UserRole(c.GetString(middleware.CtxUserRole))

	// City/state resolved from IP — same pattern as engagement handler
	city  := c.GetString("city")
	state := c.GetString("state")

	voted, err := h.arenaSvc.Vote(
		c.Request.Context(), input, userID, userRole, city, state,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", gin.H{"voted": voted}))
}

// GET /api/v1/arena/leaderboard?type=movie|music&limit=20
func (h *ArenaHandler) GetLeaderboard(c *gin.Context) {
	contentType := c.Query("type")   // optional — "" returns combined
	limit        := 20

	entries, err := h.arenaSvc.GetLeaderboard(c.Request.Context(), contentType, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load leaderboard"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", entries))
}