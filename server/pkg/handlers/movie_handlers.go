//server/pkg/handlers/movie_handlers.go

package handlers

import (
	"net/http"
	"strconv"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/qritiq/server/pkg/services"
	"github.com/qritiq/server/pkg/middleware"
	"github.com/qritiq/server/pkg/model"
	"github.com/qritiq/server/pkg/utils"
)

type MovieHandler struct {
	movieSvc *services.MovieService
}

func NewMovieHandler(movieSvc *services.MovieService) *MovieHandler {
	return &MovieHandler{movieSvc: movieSvc}
}

func (h *MovieHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 { page = 1 }

	data, err := h.movieSvc.ListHome(c.Request.Context(), page)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse("failed to load movies"))
		return
	}

	c.JSON(http.StatusOK, utils.SuccessResponse("ok", data))
}

func (h *MovieHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var userID *uuid.UUID
	if id, exists := c.Get(middleware.CtxUserID); exists {
		uid := id.(uuid.UUID)
		userID = &uid
	}

	movie, err := h.movieSvc.GetCard(c.Request.Context(), slug, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, utils.ErrorResponse("movie not found"))
		return
	}
	c.JSON(http.StatusOK, utils.SuccessResponse("ok", movie))
}

func (h *MovieHandler) Search(c *gin.Context) {
    q := c.Query("q")
    
    // 1. Log the incoming request
    log.Printf("[Search] Incoming request - query: %s", q)

    if len(q) < 2 {
        log.Printf("[Search] Validation failed - query too short: %s", q)
        c.JSON(http.StatusBadRequest, utils.ErrorResponse("query must be at least 2 characters"))
        return
    }

    results, err := h.movieSvc.Search(c.Request.Context(), q)
    if err != nil {
        // 2. Log the actual internal error (very important for debugging)
        log.Printf("[Search] Service error for query '%s': %v", q, err)
        c.JSON(http.StatusInternalServerError, utils.ErrorResponse("search failed"))
        return
    }

    // 3. Log success and the number of results found
    log.Printf("[Search] Success - query: '%s', results found: %d", q, len(results))
    
    c.JSON(http.StatusOK, utils.SuccessResponse("ok", results))
}

func (h *MovieHandler) Create(c *gin.Context) {
	var input model.CreateMovieInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, utils.ErrorResponse(err.Error()))
		return
	}
	var creatorID *uuid.UUID
	if id, exists := c.Get(middleware.CtxUserID); exists {
		uid := id.(uuid.UUID)
		creatorID = &uid
	}
	movie, err := h.movieSvc.Create(c.Request.Context(), &input, creatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, utils.ErrorResponse(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, utils.SuccessResponse("movie created", movie))
}

