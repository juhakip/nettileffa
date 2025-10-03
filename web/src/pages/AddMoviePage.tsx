/**
 * AddMoviePage - form to add a new movie with validation
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { movieCreateSchema, type MovieCreate } from "../lib/schemas";
import { useCreateMovie } from "../hooks/useMovies";
import { useState } from "react";

export function AddMoviePage() {
  const navigate = useNavigate();
  const createMovie = useCreateMovie();
  const [genreInput, setGenreInput] = useState("");
  const [genres, setGenres] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MovieCreate>({
    resolver: zodResolver(movieCreateSchema),
    defaultValues: {
      genres: [],
    },
  });

  const addGenre = () => {
    const trimmed = genreInput.trim();
    if (trimmed && !genres.includes(trimmed)) {
      const newGenres = [...genres, trimmed];
      setGenres(newGenres);
      setValue("genres", newGenres);
      setGenreInput("");
    }
  };

  const removeGenre = (genre: string) => {
    const newGenres = genres.filter((g) => g !== genre);
    setGenres(newGenres);
    setValue("genres", newGenres);
  };

  const onSubmit = async (data: MovieCreate) => {
    try {
      await createMovie.mutateAsync(data);
      navigate("/");
    } catch (error) {
      console.error("Failed to create movie:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Add New Movie
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Movie Name *
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Year */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Year *
            </label>
            <input
              {...register("year", { valueAsNumber: true })}
              type="number"
              id="year"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
            )}
          </div>

          {/* Age Limit */}
          <div>
            <label
              htmlFor="age_limit"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Age Limit *
            </label>
            <input
              {...register("age_limit", { valueAsNumber: true })}
              type="number"
              id="age_limit"
              min="0"
              max="18"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.age_limit && (
              <p className="mt-1 text-sm text-red-600">{errors.age_limit.message}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Rating (1-5) *
            </label>
            <input
              {...register("rating", { valueAsNumber: true })}
              type="number"
              id="rating"
              min="1"
              max="5"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
            )}
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Genres *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGenre();
                  }
                }}
                placeholder="Add genre..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addGenre}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-2"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {errors.genres && (
              <p className="mt-1 text-sm text-red-600">{errors.genres.message}</p>
            )}
          </div>

          {/* Synopsis */}
          <div>
            <label
              htmlFor="synopsis"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Synopsis
            </label>
            <textarea
              {...register("synopsis")}
              id="synopsis"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.synopsis && (
              <p className="mt-1 text-sm text-red-600">{errors.synopsis.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMovie.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {createMovie.isPending ? "Creating..." : "Create Movie"}
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>

          {/* Error Message */}
          {createMovie.error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{createMovie.error.message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
