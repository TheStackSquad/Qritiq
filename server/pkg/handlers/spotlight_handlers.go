// server/pkg/handlers/spotlight_handlers.go

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/utils"
)

type SpotlightHandler struct {
	spotlightSvc *services.SpotlightService
}

func NewSpotlightHandler(spotlightSvc *services.SpotlightService) *SpotlightHandler {
	return &SpotlightHandler{spotlightSvc: spotlightSvc}
}

// GET /api/v1/spotlight?role=director&q=jade&page=1&limit=20
func (h *SpotlightHandler) GetSpotlight(c *gin.Context) {
	filter := model.SpotlightFilter{
		Role:  model.PersonRole(c.Query("role")),
		Search: c.Query("q"),
		Page:   1,
		Limit:  20,
	}

	payload, err := h.spotlightSvc.GetSpotlight(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load spotlight"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", payload))
}

// GET /api/v1/spotlight/:slug
func (h *SpotlightHandler) GetPerson(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse("missing slug"))
		return
	}

	person, err := h.spotlightSvc.GetPerson(c.Request.Context(), slug)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("person not found"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", person))
}