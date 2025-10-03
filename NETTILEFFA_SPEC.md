# Nettileffa – Full-Stack Specification

A modern movie service implemented with **FastAPI (Python)** backend and **React (TypeScript)** frontend.  
This stack aligns with Gofore’s job ad focus (AI-assisted development, React, Node/Python) while showing clean architecture and extendability.

---

## Goals
- Deliver a small but complete web service in 1–2 evenings.
- Cover the required use cases:
  1. List all movies
  2. Search movies by term
  3. Add new movies
- Use **AI-assisted coding tools** (Claude Code, ChatGPT Codex) for scaffolding and boilerplate.
- Demonstrate pragmatic choices, clean boundaries, and forward-looking design.

---

## Architecture Overview
```
nettileffa/
  api/        # Python backend (FastAPI + SQLite + SQLAlchemy)
  web/        # React frontend (Vite + TypeScript + Tailwind + TanStack Query)
```

- **Backend** exposes a REST API for movies.
- **Frontend** consumes API, provides SPA-like experience (search, sorting, add form).
- **Database**: SQLite (file-based, zero setup).
- **Data model** seeded from `movies-compact.json`.

---

## Backend (FastAPI)

### Stack
- **FastAPI**: web framework, type-safe routes.
- **SQLAlchemy 2.0**: ORM, schema modeling.
- **SQLite**: local persistence.
- **Pydantic v2**: request/response validation.
- **pytest + httpx**: unit tests.
- **Uvicorn**: development server.
- **CORS middleware**: allow frontend dev server.

### API Endpoints
Base URL: `/api`

#### `GET /movies`
- **Query params**:
  - `search: str` – optional term for title/synopsis.
  - `limit: int` (default 20).
  - `offset: int` (default 0).
  - `sort: str` – one of `year|rating|name`.
  - `order: str` – `asc|desc`.
- **Response**:
  ```json
  {
    "total": 123,
    "items": [
      { "id": 1, "name": "Alien", "year": 1979, "genres": ["Sci-Fi"], ... }
    ]
  }
  ```

#### `POST /movies`
- **Body**:
  ```json
  {
    "name": "string",
    "year": 1999,
    "age_limit": 13,
    "rating": 4,
    "synopsis": "optional",
    "genres": ["Action","Sci-Fi"]
  }
  ```
- **Response**: movie object with `id`.

#### (Optional extensions)
- `GET /genres` – list unique genres.
- `GET /stats/genres` – counts per genre (for charts).

### Database Schema
- `Movie(id, name, year, age_limit, rating, synopsis)`
- `Genre(id, name)`  
- Join table `movie_genre(movie_id, genre_id)`

### Tests
- Add movie → assert `201` and `id > 0`.
- Search for movie → assert it appears in results.

---

## Frontend (React)

### Stack
- **Vite** + **React** + **TypeScript**: fast dev environment.
- **TanStack Query**: API data fetching + caching.
- **React Router**: two routes (`/movies`, `/add`).
- **React Hook Form** + **Zod**: forms + validation.
- **TailwindCSS**: styling.
- **Vitest + Testing Library**: frontend tests.

### Pages
#### Movies List (`/movies`)
- Search box (debounced).
- Sort dropdown (year, rating, name).
- Paginated grid/list of movies.
- Genre chips (optional).
- Loading state + empty state.

#### Add Movie (`/add`)
- Form fields: name, year, age limit, rating, genres, synopsis.
- Validation via Zod schema (mirrors backend).
- Submit → calls `POST /movies` → redirect to `/movies` with toast.

### Components
- `MovieList.tsx`: renders grid of movie cards.
- `MovieForm.tsx`: controlled form with validation.
- `SearchBar.tsx`: search input + sort select.
- `Toast.tsx`: small notifications.

---

## Shared Validation
- **Backend**: Pydantic schemas (`schemas.py`).
- **Frontend**: Zod schemas (`schemas.ts`).
- Kept in sync manually, but structure is identical.

---

## Developer Experience
### Run
```bash
# Backend
cd api
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000

# Frontend
cd web
pnpm install
pnpm dev
```

- Backend runs on `http://localhost:8000`.
- Frontend runs on `http://localhost:5173`.

### Tests
```bash
# Backend
pytest -q

# Frontend
pnpm test
```

---

## Roadmap / Extensions
- **FTS5 full-text search** in SQLite (ranked results).
- **Edit/delete movies**.
- **Authentication** (JWT or OAuth2).
- **Docker Compose**: one command to spin up API + web.
- **GitHub Actions**: lint + test on PRs.
- **Genre filters** and **stats chart** (Chart.js).

---

## Interview Notes
- Backend in Python demonstrates **learning + adaptability**.
- React frontend shows **comfort with modern web stack**.
- Used **AI-assisted tools** for scaffolding, but final structure is clean and extensible.
- Clear layering: API, DB, schemas, UI.
- Chose SQLite for speed but schema easily migrates to Postgres.
