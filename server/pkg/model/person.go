// server/pkg/model/person.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Person Role ──────────────────────────────────────────────────────────────

// PersonRole is the primary industry discipline of a person.
// Used as the primary_role column and the role_on_project column in credits.
type PersonRole string

const (
	RolePersonActor           PersonRole = "actor"
	RolePersonDirector        PersonRole = "director"
	RolePersonProducer        PersonRole = "producer"
	RolePersonCinematographer PersonRole = "cinematographer"
	RolePersonScriptwriter    PersonRole = "scriptwriter"
	RolePersonMusician        PersonRole = "musician"
	RolePersonSongwriter      PersonRole = "songwriter"
	RolePersonSoundEngineer   PersonRole = "sound_engineer"
	RolePersonEditor          PersonRole = "editor"
	RolePersonCostumeDesigner PersonRole = "costume_designer"
	RolePersonSetDesigner     PersonRole = "set_designer"
	RolePersonFeaturedArtist  PersonRole = "featured_artist"
	RolePersonExecProducer    PersonRole = "executive_producer"
	RolePersonOther           PersonRole = "other"
)

// PersonRoleLabel returns a human-readable display label for a role.
// Used on Spotlight cards and filter tabs.
var PersonRoleLabel = map[PersonRole]string{
	RolePersonActor:           "Actor",
	RolePersonDirector:        "Director",
	RolePersonProducer:        "Producer",
	RolePersonCinematographer: "Cinematographer",
	RolePersonScriptwriter:    "Scriptwriter",
	RolePersonMusician:        "Musician",
	RolePersonSongwriter:      "Songwriter",
	RolePersonSoundEngineer:   "Sound Engineer",
	RolePersonEditor:          "Editor",
	RolePersonCostumeDesigner: "Costume Designer",
	RolePersonSetDesigner:     "Set Designer",
	RolePersonFeaturedArtist:  "Featured Artist",
	RolePersonExecProducer:    "Executive Producer",
	RolePersonOther:           "Other",
}

// ─── Social Links ─────────────────────────────────────────────────────────────

// PersonSocialLinks is the JSONB shape for persons.social_links.
// All fields are optional — omitempty ensures clean JSON output.
type PersonSocialLinks struct {
	Instagram       *string `json:"instagram,omitempty"`
	Twitter         *string `json:"twitter,omitempty"`
	Website         *string `json:"website,omitempty"`
	ManagementEmail *string `json:"management_email,omitempty"`
	TikTok          *string `json:"tiktok,omitempty"`
	YouTube         *string `json:"youtube,omitempty"`
}

// ─── Person ───────────────────────────────────────────────────────────────────

