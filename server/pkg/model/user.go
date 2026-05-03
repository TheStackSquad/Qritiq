//server/model/user.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// UserRole defines trust level and vote weight in the system.
type UserRole string

const (
	RoleGuest   UserRole = "guest"   // unauthenticated, tracked by session_id, weight 0.5
	RoleUser    UserRole = "user"    // authenticated consumer, weight 1.0
	RoleCreator UserRole = "creator" // partner account, weight 1.5
	RolePro     UserRole = "pro"     // paid tier, weight 2.0
	RoleCritic  UserRole = "critic" 
	RoleAdmin   UserRole = "admin"   // platform admin
)

// VoteWeightMap returns the weighted vote value per role.
// Pro users' sentiment carries more signal on the partner dashboard.
var VoteWeightMap = map[UserRole]float64{
    RoleGuest:   0.5,
    RoleUser:    1.0,
    RoleCreator: 1.5,
    RolePro:     2.0,
    RoleCritic:  2.0, // same weight as pro, different identity
    RoleAdmin:   1.0,
}

// User is the core user entity stored in the users table.
type User struct {
	ID           uuid.UUID `db:"id"            json:"id"`
	Email        string    `db:"email"         json:"email"`
	Username     string    `db:"username"      json:"username"`
	PasswordHash string    `db:"password_hash" json:"-"` // never exposed in JSON
	Role         UserRole  `db:"role"          json:"role"`
	IsVerified   bool      `db:"is_verified"   json:"is_verified"`
	AvatarURL    *string   `db:"avatar_url"    json:"avatar_url,omitempty"`
	VoteWeight   float64   `db:"vote_weight"   json:"vote_weight"`
	CreatedAt    time.Time `db:"created_at"    json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"    json:"updated_at"`
}

// --- Request / Response DTOs ---

type CreateUserInput struct {
	Email    string `json:"email"    binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=100"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginInput struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileInput struct {
	Username  *string `json:"username"   binding:"omitempty,min=3,max=100"`
	AvatarURL *string `json:"avatar_url" binding:"omitempty,url"`
}

// UserResponse is the safe public representation (no password hash).
type UserResponse struct {
	ID         uuid.UUID `json:"id"`
	Email      string    `json:"email"`
	Username   string    `json:"username"`
	Role       UserRole  `json:"role"`
	IsVerified bool      `json:"is_verified"`
	AvatarURL  *string   `json:"avatar_url,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
}

// ToResponse strips sensitive fields.
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:         u.ID,
		Email:      u.Email,
		Username:   u.Username,
		Role:       u.Role,
		IsVerified: u.IsVerified,
		AvatarURL:  u.AvatarURL,
		CreatedAt:  u.CreatedAt,
	}
}