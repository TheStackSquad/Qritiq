//server/pkg/handlers/engage_handlers.go

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/middleware"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/utils"
)

type EngagementHandler struct {
	engSvc *services.EngagementService
}

func NewEngagementHandler(engSvc *services.EngagementService) *EngagementHandler {
	return &EngagementHandler{engSvc: engSvc}
}

func (h *EngagementHandler) Submit(c *gin.Context) {
    var input model.EngagementInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
        return
    }

    var userID *uuid.UUID
    var userRole model.UserRole = model.RoleGuest

    if id, exists := c.Get(middleware.CtxUserID); exists {
        uid := id.(uuid.UUID)
        userID = &uid
    }
    if role, exists := c.Get(middleware.CtxUserRole); exists {
        userRole = model.UserRole(role.(string))
    }

    // Gate — only watch is allowed without an account
    if userID == nil && input.EngagementType != "watch" {
        c.JSON(http.StatusUnauthorized, utils.ErrorResponse("sign in to vote"))
        return
    }

    sessionID, _ := c.Get(middleware.CtxSessionID)
    sid, _ := sessionID.(string)

    isNew, err := h.engSvc.Submit(c.Request.Context(), input, userID, sid, c.ClientIP(), userRole)
    if err != nil {
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
        return
    }
    c.JSON(http.StatusOK, utils.SuccessResponse("ok", gin.H{"recorded": isNew}))
}

func (h *EngagementHandler) SubmitRating(c *gin.Context) {
	var input model.RatingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}

	userID := c.MustGet(middleware.CtxUserID).(uuid.UUID)
	userRole := model.UserRole(c.GetString(middleware.CtxUserRole))

	if err := h.engSvc.SubmitRating(c.Request.Context(), input, userID, userRole); err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("rating submitted", nil))
}

// RecordSnippetPlay handles POST /music/:id/play

func (h *EngagementHandler) RecordSnippetPlay(c *gin.Context) {
	contentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("invalid content id"))
		return
	}

	// Optional Auth — user might be a guest
	var userID *uuid.UUID
	if id, exists := c.Get(middleware.CtxUserID); exists {
		uid := id.(uuid.UUID)
		userID = &uid
	}

	sessionID, _ := c.Get(middleware.CtxSessionID)
	sid, _ := sessionID.(string)

	// We treat a snippet play as a "watch" engagement type internally
	input := model.EngagementInput{
    ContentID:      contentID.String(),
    ContentType:    "music",
    EngagementType: "watch",
}

	// Use existing Submit logic to record the play
	_, err = h.engSvc.Submit(
		c.Request.Context(),
		input,
		userID,
		sid,
		c.ClientIP(),
		model.RoleGuest, // Default to guest, service handles elevated weights via userID
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("play recorded", nil))
}