// Person represents an individual in the Nigerian film or music industry.
// avg_hype_score and avg_rating are computed from credited works
// by fn_refresh_person_scores — triggered on credit changes.
type Person struct {
	ID          uuid.UUID  `db:"id"            json:"id"`
	Name        string     `db:"name"          json:"name"`
	Slug        string     `db:"slug"          json:"slug"`
	PrimaryRole PersonRole `db:"primary_role"  json:"primary_role"`
	Bio         *string    `db:"bio"           json:"bio,omitempty"`
	PhotoURL    *string    `db:"photo_url"     json:"photo_url,omitempty"`

	// Computed from credited works — updated by trigger
	AvgHypeScore float64 `db:"avg_hype_score" json:"avg_hype_score"`
	AvgRating    float64 `db:"avg_rating"     json:"avg_rating"`
	TotalCredits int     `db:"total_credits"  json:"total_credits"`

	// JSONB — scanned as []byte, unmarshalled to PersonSocialLinks
	SocialLinksRaw []byte            `db:"social_links" json:"-"`
	SocialLinks    PersonSocialLinks `db:"-"            json:"social_links"`

	// Editorial
	IsFeatured    bool       `db:"is_featured"    json:"is_featured"`
	FeaturedUntil *time.Time `db:"featured_until" json:"featured_until,omitempty"`
	Nationality   string     `db:"nationality"    json:"nationality"`

	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`

	// Populated by JOIN — not stored in persons table
	// Credits are loaded separately to avoid N+1 on list pages
	Credits []*PersonCredit `db:"-" json:"credits,omitempty"`

	// Display label — computed from PersonRoleLabel map
	PrimaryRoleLabel string `db:"-" json:"primary_role_label"`
}

// ComputeDerived fills display-only fields after DB scan.
func (p *Person) ComputeDerived() {
	if label, ok := PersonRoleLabel[p.PrimaryRole]; ok {
		p.PrimaryRoleLabel = label
	} else {
		p.PrimaryRoleLabel = string(p.PrimaryRole)
	}
}

// ─── Person Credit ────────────────────────────────────────────────────────────

// PersonCredit links a Person to a movie or music work.
// A person can be credited in different roles across different works.
// A single work can credit multiple persons.
type PersonCredit struct {
	ID            uuid.UUID  `db:"id"              json:"id"`
	PersonID      uuid.UUID  `db:"person_id"       json:"person_id"`
	ContentID     uuid.UUID  `db:"content_id"      json:"content_id"`
	ContentType   string     `db:"content_type"    json:"content_type"` // "movie" | "music"
	RoleOnProject PersonRole `db:"role_on_project" json:"role_on_project"`
	CreditDetail  *string    `db:"credit_detail"   json:"credit_detail,omitempty"` // character name, instrument
	DisplayOrder  int        `db:"display_order"   json:"display_order"`
	CreatedAt     time.Time  `db:"created_at"      json:"created_at"`

	// Populated by JOIN on the slug page — content summary for the works panel
	ContentTitle  *string  `db:"-" json:"content_title,omitempty"`
	ContentSlug   *string  `db:"-" json:"content_slug,omitempty"`
	ContentImage  *string  `db:"-" json:"content_image,omitempty"`
	ContentGenre  *string  `db:"-" json:"content_genre,omitempty"`
	ContentHype   *float64 `db:"-" json:"content_hype,omitempty"`
	ContentRating *float64 `db:"-" json:"content_rating,omitempty"`
	ContentStatus *string  `db:"-" json:"content_status,omitempty"`

	// Display label
	RoleLabel string `db:"-" json:"role_label"`
}

// ComputeDerived fills RoleLabel after DB scan.
func (c *PersonCredit) ComputeDerived() {
	if label, ok := PersonRoleLabel[c.RoleOnProject]; ok {
		c.RoleLabel = label
	} else {
		c.RoleLabel = string(c.RoleOnProject)
	}
}

// ─── Spotlight List Response ──────────────────────────────────────────────────

// SpotlightListResponse is the payload returned by GET /spotlight.
type SpotlightListResponse struct {
	Featured []*Person `json:"featured"`
	Persons  []*Person `json:"persons"`
	Total    int       `json:"total"`
}

// ─── Input types ──────────────────────────────────────────────────────────────

// These are used internally for seeding and future admin endpoints.
// Not exposed as public API until admin layer is built.

type CreatePersonInput struct {
	Name        string     `json:"name"         binding:"required,min=1,max=255"`
	Slug        string     `json:"slug"         binding:"required,min=1,max=255"`
	PrimaryRole PersonRole `json:"primary_role" binding:"required"`
	Bio         string     `json:"bio"          binding:"omitempty"`
	PhotoURL    string     `json:"photo_url"    binding:"omitempty,url"`
	Nationality string     `json:"nationality"  binding:"omitempty,max=100"`
}

type CreateCreditInput struct {
	PersonID      string     `json:"person_id"      binding:"required,uuid"`
	ContentID     string     `json:"content_id"     binding:"required,uuid"`
	ContentType   string     `json:"content_type"   binding:"required,oneof=movie music"`
	RoleOnProject PersonRole `json:"role_on_project" binding:"required"`
	CreditDetail  string     `json:"credit_detail"  binding:"omitempty,max=255"`
	DisplayOrder  int        `json:"display_order"  binding:"omitempty"`
}

// SpotlightFilter holds validated query params for GET /spotlight.
type SpotlightFilter struct {
	Role   PersonRole `form:"role"`    // filter by primary_role
	Search string     `form:"q"`       // fuzzy name search via pg_trgm
	Page   int        `form:"page"`
	Limit  int        `form:"limit"`
}