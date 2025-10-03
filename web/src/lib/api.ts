/**
 * API client for Nettileffa backend
 */

import type { Movie, MoviesListResponse, MovieCreate, MovieFilters } from "./schemas";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fetch movies with optional filters
 */
export async function getMovies(filters: MovieFilters = {}): Promise<MoviesListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (filters.limit !== undefined) params.set("limit", filters.limit.toString());
  if (filters.offset !== undefined) params.set("offset", filters.offset.toString());

  const url = `${API_BASE_URL}/api/movies${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new movie
 */
export async function createMovie(data: MovieCreate): Promise<Movie> {
  const response = await fetch(`${API_BASE_URL}/api/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to create movie: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all unique genres
 */
export async function getGenres(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/api/genres`);

  if (!response.ok) {
    throw new Error(`Failed to fetch genres: ${response.statusText}`);
  }

  return response.json();
}
