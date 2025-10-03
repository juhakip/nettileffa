/**
 * React Query hooks for movies
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMovies, createMovie, getGenres } from "../lib/api";
import type { MovieFilters, MovieCreate } from "../lib/schemas";

/**
 * Hook to fetch movies with filters
 */
export function useMovies(filters: MovieFilters = {}) {
  return useQuery({
    queryKey: ["movies", filters],
    queryFn: () => getMovies(filters),
  });
}

/**
 * Hook to create a movie
 */
export function useCreateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MovieCreate) => createMovie(data),
    onSuccess: () => {
      // Invalidate movies queries to refetch
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

/**
 * Hook to fetch all genres
 */
export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
    staleTime: 5 * 60 * 1000, // Consider genres fresh for 5 minutes
  });
}
