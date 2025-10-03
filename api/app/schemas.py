"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from typing import List, Optional


class GenreBase(BaseModel):
    """Base schema for Genre."""
    name: str = Field(..., min_length=1, max_length=50)


class GenreResponse(GenreBase):
    """Genre response schema."""
    id: int

    class Config:
        from_attributes = True


class MovieBase(BaseModel):
    """Base schema for Movie with shared fields."""
    name: str = Field(..., min_length=1, max_length=255)
    year: int = Field(..., ge=1800, le=2100)
    age_limit: int = Field(..., ge=0, le=18)
    rating: int = Field(..., ge=1, le=5)
    synopsis: Optional[str] = None
    genres: List[str] = Field(..., min_length=1)


class MovieCreate(MovieBase):
    """Schema for creating a new movie."""
    pass


class MovieResponse(BaseModel):
    """Schema for movie responses."""
    id: int
    name: str
    year: int
    age_limit: int
    rating: int
    synopsis: Optional[str]
    genres: List[str]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_movie(cls, movie):
        """Convert SQLAlchemy Movie model to response schema."""
        return cls(
            id=movie.id,
            name=movie.name,
            year=movie.year,
            age_limit=movie.age_limit,
            rating=movie.rating,
            synopsis=movie.synopsis,
            genres=[genre.name for genre in movie.genres],
        )


class MoviesListResponse(BaseModel):
    """Paginated response for movie list."""
    total: int
    items: List[MovieResponse]
