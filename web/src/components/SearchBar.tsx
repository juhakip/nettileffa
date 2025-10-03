/**
 * SearchBar component - search and sort controls
 */

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearchChange: (search: string) => void;
  onSortChange: (sort: "year" | "rating" | "name", order: "asc" | "desc") => void;
  defaultSort?: "year" | "rating" | "name";
  defaultOrder?: "asc" | "desc";
}

export function SearchBar({
  onSearchChange,
  onSortChange,
  defaultSort = "name",
  defaultOrder = "asc",
}: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"year" | "rating" | "name">(defaultSort);
  const [order, setOrder] = useState<"asc" | "desc">(defaultOrder);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  // Handle sort change
  useEffect(() => {
    onSortChange(sort, order);
  }, [sort, order, onSortChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Search movies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as "year" | "rating" | "name")}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="name">Sort by Name</option>
        <option value="rating">Sort by Rating</option>
        <option value="year">Sort by Year</option>
      </select>

      <select
        value={order}
        onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}
