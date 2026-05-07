# Qritiq — Project Context for Claude

## Stack
- **Client**: Next.js (App Router), JavaScript, Tailwind CSS
- **Server**: Go (`main.go`, `pkg/`, `db/`)
- **CI/CD**: GitHub Actions (`.github/workflows/`)

## Project Constraints
- Target users span low-bandwidth (2G/3G) AND high-end devices — optimize for both
- Lighthouse score targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90
- Zero tolerance for exposed secrets or insecure API patterns
- Every push to `main` must pass the full quality gate

## Client Structure
```
client/
├── src/           # App source
├── public/        # Static assets
├── next.config.mjs
└── eslint.config.mjs
```

## Server Structure
```
server/
├── main.go
├── pkg/           # Go packages
└── db/            # DB layer
```

## Subagents Available
| Agent | Trigger |
|---|---|
| `performance-auditor` | Before any PR or push; after adding new pages/components |
| `security-reviewer` | When touching auth, env vars, API routes, input handling |
| `frontend-optimizer` | When bundle size grows or new dependencies are added |
| `go-backend-reviewer` | When modifying Go handlers, DB queries, or middleware |
| `pre-push-validator` | ALWAYS before `git push` |

## Coding Rules
- Never commit `.env` or `.env.local` — use `.env.example`
- No `console.log` in production code
- All images must use Next.js `<Image>` with explicit `width`/`height`
- API responses must include proper HTTP status codes
- Go errors must be handled explicitly — no `_` discard on errors
## Navigation Standards
- Header text must never be hardcoded; it must dynamically reflect the selected navigation item.
