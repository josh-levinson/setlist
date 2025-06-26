# Joke List Utilities

This directory contains utility classes for filtering and sorting jokes in the application.

## Overview

The utilities are designed to be modular and reusable, providing clean separation of concerns for joke list operations.

## Classes

### JokeFilter

Handles filtering jokes based on search terms and tag filters.

```typescript
import { JokeFilter, type FilterOptions } from '../utils';

const filterOptions: FilterOptions = {
  searchTerm: 'funny',
  selectedTagFilter: 'tag-id-123'
};

const filteredJokes = JokeFilter.filterJokes(jokes, filterOptions);
```

**Methods:**
- `filterJokes(jokes, options)` - Filters jokes based on search term and tag
- `getActiveFilters(options)` - Returns descriptions of active filters
- `hasActiveFilters(options)` - Checks if any filters are currently active

### JokeSorter

Handles sorting jokes by different criteria.

```typescript
import { JokeSorter, type SortOptions } from '../utils';

const sortOptions: SortOptions = {
  sortBy: 'rating',
  sortDirection: 'desc'
};

const sortedJokes = JokeSorter.sortJokes(jokes, sortOptions);
```

**Methods:**
- `sortJokes(jokes, options)` - Sorts jokes by specified criteria
- `getNextSortDirection(currentSortBy, newSortBy, currentDirection)` - Gets next sort direction when toggling
- `getSortIndicator(sortBy, currentSortBy, direction)` - Gets display indicator for sort state

### JokeListUtils

High-level utility that combines filtering and sorting operations.

```typescript
import { JokeListUtils, type JokeListOptions } from '../utils';

const options: JokeListOptions = {
  filter: { searchTerm: 'funny', selectedTagFilter: null },
  sort: { sortBy: 'rating', sortDirection: 'desc' }
};

const processedJokes = JokeListUtils.processJokes(jokes, options);
const stats = JokeListUtils.calculateStats(jokes);
```

**Methods:**
- `processJokes(jokes, options)` - Filters and sorts jokes in one operation
- `calculateStats(jokes)` - Calculates total duration, average rating, and count
- `getActiveFilters(options, availableTags?)` - Gets active filter descriptions with tag names
- `hasActiveFilters(options)` - Checks if any filters are active
- `getSortIndicator(sortBy, options)` - Gets sort indicator for display

## Usage Examples

### Basic Filtering and Sorting

```typescript
import { JokeListUtils } from '../utils';

const options = {
  filter: { searchTerm: '', selectedTagFilter: null },
  sort: { sortBy: 'name', sortDirection: 'asc' }
};

const processedJokes = JokeListUtils.processJokes(jokes, options);
```

### With Active Filters

```typescript
const options = {
  filter: { searchTerm: 'funny', selectedTagFilter: 'tag-123' },
  sort: { sortBy: 'rating', sortDirection: 'desc' }
};

const activeFilters = JokeListUtils.getActiveFilters(options, availableTags);
const hasFilters = JokeListUtils.hasActiveFilters(options);
```

### Statistics

```typescript
const stats = JokeListUtils.calculateStats(jokes);
console.log(`Total duration: ${stats.totalDuration} minutes`);
console.log(`Average rating: ${stats.averageRating}/10`);
console.log(`Joke count: ${stats.count}`);
```

## Benefits

1. **Separation of Concerns**: Filtering and sorting logic is separated from UI components
2. **Reusability**: Utilities can be used across different components
3. **Testability**: Logic can be easily unit tested in isolation
4. **Maintainability**: Changes to filtering/sorting logic are centralized
5. **Type Safety**: Full TypeScript support with proper type definitions 