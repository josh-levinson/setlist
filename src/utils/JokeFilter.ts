import type { Joke } from '../types';

export interface FilterOptions {
  searchTerm: string;
  selectedTagFilter: string | null;
}

export class JokeFilter {
  /**
   * Filters jokes based on search term and tag filter
   */
  static filterJokes(jokes: Joke[], options: FilterOptions): Joke[] {
    return jokes.filter(joke => {
      // Text search filter
      const matchesSearch = this.matchesSearchTerm(joke, options.searchTerm);
      
      // Tag filter
      const matchesTag = this.matchesTagFilter(joke, options.selectedTagFilter);
      
      return matchesSearch && matchesTag;
    });
  }

  /**
   * Checks if a joke matches the search term
   */
  private static matchesSearchTerm(joke: Joke, searchTerm: string): boolean {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return joke.name.toLowerCase().includes(term) ||
           (joke.content && joke.content.toLowerCase().includes(term)) || false;
  }

  /**
   * Checks if a joke matches the tag filter
   */
  private static matchesTagFilter(joke: Joke, selectedTagFilter: string | null): boolean {
    if (!selectedTagFilter) return true;
    return joke.tags.includes(selectedTagFilter);
  }

  /**
   * Gets active filter descriptions for display
   */
  static getActiveFilters(options: FilterOptions): Array<{ 
    type: 'search' | 'tag'; 
    value: string; 
    displayValue: string;
    tagColor?: string;
  }> {
    const activeFilters: Array<{ 
      type: 'search' | 'tag'; 
      value: string; 
      displayValue: string;
      tagColor?: string;
    }> = [];
    
    if (options.searchTerm.trim()) {
      activeFilters.push({
        type: 'search',
        value: options.searchTerm,
        displayValue: `Search: "${options.searchTerm}"`
      });
    }
    
    if (options.selectedTagFilter) {
      activeFilters.push({
        type: 'tag',
        value: options.selectedTagFilter,
        displayValue: `Tag: ${options.selectedTagFilter}`
      });
    }
    
    return activeFilters;
  }

  /**
   * Checks if any filters are currently active
   */
  static hasActiveFilters(options: FilterOptions): boolean {
    return options.searchTerm.trim().length > 0 || options.selectedTagFilter !== null;
  }
} 