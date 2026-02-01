import { useState, useMemo, useEffect } from "react";
import type { Joke, Tag } from "../../types";
import { formatSecondsToMMSS } from "../../utils/duration";
import styles from "./JokeList.module.css";
import shared from "../../styles/shared.module.css";

interface JokeListProps {
  jokes: Joke[];
  availableTags: Tag[];
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onView: (joke: Joke) => void;
  onTagClick?: (tagId: string) => void;
}

type SortOption = "name" | "rating" | "duration" | "created_at";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const ITEMS_PER_PAGE_KEY = 'jokeList.itemsPerPage';

function getStoredItemsPerPage(): number {
  const stored = localStorage.getItem(ITEMS_PER_PAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (ITEMS_PER_PAGE_OPTIONS.includes(parsed)) {
      return parsed;
    }
  }
  return ITEMS_PER_PAGE_OPTIONS[0];
}

export function JokeList({
  jokes,
  availableTags,
  onEdit,
  onDelete,
  onView,
}: JokeListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(getStoredItemsPerPage);

  const filteredAndSortedJokes = useMemo(() => {
    const filtered = jokes.filter((joke) => {
      // Text search filter
      const matchesSearch =
        joke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (joke.content &&
          joke.content.toLowerCase().includes(searchTerm.toLowerCase()));

      // Tag filter
      const matchesTag =
        !selectedTagFilter || joke.tags.includes(selectedTagFilter);

      return matchesSearch && matchesTag;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jokes, sortBy, sortDirection, searchTerm, selectedTagFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedJokes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJokes = filteredAndSortedJokes.slice(startIndex, endIndex);

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTagFilter, itemsPerPage]);

  const totalDuration = jokes.reduce((sum, joke) => sum + (joke.duration || 0), 0);
  const jokesWithRating = jokes.filter(joke => joke.rating !== undefined);
  const averageRating =
    jokesWithRating.length > 0
      ? jokesWithRating.reduce((sum, joke) => sum + (joke.rating || 0), 0) / jokesWithRating.length
      : 0;

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTagFilter(null);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    localStorage.setItem(ITEMS_PER_PAGE_KEY, value.toString());
  };

  const selectedTag = availableTags.find((tag) => tag.id === selectedTagFilter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className={styles.noRating}>No rating</span>;
    return (
      <div className={styles.starRating}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`${styles.star} ${i < Math.floor(rating) ? styles.filled : ''}`}
          >
            ★
          </span>
        ))}
        <span className={styles.ratingNumber}>({rating})</span>
      </div>
    );
  };


  return (
    <div className={`${styles.list} ${shared.container}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Jokes ({filteredAndSortedJokes.length})
        </h2>
        <div className={styles.stats}>
          <span>Total Duration: {formatSecondsToMMSS(totalDuration)}</span>
          <span>Average Rating: {averageRating.toFixed(1)}/5</span>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search jokes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput} ${shared.input}`}
          />
        </div>

        <div className={styles.itemsPerPageSelector}>
          <label className={styles.itemsPerPageLabel}>
            Show:
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className={`${styles.itemsPerPageSelect} ${shared.input}`}
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            per page
          </label>
        </div>

        <div className={styles.sortControls}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button
            onClick={() => handleSort("name")}
            className={`${styles.sortBtn} ${sortBy === "name" ? styles.active : ""
              }`}
          >
            Name {sortBy === "name" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("rating")}
            className={`${styles.sortBtn} ${sortBy === "rating" ? styles.active : ""
              }`}
          >
            Rating{" "}
            {sortBy === "rating" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("duration")}
            className={`${styles.sortBtn} ${sortBy === "duration" ? styles.active : ""
              }`}
          >
            Duration{" "}
            {sortBy === "duration" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("created_at")}
            className={`${styles.sortBtn} ${sortBy === "created_at" ? styles.active : ""
              }`}
          >
            Date{" "}
            {sortBy === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {(searchTerm || selectedTagFilter) && (
        <div className={styles.activeFilters}>
          <span className={styles.filterLabel}>Active filters:</span>
          {searchTerm && (
            <span className={styles.filterTag}>
              Search: "{searchTerm}" ×
              <button
                onClick={() => setSearchTerm("")}
                className={styles.clearFilter}
              >
                ×
              </button>
            </span>
          )}
          {selectedTag && (
            <span
              className={styles.filterTag}
              style={{ backgroundColor: selectedTag.color }}
            >
              Tag: {selectedTag.name}
              <button
                onClick={() => setSelectedTagFilter(null)}
                className={styles.clearFilter}
              >
                ×
              </button>
            </span>
          )}
          <button onClick={clearFilters} className={styles.clearAllFilters}>
            Clear All
          </button>
        </div>
      )}

      {filteredAndSortedJokes.length === 0 ? (
        <div className={styles.noJokes}>
          {searchTerm || selectedTagFilter
            ? "No jokes found matching your filters."
            : "No jokes yet. Create your first joke!"}
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Duration</th>
                  <th>Tags</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJokes.map((joke) => (
                  <tr key={joke.id} className={styles.tableRow}>
                    <td>
                      <button
                        onClick={() => onView(joke)}
                        className={styles.jokeName}
                      >
                        {joke.name}
                      </button>
                    </td>
                    <td className={styles.rating}>
                      {renderStars(joke.rating)}
                    </td>
                    <td className={styles.duration}>
                      {joke.duration ? formatSecondsToMMSS(joke.duration) : 'No duration'}
                    </td>
                    <td className={styles.tags}>
                      {joke.tags.length > 0 ? (
                        <div className={styles.tagList}>
                          {joke.tags.slice(0, 2).map((tagId) => {
                            const tag = availableTags.find((t) => t.id === tagId);
                            return tag ? (
                              <button
                                key={tagId}
                                className={styles.tag}
                                style={{ backgroundColor: tag.color }}
                                onClick={() => setSelectedTagFilter(tag.id)}
                                title={`Filter by ${tag.name}`}
                              >
                                {tag.name}
                              </button>
                            ) : null;
                          })}
                          {joke.tags.length > 2 && (
                            <div className={styles.moreTagsContainer}>
                              <span className={styles.moreTags}>
                                +{joke.tags.length - 2}
                              </span>
                              <div className={styles.tagTooltip}>
                                {joke.tags.slice(2).map((tagId) => {
                                  const tag = availableTags.find((t) => t.id === tagId);
                                  return tag ? (
                                    <button
                                      key={tagId}
                                      className={styles.tag}
                                      style={{ backgroundColor: tag.color }}
                                      onClick={() => setSelectedTagFilter(tag.id)}
                                      title={`Filter by ${tag.name}`}
                                    >
                                      {tag.name}
                                    </button>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={styles.noTags}>No tags</span>
                      )}
                    </td>
                    <td className={styles.date}>
                      {formatDate(joke.created_at)}
                    </td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => onEdit(joke)}
                        className={styles.actionBtn}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(joke.id)}
                        className={styles.actionBtn}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={styles.pageBtn}
              >
                Previous
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`${styles.pageBtn} ${page === currentPage ? styles.activePage : ""
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
