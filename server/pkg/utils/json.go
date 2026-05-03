//server/pkg/utils/json.go

package utils

import "github.com/gin-gonic/gin"

// APIResponse is the standard envelope for every KritiQ API response.
// Frontend can always expect this shape — no guessing.
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// SuccessResponse builds a 2xx payload.
func SuccessResponse(message string, data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
}

// ErrorResponse builds a 4xx/5xx payload.
func ErrorResponse(errMsg string) APIResponse {
	return APIResponse{
		Success: false,
		Error:   errMsg,
	}
}

// PaginatedResponse wraps list results with pagination metadata.
type PaginatedResponse struct {
	Items      interface{} `json:"items"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	PerPage    int         `json:"per_page"`
	TotalPages int         `json:"total_pages"`
}

func Paginated(items interface{}, total, page, perPage int) PaginatedResponse {
	totalPages := total / perPage
	if total%perPage != 0 {
		totalPages++
	}
	return PaginatedResponse{
		Items:      items,
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
	}
}

// BindOrError is a convenience wrapper used in handlers to bind + respond in one line.
func BindOrError(c *gin.Context, obj interface{}) bool {
	if err := c.ShouldBindJSON(obj); err != nil {
		c.JSON(400, ErrorResponse(err.Error()))
		return false
	}
	return true
}