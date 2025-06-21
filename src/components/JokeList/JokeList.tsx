import { useState, useMemo } from 'react';
import type { Joke, Tag } from '../../types';
import { JokeCard } from '../JokeCard';
import styles from './JokeList.module.css';
import shared from '../../styles/shared.module.css';

interface JokeListProps {
  jokes: Joke[];
  availableTags: Tag[];
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onView: (joke: Joke) => void;
  onTagClick?: (tagId: string) => void;
}

type SortOption = 'name' | 'rating' | 'duration';
type SortDirection = 'asc' | 'desc';

export function JokeList({ jokes, availableTags, onEdit, onDelete, onView, onTagClick }: JokeListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const filteredAndSortedJokes = useMemo(() => {
    let filtered = jokes.filter(joke => {
      // Text search filter
      const matchesSearch = joke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (joke.content && joke.content.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Tag filter
      const matchesTag = !selectedTagFilter || joke.tags.includes(selectedTagFilter);
      
      return matchesSearch && matchesTag;
    });

    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [jokes, sortBy, sortDirection, searchTerm, selectedTagFilter]);

  const totalDuration = jokes.reduce((sum, joke) => sum + joke.duration, 0);
  const averageRating = jokes.length > 0 
    ? jokes.reduce((sum, joke) => sum + joke.rating, 0) / jokes.length 
    : 0;

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTagFilter(selectedTagFilter === tagId ? null : tagId);
    onTagClick?.(tagId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTagFilter(null);
  };

  const selectedTag = availableTags.find(tag => tag.id === selectedTagFilter);

  return (
    <div className={`${styles.list} ${shared.container}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Jokes ({filteredAndSortedJokes.length})</h2>
        <div className={styles.stats}>
          <span>Total Duration: {totalDuration.toFixed(1)} min</span>
          <span>Average Rating: {averageRating.toFixed(1)}/10</span>
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

        <div className={styles.sortControls}>
          <span className={styles.sortLabel}>Sort by:</span>
          <button
            onClick={() => handleSort('name')}
            className={`${styles.sortBtn} ${sortBy === 'name' ? styles.active : ''}`}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('rating')}
            className={`${styles.sortBtn} ${sortBy === 'rating' ? styles.active : ''}`}
          >
            Rating {sortBy === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('duration')}
            className={`${styles.sortBtn} ${sortBy === 'duration' ? styles.active : ''}`}
          >
            Duration {sortBy === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {(searchTerm || selectedTagFilter) && (
        <div className={styles.activeFilters}>
          <span className={styles.filterLabel}>Active filters:</span>
          {searchTerm && (
            <span className={styles.filterTag}>
              Search: "{searchTerm}" ×
              <button onClick={() => setSearchTerm('')} className={styles.clearFilter}>×</button>
            </span>
          )}
          {selectedTag && (
            <span className={styles.filterTag} style={{ backgroundColor: selectedTag.color }}>
              Tag: {selectedTag.name}
              <button onClick={() => setSelectedTagFilter(null)} className={styles.clearFilter}>×</button>
            </span>
          )}
          <button onClick={clearFilters} className={styles.clearAllFilters}>
            Clear All
          </button>
        </div>
      )}

      {filteredAndSortedJokes.length === 0 ? (
        <div className={styles.noJokes}>
          {searchTerm || selectedTagFilter ? 'No jokes found matching your filters.' : 'No jokes yet. Create your first joke!'}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredAndSortedJokes.map(joke => (
            <JokeCard
              key={joke.id}
              joke={joke}
              availableTags={availableTags}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
} 