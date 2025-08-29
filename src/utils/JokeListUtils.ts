import type { Joke, Tag } from '../types';
import { JokeFilter, type FilterOptions } from './JokeFilter';
import { JokeSorter, type SortOptions } from './JokeSorter';

export interface JokeListOptions {
  filter: FilterOptions;
  sort: SortOptions;
}

export class JokeListUtils {
  /**
   * Filters and sorts jokes based on the provided options
   */
  static processJokes(jokes: Joke[], options: JokeListOptions): Joke[] {
    const filteredJokes = JokeFilter.filterJokes(jokes, options.filter);
    return JokeSorter.sortJokes(filteredJokes, options.sort);
  }

  /**
   * Calculates statistics for a list of jokes
   */
  static calculateStats(jokes: Joke[]): { totalDuration: number; averageRating: number; count: number } {
    const count = jokes.length;
    const totalDuration = jokes.reduce((sum, joke) => sum + (joke.duration || 0), 0);
    const averageRating = count > 0 
      ? jokes.reduce((sum, joke) => sum + (joke.rating || 0), 0) / count 
      : 0;

    return {
      totalDuration,
      averageRating,
      count
    };
  }

  /**
   * Gets active filter descriptions for display
   */
  static getActiveFilters(options: JokeListOptions, availableTags?: Tag[]) {
    const filters = JokeFilter.getActiveFilters(options.filter);
    
    return filters.map(filter => {
      if (filter.type === 'tag' && availableTags) {
        const tag = availableTags.find(t => t.id === filter.value);
        return {
          ...filter,
          displayValue: `Tag: ${tag?.name || filter.value}`,
          tagColor: tag?.color
        };
      }
      return filter;
    });
  }

  /**
   * Checks if any filters are currently active
   */
  static hasActiveFilters(options: JokeListOptions): boolean {
    return JokeFilter.hasActiveFilters(options.filter);
  }

  /**
   * Gets the sort indicator for a specific sort option
   */
  static getSortIndicator(sortBy: string, options: JokeListOptions): string {
    return JokeSorter.getSortIndicator(
      sortBy as any, 
      options.sort.sortBy, 
      options.sort.sortDirection
    );
  }
} 