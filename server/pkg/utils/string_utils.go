//server/pkg/utils/string_utils.go

package utils

import (
	"regexp"
	"strings"
	"unicode"
)

var (
	nonAlphanumeric = regexp.MustCompile(`[^a-z0-9\s-]`)
	multipleSpaces  = regexp.MustCompile(`[\s-]+`)
)

// Slugify converts a title like "A Tribe Called Judah 2"
// to a URL-safe slug: "a-tribe-called-judah-2"
func Slugify(s string) string {
	s = strings.ToLower(s)
	// Remove accents/diacritics
	s = removeDiacritics(s)
	// Remove non-alphanumeric (except spaces and hyphens)
	s = nonAlphanumeric.ReplaceAllString(s, "")
	// Replace spaces/multiple hyphens with single hyphen
	s = multipleSpaces.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	return s
}

// removeDiacritics strips accented characters.
func removeDiacritics(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.Is(unicode.Mn, r) {
			continue // skip combining marks
		}
		b.WriteRune(r)
	}
	return b.String()
}

// TruncateString safely truncates a string to maxLen with ellipsis.
func TruncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen-3] + "..."
}

// SanitizeString strips leading/trailing whitespace and collapses internal spaces.
func SanitizeString(s string) string {
	return strings.Join(strings.Fields(s), " ")
}