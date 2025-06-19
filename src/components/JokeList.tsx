import { useState, useMemo } from 'react';
import type { Joke } from '../types';
import { JokeCard } from './JokeCard';

interface JokeListProps {
  jokes: Joke[];
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onView: (joke: Joke) => void;
}

type SortOption = 'name' | 'rating' | 'duration';
type SortDirection = 'asc' | 'desc';

export function JokeList({ jokes, onEdit, onDelete, onView }: JokeListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedJokes = useMemo(() => {
    let filtered = jokes.filter(joke =>
      joke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (joke.content && joke.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
  }, [jokes, sortBy, sortDirection, searchTerm]);

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

  return (
    <div className="joke-list">
      <div className="joke-list-header">
        <h2>Jokes ({jokes.length})</h2>
        <div className="joke-stats">
          <span>Total Duration: {totalDuration.toFixed(1)} min</span>
          <span>Average Rating: {averageRating.toFixed(1)}/10</span>
        </div>
      </div>

      <div className="joke-list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search jokes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <span>Sort by:</span>
          <button
            onClick={() => handleSort('name')}
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
          >
            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('rating')}
            className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
          >
            Rating {sortBy === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('duration')}
            className={`sort-btn ${sortBy === 'duration' ? 'active' : ''}`}
          >
            Duration {sortBy === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {filteredAndSortedJokes.length === 0 ? (
        <div className="no-jokes">
          {searchTerm ? 'No jokes found matching your search.' : 'No jokes yet. Create your first joke!'}
        </div>
      ) : (
        <div className="jokes-grid">
          {filteredAndSortedJokes.map(joke => (
            <JokeCard
              key={joke.id}
              joke={joke}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
} 