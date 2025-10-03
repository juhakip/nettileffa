"""SQLAlchemy models for movies, genres, actors, and directors."""

from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# Association table for many-to-many relationship between movies and genres
movie_genre = Table(
    "movie_genre",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id"), primary_key=True),
    Column("genre_id", Integer, ForeignKey("genres.id"), primary_key=True),
)

# Association table for many-to-many relationship between movies and actors
movie_actor = Table(
    "movie_actor",
    Base.metadata,
    Column("movie_id", Integer, ForeignKey("movies.id"), primary_key=True),
    Column("actor_id", Integer, ForeignKey("actors.id"), primary_key=True),
)


class Movie(Base):
    """Movie model - works identically on SQLite and PostgreSQL."""

    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    age_limit = Column(Integer, nullable=False)
    rating = Column(Integer, nullable=False, index=True)
    synopsis = Column(Text, nullable=True)
    director_id = Column(Integer, ForeignKey("directors.id"), nullable=True)

    # Many-to-many relationship with Genre
    genres = relationship(
        "Genre",
        secondary=movie_genre,
        back_populates="movies",
        lazy="joined",  # Eager load genres to avoid N+1 queries
    )

    # Many-to-one relationship with Director
    director = relationship("Director", back_populates="movies", lazy="joined")

    # Many-to-many relationship with Actor
    actors = relationship(
        "Actor",
        secondary=movie_actor,
        back_populates="movies",
        lazy="joined",  # Eager load actors to avoid N+1 queries
    )

    def __repr__(self):
        return f"<Movie(id={self.id}, name='{self.name}', year={self.year})>"


class Genre(Base):
    """Genre model - supports normalization and reusability."""

    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)

    # Many-to-many relationship with Movie
    movies = relationship(
        "Movie",
        secondary=movie_genre,
        back_populates="genres",
    )

    def __repr__(self):
        return f"<Genre(id={self.id}, name='{self.name}')>"


class Director(Base):
    """Director model - one director can direct many movies."""

    __tablename__ = "directors"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    # One-to-many relationship with Movie
    movies = relationship("Movie", back_populates="director")

    def __repr__(self):
        return f"<Director(id={self.id}, name='{self.first_name} {self.last_name}')>"


class Actor(Base):
    """Actor model - many-to-many relationship with movies."""

    __tablename__ = "actors"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    # Many-to-many relationship with Movie
    movies = relationship(
        "Movie",
        secondary=movie_actor,
        back_populates="actors",
    )

    def __repr__(self):
        return f"<Actor(id={self.id}, name='{self.first_name} {self.last_name}')>"
