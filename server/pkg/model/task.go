// server/pkg/model/task.go

package model

import (
	"time"

	"github.com/google/uuid"
)

// ─── Task Status ──────────────────────────────────────────────────────────────

type TaskStatus string

const (
	TaskIdle    TaskStatus = "idle"
	TaskRunning TaskStatus = "running"
	TaskFailed  TaskStatus = "failed"
)

// ─── Task Names ───────────────────────────────────────────────────────────────

// TaskName constants match the task_name values seeded in task_metadata.
// The scheduler uses these to claim and complete tasks.
const (
	TaskWeeklyFaceoffMovies = "weekly_faceoff_movies"
	TaskWeeklyFaceoffMusic  = "weekly_faceoff_music"
)

// AllScheduledTasks lists every task the scheduler manages.
// Used by the startup catch-up check to iterate all tasks.
var AllScheduledTasks = []string{
	TaskWeeklyFaceoffMovies,
	TaskWeeklyFaceoffMusic,
}

// ─── Task Metadata ────────────────────────────────────────────────────────────

// TaskMetadata is the DB record in task_metadata.
// The Go scheduler reads this on every hourly heartbeat tick.
//
// Edge cases handled by this model + fn_claim_task:
//
//   Reset Clock Drift      → next_run_at computed from last_run_at, not wall clock.
//                            Server uptime does not affect interval calculation.
//
//   Downtime Blackout      → Startup check reads next_run_at directly.
//                            If next_run_at <= NOW(), task fires immediately.
//                            A 5-day outage triggers the task on first boot.
//
//   Double-Trigger Race    → fn_claim_task uses atomic UPDATE WHERE status='idle'.
//                            Only one process can flip status to 'running'.
//                            The other gets 0 rows affected and skips.
//
//   Startup/Ticker Overlap → Same atomic claim protects against startup check
//                            and hourly ticker firing simultaneously.
//
//   Zombie Task Lock       → fn_claim_task releases status='running' if
//                            started_at < NOW() - 30 minutes before attempting claim.
//                            Server that died mid-task does not block forever.
//
//   Platform Hard Restart  → All state is in DB. RAM state is never trusted.
//                            Railway, Render, fly.io restarts are transparent.
type TaskMetadata struct {
	ID          uuid.UUID  `db:"id"           json:"id"`
	TaskName    string     `db:"task_name"    json:"task_name"`
	Status      TaskStatus `db:"status"       json:"status"`
	LastRunAt   *time.Time `db:"last_run_at"  json:"last_run_at,omitempty"`
	StartedAt   *time.Time `db:"started_at"   json:"started_at,omitempty"`
	NextRunAt   *time.Time `db:"next_run_at"  json:"next_run_at,omitempty"`
	RunInterval string     `db:"run_interval" json:"run_interval"` // PostgreSQL interval string
	LastError   *string    `db:"last_error"   json:"last_error,omitempty"`
	RunCount    int        `db:"run_count"    json:"run_count"`
	CreatedAt   time.Time  `db:"created_at"   json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at"   json:"updated_at"`
}

// IsDue returns true if the task should run now.
// Used by the hourly heartbeat ticker as a pre-check before hitting the DB
// with fn_claim_task. Avoids unnecessary DB writes on every tick.
func (t *TaskMetadata) IsDue() bool {
	if t.Status == TaskRunning {
		return false
	}
	if t.NextRunAt == nil {
		return true // never run — eligible immediately
	}
	return time.Now().UTC().After(*t.NextRunAt)
}

// IsZombie returns true if the task appears stuck in 'running' state.
// fn_claim_task handles the actual unlock — this is for logging/monitoring.
func (t *TaskMetadata) IsZombie() bool {
	if t.Status != TaskRunning || t.StartedAt == nil {
		return false
	}
	return time.Since(*t.StartedAt) > 30*time.Minute
}

// ─── Scheduler Config ─────────────────────────────────────────────────────────

// SchedulerConfig holds runtime configuration for the arena scheduler.
// Passed into the scheduler service from main.go.
type SchedulerConfig struct {
	// How often the heartbeat ticker wakes up to check task_metadata.
	// Recommended: 1 hour. Lower values increase DB read frequency.
	HeartbeatInterval time.Duration

	// How long after ends_at a battle is considered overdue for closure.
	// Gives a small grace window for the scheduler to close battles cleanly.
	BattleCloseGrace time.Duration

	// Cooling period enforced between a content's battle appearances.
	// Must match the v_cooling interval in fn_find_battle_match.
	CoolingPeriod time.Duration

	// Duration of each new battle. Inserted as ends_at = starts_at + BattleDuration.
	BattleDuration time.Duration
}

// DefaultSchedulerConfig returns production-safe defaults.
func DefaultSchedulerConfig() SchedulerConfig {
	return SchedulerConfig{
		HeartbeatInterval: 1 * time.Hour,
		BattleCloseGrace:  5 * time.Minute,
		CoolingPeriod:     14 * 24 * time.Hour, // 2 weeks
		BattleDuration:    7 * 24 * time.Hour,  // 1 week
	}
}

// ─── Scheduler Run Result ─────────────────────────────────────────────────────

// SchedulerRunResult is returned by the scheduler service after each run.
// Used for logging and health monitoring. Not exposed via API.
type SchedulerRunResult struct {
	TaskName      string    `json:"task_name"`
	ContentType   string    `json:"content_type"`
	BattlesClosed int       `json:"battles_closed"`
	BattleCreated bool      `json:"battle_created"`
	MatchTier     int       `json:"match_tier,omitempty"`
	MatchReason   string    `json:"match_reason,omitempty"`
	Error         string    `json:"error,omitempty"`
	RanAt         time.Time `json:"ran_at"`
	DurationMs    int64     `json:"duration_ms"`
}