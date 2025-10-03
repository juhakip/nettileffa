/**
 * MovieFormPage - form to add or edit a movie with validation
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useParams } from "react-router-dom";
import { movieCreateSchema, type MovieCreate } from "../lib/schemas";
import { useCreateMovie, useUpdateMovie, useMovie, useGenres } from "../hooks/useMovies";
import { useState, useEffect } from "react";

export function MovieFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const movieId = id ? parseInt(id) : undefined;
  const isEditMode = !!movieId;

  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const { data: movie, isLoading: isLoadingMovie } = useMovie(movieId!);
  const { data: existingGenres = [] } = useGenres();

  const [genreInput, setGenreInput] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [ageLimit, setAgeLimit] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MovieCreate>({
    resolver: zodResolver(movieCreateSchema),
    defaultValues: {
      genres: [],
      rating: 0,
      age_limit: 0,
    },
  });

  // Prefill form when editing
  useEffect(() => {
    if (movie && isEditMode) {
      reset({
        name: movie.name,
        year: movie.year,
        age_limit: movie.age_limit,
        rating: movie.rating,
        synopsis: movie.synopsis || undefined,
        genres: movie.genres,
      });
      setGenres(movie.genres);
      setRating(movie.rating);
      setAgeLimit(movie.age_limit);
    }
  }, [movie, isEditMode, reset]);

  const addGenre = (genre?: string) => {
    const genreToAdd = genre || genreInput.trim();
    if (genreToAdd && !genres.includes(genreToAdd)) {
      const newGenres = [...genres, genreToAdd];
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

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      removeGenre(genre);
    } else {
      addGenre(genre);
    }
  };

  const onSubmit = async (data: MovieCreate) => {
    try {
      if (isEditMode && movieId) {
        await updateMovie.mutateAsync({ id: movieId, data });
      } else {
        await createMovie.mutateAsync(data);
      }
      navigate("/");
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} movie:`, error);
    }
  };

  if (isEditMode && isLoadingMovie) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

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
            {isEditMode ? "Edit Movie" : "Add New Movie"}
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
              min="1895"
              max="3000"
              placeholder="e.g. 2024"
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
              Age Limit: {ageLimit}+
            </label>
            <input
              type="range"
              id="age_limit"
              min="0"
              max="18"
              step="1"
              value={ageLimit}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setAgeLimit(value);
                setValue("age_limit", value);
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0</span>
              <span>18</span>
            </div>
            <input
              type="hidden"
              {...register("age_limit", { valueAsNumber: true })}
              value={ageLimit}
            />
            {errors.age_limit && (
              <p className="mt-1 text-sm text-red-600">{errors.age_limit.message}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    const newRating = rating === star ? 0 : star;
                    setRating(newRating);
                    setValue("rating", newRating);
                  }}
                  className="text-4xl hover:scale-110 transition-transform focus:outline-none"
                >
                  <span className={star <= rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            <input
              type="hidden"
              {...register("rating", { valueAsNumber: true })}
              value={rating}
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

            {/* Existing genres */}
            {existingGenres.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Click to select:</p>
                <div className="flex flex-wrap gap-2">
                  {existingGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        genres.includes(genre)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add new genre */}
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
                placeholder="Or add a new genre..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => addGenre()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Add
              </button>
            </div>

            {/* Selected genres */}
            {genres.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected genres:</p>
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
              </div>
            )}

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
              disabled={createMovie.isPending || updateMovie.isPending}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {createMovie.isPending || updateMovie.isPending
                ? isEditMode ? "Updating..." : "Creating..."
                : isEditMode ? "Update Movie" : "Create Movie"}
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>

          {/* Error Message */}
          {(createMovie.error || updateMovie.error) && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{(createMovie.error || updateMovie.error)?.message}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
