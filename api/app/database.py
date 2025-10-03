"""Database abstraction layer - supports both SQLite and PostgreSQL."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Get database URL from environment, default to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./movies.db")

# SQLite-specific configuration for better concurrency
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine with dialect-agnostic settings
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,  # Set to True for SQL query logging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """Dependency function to provide database sessions to FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables."""
    Base.metadata.create_all(bind=engine)
