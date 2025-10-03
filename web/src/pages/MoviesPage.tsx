/**
 * MoviesPage - main page displaying list of movies with search and sort
 */

import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useMovies } from "../hooks/useMovies";
import { MovieList } from "../components/MovieList";
import { SearchBar } from "../components/SearchBar";
import type { MovieFilters } from "../lib/schemas";
import React from "react";

export function MoviesPage() {
  const [filters, setFilters] = useState<MovieFilters>({
    sort: "name",
    order: "asc",
    limit: 20,
  });

  const { data, isLoading, error } = useMovies(filters);

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined, offset: 0 }));
  }, []);

  const handleSortChange = useCallback((
    sort: "year" | "rating" | "name",
    order: "asc" | "desc"
  ) => {
    setFilters((prev) => ({ ...prev, sort, order }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Nettileffa
          </h1>
          <Link
            to="/add"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Movie
          </Link>
        </div>

        {/* Search and Sort */}
        <SearchBar
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          defaultSort="name"
          defaultOrder="asc"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading movies...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error.message}</p>
          </div>
        )}

        {/* Movies List */}
        {data && (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Found {data.total} movies
            </div>
            <MovieList movies={data.items} searchTerm={filters.search} />
          </>
        )}
      </div>
    </div>
  );
}
