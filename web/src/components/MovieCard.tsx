/**
 * MovieCard component - displays a single movie
 */

import type { Movie } from "../lib/schemas";

interface MovieCardProps {
  movie: Movie;
  searchTerm?: string;
}

function HighlightText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-white">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export function MovieCard({ movie, searchTerm }: MovieCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        <HighlightText text={movie.name} highlight={searchTerm} />
      </h3>

      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
        <span>{movie.year}</span>
        <span>•</span>
        <span>Age {movie.age_limit}+</span>
        <span>•</span>
        <div className="flex items-center">
          <span className="text-yellow-500">{"★".repeat(movie.rating)}</span>
          <span className="text-gray-300">{"★".repeat(5 - movie.rating)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {movie.genres.map((genre) => (
          <span
            key={genre}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
          >
            {genre}
          </span>
        ))}
      </div>

      {movie.synopsis && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          <HighlightText text={movie.synopsis} highlight={searchTerm} />
        </p>
      )}
    </div>
  );
}
