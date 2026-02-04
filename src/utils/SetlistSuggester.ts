import type { Joke } from '../types';

export interface SuggestionConfig {
  mode: 'duration' | 'quantity';
  targetDuration: number;      // seconds
  targetQuantity: number;
  filterTagIds: string[];      // only jokes with these tags (empty = all jokes)
  preferHigherRating: boolean;
  groupByTags: boolean;
}

export interface SuggestionResult {
  jokes: Joke[];
  totalDuration: number;
  averageRating: number;
}

/**
 * Filter jokes to only include those that have at least one of the specified tags.
 * If filterTagIds is empty, returns all jokes.
 */
export function filterByTags(jokes: Joke[], filterTagIds: string[]): Joke[] {
  if (filterTagIds.length === 0) {
    return jokes;
  }

  return jokes.filter(joke =>
    joke.tags.some(tagId => filterTagIds.includes(tagId))
  );
}

/**
 * Calculate a score for a joke based on rating preference.
 * Higher rated jokes get higher scores.
 */
function scoreJoke(joke: Joke, preferHigherRating: boolean): number {
  if (!preferHigherRating) {
    // Return a random score for variety when not preferring ratings
    return Math.random();
  }

  // Score based on rating (1-5 scale)
  // Add a small random factor to break ties
  const ratingScore = (joke.rating || 0) * 10;
  const randomFactor = Math.random() * 0.5;
  return ratingScore + randomFactor;
}

/**
 * Select jokes to fill a target duration using a greedy approach.
 * Prioritizes jokes by score (rating if preferred) while fitting within duration.
 */
export function selectByDuration(
  jokes: Joke[],
  targetSeconds: number,
  preferHigherRating: boolean
): Joke[] {
  // Score and sort jokes
  const scoredJokes = jokes.map(joke => ({
    joke,
    score: scoreJoke(joke, preferHigherRating)
  }));

  scoredJokes.sort((a, b) => b.score - a.score);

  const selected: Joke[] = [];
  let currentDuration = 0;

  for (const { joke } of scoredJokes) {
    const jokeDuration = joke.duration || 0;

    // Skip jokes with no duration in duration mode
    if (jokeDuration === 0) continue;

    // Check if adding this joke would exceed target by too much
    // Allow slight overage (within 30 seconds) to get closer to target
    if (currentDuration + jokeDuration <= targetSeconds + 30) {
      selected.push(joke);
      currentDuration += jokeDuration;

      // Stop if we've reached or exceeded target
      if (currentDuration >= targetSeconds) {
        break;
      }
    }
  }

  return selected;
}

/**
 * Select a specific number of jokes, prioritized by score.
 */
export function selectByQuantity(
  jokes: Joke[],
  count: number,
  preferHigherRating: boolean
): Joke[] {
  // Score and sort jokes
  const scoredJokes = jokes.map(joke => ({
    joke,
    score: scoreJoke(joke, preferHigherRating)
  }));

  scoredJokes.sort((a, b) => b.score - a.score);

  return scoredJokes.slice(0, count).map(item => item.joke);
}

/**
 * Group jokes by similar tags for thematic flow.
 * Jokes with overlapping tags will be placed adjacent to each other.
 */
export function groupByTags(jokes: Joke[]): Joke[] {
  if (jokes.length <= 1) {
    return jokes;
  }

  const result: Joke[] = [];
  const remaining = new Set(jokes.map(j => j.id));

  // Start with the first joke
  const firstJoke = jokes[0];
  result.push(firstJoke);
  remaining.delete(firstJoke.id);

  // Greedily select the most similar joke to the last one added
  while (remaining.size > 0) {
    const lastJoke = result[result.length - 1];
    const lastTags = new Set(lastJoke.tags);

    let bestMatch: Joke | null = null;
    let bestScore = -1;

    for (const joke of jokes) {
      if (!remaining.has(joke.id)) continue;

      // Score based on tag overlap
      const overlap = joke.tags.filter(tag => lastTags.has(tag)).length;
      const totalTags = new Set([...lastJoke.tags, ...joke.tags]).size;
      const score = totalTags > 0 ? overlap / totalTags : 0;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = joke;
      }
    }

    if (bestMatch) {
      result.push(bestMatch);
      remaining.delete(bestMatch.id);
    }
  }

  return result;
}

/**
 * Calculate statistics for a list of jokes.
 */
function calculateStats(jokes: Joke[]): { totalDuration: number; averageRating: number } {
  const totalDuration = jokes.reduce((sum, joke) => sum + (joke.duration || 0), 0);

  const ratedJokes = jokes.filter(joke => joke.rating != null && joke.rating > 0);
  const averageRating = ratedJokes.length > 0
    ? ratedJokes.reduce((sum, joke) => sum + (joke.rating || 0), 0) / ratedJokes.length
    : 0;

  return { totalDuration, averageRating };
}

/**
 * Main entry point for generating setlist suggestions.
 */
export function suggest(jokes: Joke[], config: SuggestionConfig): SuggestionResult {
  // Step 1: Filter by tags
  let filtered = filterByTags(jokes, config.filterTagIds);

  // Step 2: Select jokes based on mode
  let selected: Joke[];
  if (config.mode === 'duration') {
    selected = selectByDuration(filtered, config.targetDuration, config.preferHigherRating);
  } else {
    selected = selectByQuantity(filtered, config.targetQuantity, config.preferHigherRating);
  }

  // Step 3: Group by tags if enabled
  if (config.groupByTags) {
    selected = groupByTags(selected);
  }

  // Step 4: Calculate statistics
  const { totalDuration, averageRating } = calculateStats(selected);

  return {
    jokes: selected,
    totalDuration,
    averageRating
  };
}

/**
 * Get default configuration for the suggester.
 */
export function getDefaultConfig(): SuggestionConfig {
  return {
    mode: 'duration',
    targetDuration: 15 * 60, // 15 minutes
    targetQuantity: 10,
    filterTagIds: [],
    preferHigherRating: false,
    groupByTags: true
  };
}
