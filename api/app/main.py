"""FastAPI application - main entry point."""

from fastapi import FastAPI, Depends, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional

from .database import get_db, init_db
from .models import Movie, Genre, Actor, Director
from .schemas import MovieCreate, MovieResponse, MoviesListResponse

# Initialize FastAPI app
app = FastAPI(
    title="Nettileffa API",
    description="Movie service backend with SQLite/PostgreSQL support",
    version="1.0.0",
)

# CORS middleware - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "nettileffa-api"}


@app.get("/api/movies", response_model=MoviesListResponse)
def get_movies(
    search: Optional[str] = None,
    sort: str = Query("year", regex="^(year|rating|name)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Get movies with optional search, sorting, and pagination.

    - **search**: Optional search term for name/synopsis
    - **sort**: Sort by year, rating, or name (default: year)
    - **order**: Sort order asc or desc (default: desc)
    - **limit**: Number of results per page (default: 20, max: 100)
    - **offset**: Number of results to skip (default: 0)
    """
    query = db.query(Movie)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Movie.name.ilike(search_term),
                Movie.synopsis.ilike(search_term),
            )
        )

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    sort_column = {
        "year": Movie.year,
        "rating": Movie.rating,
        "name": Movie.name,
    }[sort]

    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    movies = query.offset(offset).limit(limit).all()

    # Convert to response schema
    items = [MovieResponse.from_orm_movie(movie) for movie in movies]

    return MoviesListResponse(total=total, items=items)


@app.post("/api/movies", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(movie_data: MovieCreate, db: Session = Depends(get_db)):
    """
    Create a new movie.

    - **name**: Movie name (required)
    - **year**: Release year (required, 1800-2100)
    - **age_limit**: Age limit (required, 0-18)
    - **rating**: Rating 1-5 (required)
    - **synopsis**: Movie synopsis (optional)
    - **genres**: List of genre names (required, min 1)
    - **actors**: List of actors (optional)
    - **director**: Movie director (optional)
    """
    # Create or get genres
    genre_objects = []
    for genre_name in movie_data.genres:
        genre = db.query(Genre).filter(Genre.name == genre_name).first()
        if not genre:
            genre = Genre(name=genre_name)
            db.add(genre)
        genre_objects.append(genre)

    # Create or get director
    director_obj = None
    if movie_data.director:
        director_obj = db.query(Director).filter(
            Director.first_name == movie_data.director.first_name,
            Director.last_name == movie_data.director.last_name,
        ).first()
        if not director_obj:
            director_obj = Director(
                first_name=movie_data.director.first_name,
                last_name=movie_data.director.last_name,
            )
            db.add(director_obj)

    # Create or get actors
    actor_objects = []
    for actor_data in movie_data.actors:
        actor = db.query(Actor).filter(
            Actor.first_name == actor_data.first_name,
            Actor.last_name == actor_data.last_name,
        ).first()
        if not actor:
            actor = Actor(
                first_name=actor_data.first_name,
                last_name=actor_data.last_name,
            )
            db.add(actor)
        actor_objects.append(actor)

    # Create movie
    movie = Movie(
        name=movie_data.name,
        year=movie_data.year,
        age_limit=movie_data.age_limit,
        rating=movie_data.rating,
        synopsis=movie_data.synopsis,
        genres=genre_objects,
        director=director_obj,
        actors=actor_objects,
    )

    db.add(movie)
    db.commit()
    db.refresh(movie)

    return MovieResponse.from_orm_movie(movie)


@app.get("/api/movies/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """Get a single movie by ID."""
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    return MovieResponse.from_orm_movie(movie)


@app.put("/api/movies/{movie_id}", response_model=MovieResponse)
def update_movie(movie_id: int, movie_data: MovieCreate, db: Session = Depends(get_db)):
    """
    Update an existing movie.

    - **movie_id**: ID of the movie to update
    - All other fields same as create
    """
    # Find existing movie
    movie = db.query(Movie).filter(Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Update basic fields
    movie.name = movie_data.name
    movie.year = movie_data.year
    movie.age_limit = movie_data.age_limit
    movie.rating = movie_data.rating
    movie.synopsis = movie_data.synopsis

    # Update genres
    genre_objects = []
    for genre_name in movie_data.genres:
        genre = db.query(Genre).filter(Genre.name == genre_name).first()
        if not genre:
            genre = Genre(name=genre_name)
            db.add(genre)
        genre_objects.append(genre)
    movie.genres = genre_objects

    # Update director
    if movie_data.director:
        director_obj = db.query(Director).filter(
            Director.first_name == movie_data.director.first_name,
            Director.last_name == movie_data.director.last_name,
        ).first()
        if not director_obj:
            director_obj = Director(
                first_name=movie_data.director.first_name,
                last_name=movie_data.director.last_name,
            )
            db.add(director_obj)
        movie.director = director_obj
    else:
        movie.director = None

    # Update actors
    actor_objects = []
    for actor_data in movie_data.actors:
        actor = db.query(Actor).filter(
            Actor.first_name == actor_data.first_name,
            Actor.last_name == actor_data.last_name,
        ).first()
        if not actor:
            actor = Actor(
                first_name=actor_data.first_name,
                last_name=actor_data.last_name,
            )
            db.add(actor)
        actor_objects.append(actor)
    movie.actors = actor_objects

    db.commit()
    db.refresh(movie)

    return MovieResponse.from_orm_movie(movie)


@app.get("/api/genres", response_model=list[str])
def get_genres(db: Session = Depends(get_db)):
    """Get all unique genre names."""
    genres = db.query(Genre.name).order_by(Genre.name).all()
    return [genre[0] for genre in genres]
