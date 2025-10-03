"""API endpoint tests."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import Movie, Genre, Actor, Director, movie_genre, movie_actor  # Import models to register with Base

# Use in-memory SQLite for tests with StaticPool to ensure same database across connections
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # Important: share same in-memory database across connections
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Set up dependency override at module level
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after."""
    # Create tables on test engine
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up
    Base.metadata.drop_all(bind=engine)


#Create test client
client = TestClient(app, raise_server_exceptions=True)


def test_root_endpoint():
    """Test health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_movie():
    """Test creating a new movie."""
    movie_data = {
        "name": "Test Movie",
        "year": 2024,
        "age_limit": 12,
        "rating": 4,
        "synopsis": "A test movie",
        "genres": ["Action", "Comedy"],
    }

    response = client.post("/api/movies", json=movie_data)
    assert response.status_code == 201

    data = response.json()
    assert data["id"] > 0
    assert data["name"] == "Test Movie"
    assert data["year"] == 2024
    assert data["rating"] == 4
    assert set(data["genres"]) == {"Action", "Comedy"}


def test_get_movies_empty():
    """Test getting movies from empty database."""
    response = client.get("/api/movies")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_get_movies_with_data():
    """Test getting movies after adding some."""
    # Add test movies
    movies = [
        {
            "name": "Movie A",
            "year": 2020,
            "age_limit": 12,
            "rating": 5,
            "genres": ["Action"],
        },
        {
            "name": "Movie B",
            "year": 2019,
            "age_limit": 16,
            "rating": 3,
            "genres": ["Drama"],
        },
    ]

    for movie in movies:
        client.post("/api/movies", json=movie)

    response = client.get("/api/movies")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


def test_search_movies():
    """Test searching movies by name."""
    # Add test movie
    client.post(
        "/api/movies",
        json={
            "name": "Alien Invasion",
            "year": 2020,
            "age_limit": 12,
            "rating": 4,
            "genres": ["Sci-Fi"],
        },
    )

    # Search for it
    response = client.get("/api/movies?search=alien")
    assert response.status_code == 200

    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Alien Invasion"

    # Search for non-existent
    response = client.get("/api/movies?search=zombie")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_sort_movies():
    """Test sorting movies."""
    # Add movies with different years
    movies = [
        {"name": "Old Movie", "year": 2000, "age_limit": 0, "rating": 3, "genres": ["Drama"]},
        {"name": "New Movie", "year": 2023, "age_limit": 0, "rating": 5, "genres": ["Action"]},
        {"name": "Mid Movie", "year": 2015, "age_limit": 0, "rating": 4, "genres": ["Comedy"]},
    ]

    for movie in movies:
        client.post("/api/movies", json=movie)

    # Sort by year descending (default)
    response = client.get("/api/movies?sort=year&order=desc")
    data = response.json()
    assert data["items"][0]["year"] == 2023
    assert data["items"][1]["year"] == 2015
    assert data["items"][2]["year"] == 2000

    # Sort by rating ascending
    response = client.get("/api/movies?sort=rating&order=asc")
    data = response.json()
    assert data["items"][0]["rating"] == 3
    assert data["items"][1]["rating"] == 4
    assert data["items"][2]["rating"] == 5


def test_pagination():
    """Test pagination."""
    # Add 5 movies
    for i in range(5):
        client.post(
            "/api/movies",
            json={
                "name": f"Movie {i}",
                "year": 2020 + i,
                "age_limit": 0,
                "rating": 3,
                "genres": ["Drama"],
            },
        )

    # Get first 2
    response = client.get("/api/movies?limit=2&offset=0")
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2

    # Get next 2
    response = client.get("/api/movies?limit=2&offset=2")
    data = response.json()
    assert data["total"] == 5
    assert len(data["items"]) == 2


def test_get_genres():
    """Test getting all genres."""
    # Initially empty
    response = client.get("/api/genres")
    assert response.status_code == 200
    assert response.json() == []

    # Add movie with genres
    client.post(
        "/api/movies",
        json={
            "name": "Test",
            "year": 2020,
            "age_limit": 0,
            "rating": 3,
            "genres": ["Action", "Comedy", "Drama"],
        },
    )

    # Should have 3 genres
    response = client.get("/api/genres")
    assert response.status_code == 200
    genres = response.json()
    assert len(genres) == 3
    assert set(genres) == {"Action", "Comedy", "Drama"}


def test_create_movie_validation():
    """Test validation on movie creation."""
    # Missing required field
    response = client.post(
        "/api/movies",
        json={
            "name": "Test",
            "year": 2020,
            # missing age_limit, rating, genres
        },
    )
    assert response.status_code == 422

    # Invalid year
    response = client.post(
        "/api/movies",
        json={
            "name": "Test",
            "year": 1500,  # Too old
            "age_limit": 0,
            "rating": 3,
            "genres": ["Action"],
        },
    )
    assert response.status_code == 422

    # Invalid rating
    response = client.post(
        "/api/movies",
        json={
            "name": "Test",
            "year": 2020,
            "age_limit": 0,
            "rating": 10,  # Out of range
            "genres": ["Action"],
        },
    )
    assert response.status_code == 422
