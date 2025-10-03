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


class PersonBase(BaseModel):
    """Base schema for Person (Actor/Director)."""
    first_name: str = Field(..., alias="firstName", min_length=1, max_length=100)
    last_name: str = Field(..., alias="lastName", min_length=1, max_length=100)

    class Config:
        populate_by_name = True  # Allow both snake_case and camelCase


class ActorResponse(PersonBase):
    """Actor response schema."""
    id: int

    class Config:
        from_attributes = True
        populate_by_name = True


class DirectorResponse(PersonBase):
    """Director response schema."""
    id: int

    class Config:
        from_attributes = True
        populate_by_name = True


class MovieBase(BaseModel):
    """Base schema for Movie with shared fields."""
    name: str = Field(..., min_length=1, max_length=255)
    year: int = Field(..., ge=1895, le=3000)
    age_limit: int = Field(..., ge=0, le=18)
    rating: int = Field(..., ge=0, le=5)
    synopsis: Optional[str] = None
    genres: List[str] = Field(..., min_length=1)


class MovieCreate(MovieBase):
    """Schema for creating a new movie."""
    actors: List[PersonBase] = Field(default_factory=list)
    director: Optional[PersonBase] = None


class MovieResponse(BaseModel):
    """Schema for movie responses."""
    id: int
    name: str
    year: int
    age_limit: int
    rating: int
    synopsis: Optional[str]
    genres: List[str]
    actors: List[PersonBase]
    director: Optional[PersonBase]

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
            actors=[
                PersonBase(first_name=actor.first_name, last_name=actor.last_name)
                for actor in movie.actors
            ],
            director=PersonBase(
                first_name=movie.director.first_name,
                last_name=movie.director.last_name,
            ) if movie.director else None,
        )


class MoviesListResponse(BaseModel):
    """Paginated response for movie list."""
    total: int
    items: List[MovieResponse]
