/**
 * MovieFormPage - form to add or edit a movie with validation
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useParams } from "react-router-dom";
import { movieCreateSchema, type MovieCreate, type Person } from "../lib/schemas";
import { useCreateMovie, useUpdateMovie, useMovie, useGenres } from "../hooks/useMovies";
import { useState, useEffect } from "react";
import { searchActors, searchDirectors } from "../lib/api";
import React from "react";

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

  // Actor state
  const [actorSearch, setActorSearch] = useState("");
  const [actorResults, setActorResults] = useState<Person[]>([]);
  const [selectedActors, setSelectedActors] = useState<Person[]>([]);
  const [showActorResults, setShowActorResults] = useState(false);

  // Director state
  const [directorSearch, setDirectorSearch] = useState("");
  const [directorResults, setDirectorResults] = useState<Person[]>([]);
  const [selectedDirector, setSelectedDirector] = useState<Person | null>(null);
  const [showDirectorResults, setShowDirectorResults] = useState(false);
  const [directorFirstName, setDirectorFirstName] = useState("");
  const [directorLastName, setDirectorLastName] = useState("");
  const [showDirectorForm, setShowDirectorForm] = useState(false);

  // New actor form state
  const [actorFirstName, setActorFirstName] = useState("");
  const [actorLastName, setActorLastName] = useState("");
  const [showActorForm, setShowActorForm] = useState(false);

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
        actors: movie.actors || [],
        director: movie.director || undefined,
      });
      setGenres(movie.genres);
      setRating(movie.rating);
      setAgeLimit(movie.age_limit);
      setSelectedActors(movie.actors || []);
      setSelectedDirector(movie.director || null);
    }
  }, [movie, isEditMode, reset]);

  // Search actors with debounce
  useEffect(() => {
    if (actorSearch.length < 2) {
      setActorResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchActors(actorSearch);
      setActorResults(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [actorSearch]);

  // Search directors with debounce
  useEffect(() => {
    if (directorSearch.length < 2) {
      setDirectorResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await searchDirectors(directorSearch);
      setDirectorResults(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [directorSearch]);

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

  const addActor = (actor: Person) => {
    const exists = selectedActors.some(
      (a) => a.firstName === actor.firstName && a.lastName === actor.lastName
    );
    if (!exists) {
      const newActors = [...selectedActors, actor];
      setSelectedActors(newActors);
      setValue("actors", newActors);
    }
    setActorSearch("");
    setShowActorResults(false);
  };

  const removeActor = (actor: Person) => {
    const newActors = selectedActors.filter(
      (a) => !(a.firstName === actor.firstName && a.lastName === actor.lastName)
    );
    setSelectedActors(newActors);
    setValue("actors", newActors);
  };

  const selectDirector = (director: Person) => {
    setSelectedDirector(director);
    setValue("director", director);
    setDirectorSearch("");
    setShowDirectorResults(false);
  };

  const addNewDirector = () => {
    if (directorFirstName.trim() && directorLastName.trim()) {
      const newDirector = {
        firstName: directorFirstName.trim(),
        lastName: directorLastName.trim(),
      };
      setSelectedDirector(newDirector);
      setValue("director", newDirector);
      setDirectorFirstName("");
      setDirectorLastName("");
      setShowDirectorForm(false);
    }
  };

  const addNewActor = () => {
    if (actorFirstName.trim() && actorLastName.trim()) {
      const newActor = {
        firstName: actorFirstName.trim(),
        lastName: actorLastName.trim(),
      };
      addActor(newActor);
      setActorFirstName("");
      setActorLastName("");
      setShowActorForm(false);
    }
  };

  const onSubmit = async (data: MovieCreate) => {
    try {
      const submitData = {
        ...data,
        actors: selectedActors,
        director: selectedDirector || undefined,
      };

      if (isEditMode && movieId) {
        await updateMovie.mutateAsync({ id: movieId, data: submitData });
      } else {
        await createMovie.mutateAsync(submitData);
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

          {/* Director */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Director
            </label>

            {selectedDirector ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full flex items-center gap-2">
                  {selectedDirector.firstName} {selectedDirector.lastName}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDirector(null);
                      setValue("director", undefined);
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              </div>
            ) : showDirectorForm ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={directorFirstName}
                    onChange={(e) => setDirectorFirstName(e.target.value)}
                    placeholder="First name"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={directorLastName}
                    onChange={(e) => setDirectorLastName(e.target.value)}
                    placeholder="Last name"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addNewDirector}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDirectorForm(false);
                      setDirectorFirstName("");
                      setDirectorLastName("");
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={directorSearch}
                    onChange={(e) => setDirectorSearch(e.target.value)}
                    onFocus={() => setShowDirectorResults(true)}
                    onBlur={() => setTimeout(() => setShowDirectorResults(false), 200)}
                    placeholder="Search director by name..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDirectorForm(true)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    + New
                  </button>
                </div>
                {showDirectorResults && directorResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {directorResults.map((director, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectDirector(director)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        {director.firstName} {director.lastName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actors */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actors
            </label>

            {/* Selected actors */}
            {selectedActors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedActors.map((actor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center gap-2"
                  >
                    {actor.firstName} {actor.lastName}
                    <button
                      type="button"
                      onClick={() => removeActor(actor)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new actor form */}
            {showActorForm ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={actorFirstName}
                    onChange={(e) => setActorFirstName(e.target.value)}
                    placeholder="First name"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={actorLastName}
                    onChange={(e) => setActorLastName(e.target.value)}
                    placeholder="Last name"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addNewActor}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowActorForm(false);
                      setActorFirstName("");
                      setActorLastName("");
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={actorSearch}
                    onChange={(e) => setActorSearch(e.target.value)}
                    onFocus={() => setShowActorResults(true)}
                    onBlur={() => setTimeout(() => setShowActorResults(false), 200)}
                    placeholder="Search actors by name..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowActorForm(true)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    + New
                  </button>
                </div>
                {showActorResults && actorResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {actorResults.map((actor, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addActor(actor)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                      >
                        {actor.firstName} {actor.lastName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
