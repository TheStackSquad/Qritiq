// server/pkg/handlers/media.go

package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	cloudsvc "github.com/qritiq/server/pkg/services/cloudinary"
)

type MediaHandler struct {
	cloud *cloudsvc.Client
}

func NewMediaHandler(cloud *cloudsvc.Client) *MediaHandler {
	return &MediaHandler{cloud: cloud}
}

// POST /api/media/upload
// Multipart form: file (required), folder (optional, defaults to kritiq/uploads/images/posters)
func (h *MediaHandler) Upload(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	folder := c.PostForm("folder")
	if folder == "" {
		folder = "kritiq/uploads/images/posters"
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not open file"})
		return
	}
	defer file.Close()

	result, err := h.cloud.UploadFile(c.Request.Context(), file, folder)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// DELETE /api/media/delete
// JSON body: { "public_id": "kritiq/uploads/images/posters/abc123" }
func (h *MediaHandler) Delete(c *gin.Context) {
	var body struct {
		PublicID string `json:"public_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "public_id is required"})
		return
	}

	if err := h.cloud.DeleteFile(c.Request.Context(), body.PublicID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true, "public_id": body.PublicID})
}