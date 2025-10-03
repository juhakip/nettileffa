# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nettileffa is a full-stack movie service with a **FastAPI (Python)** backend and **React (TypeScript)** frontend. The project demonstrates clean architecture with database abstraction supporting both SQLite (development) and PostgreSQL (production) without code changes.

## Architecture

### Monorepo Structure
```
nettileffa/
├── api/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # API routes & FastAPI app
│   │   ├── database.py   # DB abstraction layer
│   │   ├── models.py     # SQLAlchemy ORM models
│   │   ├── schemas.py    # Pydantic validation schemas
│   │   └── seed.py       # Database seeding script
│   └── tests/            # pytest tests
└── web/              # React frontend
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Route-level pages
    │   ├── lib/          # API client & Zod schemas
    │   └── hooks/        # React Query hooks
    └── vitest.config.ts  # Test configuration
```

### Database Abstraction

**Critical**: The database layer is designed to work with both SQLite and PostgreSQL. This is controlled entirely by the `DATABASE_URL` environment variable in `api/.env`:

- **SQLite** (default): `DATABASE_URL=sqlite:///./movies.db`
- **PostgreSQL**: `DATABASE_URL=postgresql://user:pass@host/dbname`

The abstraction is in `api/app/database.py`:
- Uses SQLAlchemy's `DeclarativeBase` for ORM models
- Applies SQLite-specific `connect_args` conditionally
- All models use standard SQLAlchemy types that work on both databases
- Many-to-many relationships via `movie_genre` join table (works identically on both)

**When modifying database code**: Ensure compatibility with both SQLite and PostgreSQL. Avoid database-specific SQL or types.

### Schema Synchronization

The project maintains parallel validation schemas:
- **Backend**: Pydantic schemas in `api/app/schemas.py`
- **Frontend**: Zod schemas in `web/src/lib/schemas.ts`

These must be kept in sync manually. When changing the movie data model:
1. Update `api/app/models.py` (SQLAlchemy)
2. Update `api/app/schemas.py` (Pydantic)
3. Update `web/src/lib/schemas.ts` (Zod)
4. Update corresponding TypeScript types

### API Client Pattern

Frontend uses a clean separation:
- `web/src/lib/api.ts`: Raw fetch calls to backend
- `web/src/hooks/useMovies.ts`: React Query hooks wrapping API calls
- Components consume hooks, never call API directly

API base URL is configurable via `VITE_API_URL` environment variable (defaults to `http://localhost:8000`).

## Common Commands

### Backend (from `api/` directory)

```bash
# Setup (first time)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Seed database with sample movies
python -m app.seed

# Run development server
uvicorn app.main:app --reload

# Run all tests
pytest

# Run specific test
pytest tests/test_api.py::test_create_movie

# Run tests with output
pytest -v

# Run tests quietly
pytest -q
```

### Frontend (from `web/` directory)

```bash
# Setup (first time)
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch
```

## Development Workflow

### Starting Development

1. Start backend: `cd api && source venv/bin/activate && uvicorn app.main:app --reload`
2. Start frontend: `cd web && pnpm dev`
3. Access app at `http://localhost:5173`
4. API docs at `http://localhost:8000/docs`

### Running Tests Before Commits

```bash
# Backend
cd api && pytest -q

# Frontend
cd web && pnpm test
```

### Database Seeding

The database is seeded from `movies-compact.json` at the project root. To re-seed:

```bash
cd api
source venv/bin/activate
python -m app.seed
```

This drops all existing data and recreates tables.

### Switching Database Backend

To switch from SQLite to PostgreSQL:

1. Create `api/.env` file
2. Set `DATABASE_URL=postgresql://user:password@localhost:5432/nettileffa`
3. Restart backend server
4. Run seed script: `python -m app.seed`

No code changes required.

## Testing Notes

### Backend Tests (`api/tests/test_api.py`)

- Uses in-memory SQLite with `StaticPool` to share database across test connections
- **Important**: Must import models at module level to register them with `Base.metadata`
- Test database dependency is overridden at module level before creating `TestClient`
- Fixture creates/drops tables for each test automatically

When adding new models, ensure they're imported in test file:
```python
from app.models import Movie, Genre, movie_genre
```

### Frontend Tests

- Vitest with React Testing Library
- Test setup in `web/src/test/setup.ts`
- Component tests in `*.test.tsx` files next to components

## API Endpoints

Base: `http://localhost:8000/api`

- `GET /movies` - List movies with search, sort, pagination
  - Query params: `search`, `sort` (year|rating|name), `order` (asc|desc), `limit`, `offset`
- `POST /movies` - Create movie (returns 201)
- `GET /genres` - List all unique genres

## Key Architectural Decisions

1. **Monorepo without workspace tools**: Simple structure with separate `api/` and `web/` directories. No Nx/Turborepo needed for this scale.

2. **Database abstraction via environment variable**: Allows seamless SQLite→PostgreSQL migration in production without code changes.

3. **Many-to-many for genres**: Using proper join table (`movie_genre`) rather than JSON arrays ensures database portability and normalization.

4. **React Query for state management**: No Redux/Zustand needed; server state managed by TanStack Query, minimal client state.

5. **Co-located tests**: Backend tests in `api/tests/`, frontend tests alongside components for easier maintenance.
