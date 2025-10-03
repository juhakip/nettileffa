/**
 * TypeScript types and Zod schemas for movies
 * Matches backend Pydantic schemas
 */

import { z } from "zod";

// Zod schema for movie creation (matches backend)
export const movieCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  year: z.number().int().min(1800).max(2100),
  age_limit: z.number().int().min(0).max(18),
  rating: z.number().int().min(1).max(5),
  synopsis: z.string().optional(),
  genres: z.array(z.string()).min(1, "At least one genre is required"),
});

export type MovieCreate = z.infer<typeof movieCreateSchema>;

// TypeScript interfaces for responses
export interface Movie {
  id: number;
  name: string;
  year: number;
  age_limit: number;
  rating: number;
  synopsis: string | null;
  genres: string[];
}

export interface MoviesListResponse {
  total: number;
  items: Movie[];
}

export interface MovieFilters {
  search?: string;
  sort?: "year" | "rating" | "name";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
