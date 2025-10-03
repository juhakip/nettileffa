# Nettileffa – Movie Service

A modern full-stack movie service built with **FastAPI (Python)** backend and **React (TypeScript)** frontend.

## Features

- List all movies with search, sort, and pagination
- Add new movies with form validation
- Database abstraction (SQLite for development, PostgreSQL-ready for production)
- Full-text search in movie names and synopsis
- RESTful API with FastAPI
- Modern React UI with TailwindCSS
- Type-safe validation (Pydantic + Zod)
- Comprehensive test coverage

## Architecture

```
nettileffa/
├── api/              # FastAPI backend
│   ├── app/
│   │   ├── main.py       # API routes
│   │   ├── models.py     # SQLAlchemy models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── database.py   # DB abstraction
│   │   └── seed.py       # Data seeding
│   └── tests/            # pytest tests
├── web/              # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # API client, schemas
│   │   └── hooks/        # React Query hooks
│   └── tests/            # Vitest tests
└── movies-compact.json   # Sample data
```

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy 2.0**: ORM with SQLite/PostgreSQL support
- **Pydantic v2**: Request/response validation
- **pytest**: Testing framework

### Frontend
- **React + TypeScript**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Styling
- **TanStack Query**: Data fetching and caching
- **React Router**: Client-side routing
- **React Hook Form + Zod**: Form validation
- **Vitest**: Testing framework

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- pnpm (or npm)

### 1. Backend Setup

```bash
cd api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed database
python -m app.seed

# Run server (default: http://localhost:8000)
uvicorn app.main:app --reload
```

### 2. Frontend Setup

```bash
cd web

# Install dependencies
pnpm install

# Run dev server (default: http://localhost:5173)
pnpm dev
```

### 3. Open the App

Navigate to [http://localhost:5173](http://localhost:5173)

## API Endpoints

Base URL: `http://localhost:8000/api`

### `GET /movies`
Query params:
- `search`: Filter by name/synopsis
- `sort`: `year` | `rating` | `name` (default: `year`)
- `order`: `asc` | `desc` (default: `desc`)
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset

### `POST /movies`
Create a new movie. Request body:
```json
{
  "name": "string",
  "year": 2024,
  "age_limit": 12,
  "rating": 4,
  "synopsis": "optional",
  "genres": ["Action", "Sci-Fi"]
}
```

### `GET /genres`
Returns list of all unique genres.

## Database Configuration

The app supports both SQLite and PostgreSQL via environment variables.

### SQLite (default)
```bash
# api/.env
DATABASE_URL=sqlite:///./movies.db
```

### PostgreSQL
```bash
# api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/nettileffa
```

Just change the `DATABASE_URL` – no code changes needed!

## Testing

### Backend Tests
```bash
cd api
pytest
```

### Frontend Tests
```bash
cd web
pnpm test
```

## Development

### Backend
```bash
cd api
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd web
pnpm dev
```

## Production Build

### Backend
```bash
cd api
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd web
pnpm build
pnpm preview
```

## Project Goals

This project demonstrates:
- **Clean architecture**: Clear separation of concerns (API, DB, UI)
- **Database abstraction**: Easy migration from SQLite to PostgreSQL
- **Modern tooling**: FastAPI, React, TypeScript, TailwindCSS
- **Type safety**: End-to-end validation with Pydantic and Zod
- **Testing**: Comprehensive test coverage
- **AI-assisted development**: Built efficiently using modern AI coding tools

## Future Enhancements

- Docker Compose setup
- FTS5 full-text search in SQLite
- Movie editing and deletion
- Authentication (JWT/OAuth2)
- Genre filters and statistics
- CI/CD with GitHub Actions

## License

MIT
