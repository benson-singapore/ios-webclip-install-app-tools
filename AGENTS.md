# AGENTS.md

## Project Overview

iOS WebClip Manager backend API built with Go 1.21, Fiber v2, GORM, and SQLite. The backend is in `backend/`, frontend reference code is in `docs/web.tsx`.

## Critical Setup Steps

1. **Always run from `backend/` directory** - all commands assume you're in `backend/`
2. **Swagger docs must be generated before running** - the app imports `_ "ios-install-tools-go/backend/docs"` which won't exist until you run `swag init`
3. **Database directory must exist** - create `backend/data/` before first run or the app will fail

## Development Commands

```bash
cd backend

# First time setup (required order)
go mod download
go install github.com/swaggo/swag/cmd/swag@latest
swag init                    # Must run before go run/build
mkdir -p data                # Create DB directory

# Run
go run main.go               # Starts on :3000

# Or use Makefile shortcuts
make dev                     # Generates swagger + runs (recommended)
make build                   # Compiles to bin/webclip-api
```

## Swagger Regeneration

**Must regenerate after any handler changes:**
```bash
swag init                    # From backend/ directory
```

Swagger annotations are in `main.go` (API metadata) and `handlers/*.go` (endpoint docs). The generated `docs/` package is imported in `main.go:8`.

## Response Format

All endpoints return:
```json
{
  "code": 200,              // 200 = success, not HTTP status
  "message": "success",
  "data": {}
}
```

Use helper functions from `utils/response.go`:
- `SuccessResponse(c, data)` - code 200
- `BadRequestResponse(c, msg)` - code 400
- `NotFoundResponse(c, msg)` - code 404
- `InternalServerErrorResponse(c, msg)` - code 500

## Database

- **SQLite** at `./data/webclip.db` (configurable via `DB_PATH` env var)
- **Timestamps are milliseconds** (not seconds) - use `time.Now().UnixMilli()`
- **GORM auto-migrates** on startup - no manual schema application needed
- **Schema reference** is in `docs/schema.sql` but GORM models in `models/` are source of truth

Tables: `users`, `configs`, `install_logs`

## Adding New Endpoints

1. Define model in `models/` if needed
2. Add handler function in `handlers/` with Swagger comments
3. Register route in `routes/routes.go`
4. Run `swag init` to update docs
5. Restart server

## Module Path

Import path is `ios-install-tools-go/backend` - use this prefix for all internal imports:
```go
import (
    "ios-install-tools-go/backend/database"
    "ios-install-tools-go/backend/models"
    "ios-install-tools-go/backend/handlers"
)
```

## Environment Variables

- `PORT` - default 3000
- `DB_PATH` - default `./data/webclip.db`

No `.env` file loading - set vars directly or use shell export.

## Testing

Automated test script exists at `backend/test_api.sh` - requires `jq` and running server.

## Common Mistakes

- Running `go run main.go` before `swag init` → import error on docs package
- Running commands from repo root instead of `backend/` → module not found
- Forgetting to create `data/` directory → DB init fails
- Using seconds instead of milliseconds for timestamps → time mismatch with frontend
- Not regenerating swagger after handler changes → docs out of sync
