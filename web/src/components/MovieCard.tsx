/**
 * MovieCard component - displays a single movie
 */

import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative">
      {/* Edit button */}
      <button
        onClick={() => navigate(`/edit/${movie.id}`)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        aria-label="Edit movie"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </button>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-8">
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
            <HighlightText text={genre} highlight={searchTerm} />
          </span>
        ))}
      </div>

      {movie.synopsis && (
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
          <HighlightText text={movie.synopsis} highlight={searchTerm} />
        </p>
      )}

      {movie.director && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-semibold">Director:</span>{" "}
          <HighlightText text={`${movie.director.firstName} ${movie.director.lastName}`} highlight={searchTerm} />
        </p>
      )}

      {movie.actors && movie.actors.length > 0 && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Cast:</span>{" "}
          {movie.actors.map((actor, index) => (
            <span key={`${actor.firstName}-${actor.lastName}`}>
              {index > 0 && ", "}
              <HighlightText text={`${actor.firstName} ${actor.lastName}`} highlight={searchTerm} />
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
