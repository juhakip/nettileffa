"""Seed script to load movies from movies-compact.json into database."""

import json
import os
from pathlib import Path
from sqlalchemy.orm import Session

from .database import SessionLocal, init_db, engine
from .models import Movie, Genre, Base


def load_movies_from_json(json_path: str) -> list[dict]:
    """Load movie data from JSON file."""
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_database(json_path: str = None):
    """Seed database with movies from JSON file."""
    # Default to movies-compact.json in project root
    if json_path is None:
        project_root = Path(__file__).parent.parent.parent
        json_path = project_root / "movies-compact.json"

    if not os.path.exists(json_path):
        print(f"Error: JSON file not found at {json_path}")
        return

    # Initialize database (create tables)
    print("Initializing database...")
    init_db()

    # Clear existing data
    print("Clearing existing data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Load movies from JSON
    print(f"Loading movies from {json_path}...")
    movies_data = load_movies_from_json(json_path)
    print(f"Found {len(movies_data)} movies")

    # Create session
    db: Session = SessionLocal()

    try:
        # Keep track of genres to avoid duplicates
        genre_cache = {}

        for idx, movie_data in enumerate(movies_data, 1):
            # Get or create genres
            genre_objects = []
            for genre_name in movie_data.get("genres", []):
                if genre_name not in genre_cache:
                    genre = db.query(Genre).filter(Genre.name == genre_name).first()
                    if not genre:
                        genre = Genre(name=genre_name)
                        db.add(genre)
                        db.flush()  # Get the ID
                    genre_cache[genre_name] = genre
                genre_objects.append(genre_cache[genre_name])

            # Create movie (map camelCase ageLimit to snake_case age_limit)
            movie = Movie(
                name=movie_data["name"],
                year=movie_data["year"],
                age_limit=movie_data.get("ageLimit", 0),
                rating=movie_data.get("rating", 3),
                synopsis=movie_data.get("synopsis"),
                genres=genre_objects,
            )
            db.add(movie)

            if idx % 10 == 0:
                print(f"  Processed {idx}/{len(movies_data)} movies...")

        # Commit all changes
        db.commit()
        print(f"\n✓ Successfully seeded {len(movies_data)} movies!")

        # Print statistics
        genre_count = db.query(Genre).count()
        print(f"✓ Created {genre_count} unique genres")

    except Exception as e:
        db.rollback()
        print(f"\n✗ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
