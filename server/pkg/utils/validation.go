//server/pkg/utils/validation.go

package utils

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

// ─── Movie Validation ─────────────────────────────────────────────

type MovieValidationError struct {
	Field   string
	Message string
}

func (e MovieValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ValidateMovieInput checks business rules beyond what gin's binding handles.
func ValidateMovieInput(title, status, releaseDate, trailerURL string) error {
	title = strings.TrimSpace(title)
	if len(title) < 1 {
		return MovieValidationError{"title", "cannot be empty"}
	}
	if len(title) > 255 {
		return MovieValidationError{"title", "must be 255 characters or fewer"}
	}

	if status != "" {
		validStatuses := map[string]bool{"pre_release": true, "released": true, "archived": true}
		if !validStatuses[status] {
			return MovieValidationError{"status", "must be pre_release, released, or archived"}
		}
	}

	if releaseDate != "" {
		if _, err := time.Parse("2006-01-02", releaseDate); err != nil {
			return MovieValidationError{"release_date", "must be in YYYY-MM-DD format"}
		}
	}

	if trailerURL != "" && !isYouTubeURL(trailerURL) && !isValidURL(trailerURL) {
		return MovieValidationError{"trailer_url", "must be a valid URL or YouTube ID"}
	}

	return nil
}

// ─── Music Validation ─────────────────────────────────────────────

func ValidateMusicInput(title, artist, releaseDate string) error {
	if strings.TrimSpace(title) == "" {
		return MovieValidationError{"title", "cannot be empty"}
	}
	if strings.TrimSpace(artist) == "" {
		return MovieValidationError{"artist", "cannot be empty"}
	}
	if releaseDate != "" {
		if _, err := time.Parse("2006-01-02", releaseDate); err != nil {
			return MovieValidationError{"release_date", "must be in YYYY-MM-DD format"}
		}
	}
	return nil
}

// ─── Engagement Validation ────────────────────────────────────────

var validEngagementTypes = map[string]bool{
	"like": true, "dislike": true,
	"hype": true, "meh": true, "flop": true,
	"watch": true,
}

var validContentTypes = map[string]bool{
	"movie": true, "music": true,
}

func ValidateEngagement(contentType, engagementType string) error {
	if !validContentTypes[contentType] {
		return fmt.Errorf("content_type must be 'movie' or 'music'")
	}
	if !validEngagementTypes[engagementType] {
		return fmt.Errorf("engagement_type must be one of: like, dislike, hype, meh, flop, watch")
	}
	return nil
}

// ValidateRating ensures a star score is a valid half-step between 1.0 and 5.0.
func ValidateRating(score float64) error {
	if score < 1.0 || score > 5.0 {
		return fmt.Errorf("score must be between 1.0 and 5.0")
	}
	// Only accept half-steps: 1.0, 1.5, 2.0 ... 5.0
	doubled := score * 2
	if doubled != float64(int(doubled)) {
		return fmt.Errorf("score must be a multiple of 0.5 (e.g. 3.5, 4.0)")
	}
	return nil
}

// ─── User Validation ──────────────────────────────────────────────

var (
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_]{3,30}$`)
)

func ValidateEmail(email string) error {
	if !emailRegex.MatchString(strings.TrimSpace(email)) {
		return fmt.Errorf("invalid email address")
	}
	return nil
}

func ValidateUsername(username string) error {
	if !usernameRegex.MatchString(username) {
		return fmt.Errorf("username must be 3-30 characters, letters, numbers and underscores only")
	}
	return nil
}

func ValidatePassword(password string) error {
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	if len(password) > 128 {
		return fmt.Errorf("password must be 128 characters or fewer")
	}
	return nil
}

// ─── Helpers ──────────────────────────────────────────────────────

var youtubeRegex = regexp.MustCompile(`(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})`)
var urlRegex     = regexp.MustCompile(`^https?://`)

func isYouTubeURL(s string) bool {
	return youtubeRegex.MatchString(s)
}

func isValidURL(s string) bool {
	return urlRegex.MatchString(s)
}