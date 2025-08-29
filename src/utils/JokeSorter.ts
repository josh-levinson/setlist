import type { Joke } from '../types';

export type SortOption = 'name' | 'rating' | 'duration';
export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  sortBy: SortOption;
  sortDirection: SortDirection;
}

export class JokeSorter {
  /**
   * Sorts jokes based on the specified criteria and direction
   */
  static sortJokes(jokes: Joke[], options: SortOptions): Joke[] {
    return [...jokes].sort((a, b) => {
      const aValue = this.getSortValue(a, options.sortBy);
      const bValue = this.getSortValue(b, options.sortBy);

      if (aValue < bValue) return options.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return options.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Gets the value to sort by for a given joke and sort option
   */
  private static getSortValue(joke: Joke, sortBy: SortOption): string | number {
    switch (sortBy) {
      case 'name':
        return joke.name.toLowerCase();
      case 'rating':
        return joke.rating || 0;
      case 'duration':
        return joke.duration || 0;
      default:
        return joke.name.toLowerCase();
    }
  }

  /**
   * Gets the next sort direction when toggling the same sort option
   */
  static getNextSortDirection(currentSortBy: SortOption, newSortBy: SortOption, currentDirection: SortDirection): SortDirection {
    if (currentSortBy === newSortBy) {
      return currentDirection === 'asc' ? 'desc' : 'asc';
    }
    return 'asc';
  }

  /**
   * Gets the sort indicator symbol for display
   */
  static getSortIndicator(sortBy: SortOption, currentSortBy: SortOption, direction: SortDirection): string {
    if (sortBy !== currentSortBy) return '';
    return direction === 'asc' ? '↑' : '↓';
  }
} 