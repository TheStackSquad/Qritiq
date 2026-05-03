//server/pkg/handlers/trending_handlers.go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/utils"
)

type TrendingHandler struct {
	trendingSvc *services.TrendingService
}

func NewTrendingHandler(trendingSvc *services.TrendingService) *TrendingHandler {
	return &TrendingHandler{trendingSvc: trendingSvc}
}

// GET /api/v1/trending/hype-radar
func (h *TrendingHandler) HypeRadar(c *gin.Context) {
	items, err := h.trendingSvc.GetHypeRadar(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load hype radar"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", items))
}

// GET /api/v1/trending/verdict-split
func (h *TrendingHandler) VerdictSplit(c *gin.Context) {
	items, err := h.trendingSvc.GetVerdictSplit(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load verdict split"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", items))
}