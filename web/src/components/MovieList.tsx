/**
 * MovieList component - displays a grid of movies
 */

import type { Movie } from "../lib/schemas";
import { MovieCard } from "./MovieCard";

interface MovieListProps {
  movies: Movie[];
  searchTerm?: string;
}

export function MovieList({ movies, searchTerm }: MovieListProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No movies found. Try adjusting your search or add a new movie!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} searchTerm={searchTerm} />
      ))}
    </div>
  );
}
