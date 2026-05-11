// server/pkg/repository/person_repo.go

package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/qritiq/server/pkg/model"
)

type PersonRepo struct {
	db *sqlx.DB
}

func NewPersonRepo(db *sqlx.DB) *PersonRepo {
	return &PersonRepo{db: db}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// hydratePerson unmarshals SocialLinksRaw into SocialLinks and calls ComputeDerived.
func hydratePerson(p *model.Person) error {
	if len(p.SocialLinksRaw) > 0 {
		if err := json.Unmarshal(p.SocialLinksRaw, &p.SocialLinks); err != nil {
			return fmt.Errorf("person_repo: unmarshal social_links: %w", err)
		}
	}
	p.ComputeDerived()
	return nil
}

func hydratePersons(persons []*model.Person) error {
	for _, p := range persons {
		if err := hydratePerson(p); err != nil {
			return err
		}
	}
	return nil
}

func hydrateCredits(credits []*model.PersonCredit) {
	for _, c := range credits {
		c.ComputeDerived()
	}
}

// ─── List ─────────────────────────────────────────────────────────────────────

// List returns paginated persons with optional role filter and fuzzy name search.
// Featured persons are always returned first, then sorted by avg_hype_score.
func (r *PersonRepo) List(
	ctx context.Context,
	filter model.SpotlightFilter,
) ([]*model.Person, int, error) {
	// Default pagination
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 || filter.Limit > 50 {
		filter.Limit = 20
	}
	offset := (filter.Page - 1) * filter.Limit

	// Build WHERE clauses dynamically
	where := "WHERE 1=1"
	args := []interface{}{}
	argN := 1

	if filter.Role != "" {
		where += fmt.Sprintf(" AND primary_role = $%d", argN)
		args = append(args, string(filter.Role))
		argN++
	}

	if filter.Search != "" {
		where += fmt.Sprintf(" AND name ILIKE '%%' || $%d || '%%'", argN)
		args = append(args, filter.Search)
		argN++
	}

	// Count query
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM persons %s`, where)
	var total int
	if err := r.db.GetContext(ctx, &total, countQ, args...); err != nil {
		return nil, 0, fmt.Errorf("person_repo: list count: %w", err)
	}

	// Data query — featured first, then hype score desc
	args = append(args, filter.Limit, offset)
	dataQ := fmt.Sprintf(`
		SELECT * FROM persons
		%s
		ORDER BY is_featured DESC, avg_hype_score DESC
		LIMIT $%d OFFSET $%d`,
		where, argN, argN+1,
	)

	var persons []*model.Person
	if err := r.db.SelectContext(ctx, &persons, dataQ, args...); err != nil {
		return nil, 0, fmt.Errorf("person_repo: list: %w", err)
	}
	if err := hydratePersons(persons); err != nil {
		return nil, 0, err
	}
	return persons, total, nil
}

// GetFeatured returns currently featured persons.
// Used for the editorial hero section on the Spotlight page.
// featured_until = NULL means permanently featured.
func (r *PersonRepo) GetFeatured(ctx context.Context) ([]*model.Person, error) {
	const q = `
		SELECT * FROM persons
		WHERE is_featured = TRUE
		  AND (featured_until IS NULL OR featured_until > NOW())
		ORDER BY avg_hype_score DESC`

	var persons []*model.Person
	if err := r.db.SelectContext(ctx, &persons, q); err != nil {
		return nil, fmt.Errorf("person_repo: get_featured: %w", err)
	}
	if err := hydratePersons(persons); err != nil {
		return nil, err
	}
	return persons, nil
}

// ─── Single ───────────────────────────────────────────────────────────────────

// GetBySlug fetches a single person by slug.
// Used by GET /spotlight/:slug.
func (r *PersonRepo) GetBySlug(ctx context.Context, slug string) (*model.Person, error) {
	const q = `SELECT * FROM persons WHERE slug = $1`
	var p model.Person
	if err := r.db.GetContext(ctx, &p, q, slug); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("person_repo: get_by_slug: %w", err)
	}
	if err := hydratePerson(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

// GetByID fetches a single person by UUID.
func (r *PersonRepo) GetByID(ctx context.Context, id uuid.UUID) (*model.Person, error) {
	const q = `SELECT * FROM persons WHERE id = $1`
	var p model.Person
	if err := r.db.GetContext(ctx, &p, q, id); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("person_repo: get_by_id: %w", err)
	}
	if err := hydratePerson(&p); err != nil {
		return nil, err
	}
	return &p, nil
}

// ─── Credits ──────────────────────────────────────────────────────────────────

// GetCreditsForPerson fetches all credits for a person with content details joined.
// Used by the Works panel on /spotlight/:slug.
// JOINs movies and music in a UNION so both content types are returned together.
func (r *PersonRepo) GetCreditsForPerson(
	ctx context.Context,
	personID uuid.UUID,
) ([]*model.PersonCredit, error) {
	const q = `
		SELECT
			pc.id,
			pc.person_id,
			pc.content_id,
			pc.content_type,
			pc.role_on_project,
			pc.credit_detail,
			pc.display_order,
			pc.created_at,
			-- Content summary from JOIN
			COALESCE(m.title, mu.title)                                   AS content_title,
			COALESCE(m.slug,  mu.slug)                                    AS content_slug,
			COALESCE(m.poster_url, mu.cover_url)                          AS content_image,
			COALESCE(m.genre, mu.genre)                                   AS content_genre,
			COALESCE(m.hype_score, mu.hype_score)                         AS content_hype,
			COALESCE(m.rating_score, mu.rating_score)                     AS content_rating,
			COALESCE(m.status::TEXT, mu.status::TEXT)                     AS content_status
		FROM person_credits pc
		LEFT JOIN movies m  ON m.id  = pc.content_id AND pc.content_type = 'movie'
		LEFT JOIN music  mu ON mu.id = pc.content_id AND pc.content_type = 'music'
		WHERE pc.person_id = $1
		ORDER BY pc.display_order ASC, pc.created_at DESC`

	var credits []*model.PersonCredit
	if err := r.db.SelectContext(ctx, &credits, q, personID); err != nil {
		return nil, fmt.Errorf("person_repo: get_credits_for_person: %w", err)
	}
	hydrateCredits(credits)
	return credits, nil
}

// GetPersonsForContent fetches all persons credited on a given movie or track.
// Used on movie/[slug] and music/[slug] pages to show the crew panel.
func (r *PersonRepo) GetPersonsForContent(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) ([]*PersonOnContent, error) {
	const q = `
		SELECT
			p.id,
			p.name,
			p.slug,
			p.photo_url,
			p.primary_role,
			pc.role_on_project,
			pc.credit_detail,
			pc.display_order
		FROM person_credits pc
		INNER JOIN persons p ON p.id = pc.person_id
		WHERE pc.content_id   = $1
		  AND pc.content_type = $2
		ORDER BY pc.display_order ASC, p.name ASC`

	var persons []*PersonOnContent
	if err := r.db.SelectContext(ctx, &persons, q, contentID, contentType); err != nil {
		return nil, fmt.Errorf("person_repo: get_persons_for_content: %w", err)
	}
	return persons, nil
}

// PersonOnContent is the lightweight shape used on movie/music slug pages.
// Avoids loading the full Person struct and its JSONB social links.
type PersonOnContent struct {
	ID            uuid.UUID          `db:"id"              json:"id"`
	Name          string             `db:"name"            json:"name"`
	Slug          string             `db:"slug"            json:"slug"`
	PhotoURL      *string            `db:"photo_url"       json:"photo_url,omitempty"`
	PrimaryRole   model.PersonRole   `db:"primary_role"    json:"primary_role"`
	RoleOnProject model.PersonRole   `db:"role_on_project" json:"role_on_project"`
	CreditDetail  *string            `db:"credit_detail"   json:"credit_detail,omitempty"`
	DisplayOrder  int                `db:"display_order"   json:"display_order"`
}

// ─── Spotlight page payload ───────────────────────────────────────────────────

// GetSpotlightPayload builds the full Spotlight page response.
// Featured persons + paginated list in a single method call.
func (r *PersonRepo) GetSpotlightPayload(
	ctx context.Context,
	filter model.SpotlightFilter,
) (*model.SpotlightListResponse, error) {
	featured, err := r.GetFeatured(ctx)
	if err != nil {
		return nil, fmt.Errorf("person_repo: get_spotlight_payload featured: %w", err)
	}

	persons, total, err := r.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("person_repo: get_spotlight_payload list: %w", err)
	}

	return &model.SpotlightListResponse{
		Featured: featured,
		Persons:  persons,
		Total:    total,
	}, nil
}

// ─── Score refresh ────────────────────────────────────────────────────────────

// RefreshPersonScores calls fn_refresh_person_scores for a given person.
// Called by the background worker after hype/rating scores are updated
// on the content a person is credited on.
func (r *PersonRepo) RefreshPersonScores(ctx context.Context, personID uuid.UUID) error {
	if _, err := r.db.ExecContext(ctx,
		`SELECT fn_refresh_person_scores($1)`, personID,
	); err != nil {
		return fmt.Errorf("person_repo: refresh_person_scores: %w", err)
	}
	return nil
}

// GetPersonIDsForContent returns person UUIDs credited on a content item.
// Used by the worker to know which persons need score refresh after
// a movie or music engagement triggers a hype_score update.
func (r *PersonRepo) GetPersonIDsForContent(
	ctx context.Context,
	contentID uuid.UUID,
	contentType string,
) ([]uuid.UUID, error) {
	const q = `
		SELECT person_id FROM person_credits
		WHERE content_id   = $1
		  AND content_type = $2`

	var ids []uuid.UUID
	if err := r.db.SelectContext(ctx, &ids, q, contentID, contentType); err != nil {
		return nil, fmt.Errorf("person_repo: get_person_ids_for_content: %w", err)
	}
	return ids, nil
}