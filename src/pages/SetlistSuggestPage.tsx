import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from '../contexts/AuthContext';
import { jokeService, tagService, setlistService } from '../services/dataService';
import { suggest, getDefaultConfig } from '../utils/SetlistSuggester';
import type { SuggestionConfig } from '../utils/SetlistSuggester';
import { formatSecondsToMMSS, parseMMSSToSeconds } from '../utils/duration';
import type { Joke, Tag } from '../types';
import pageStyles from './Pages.module.css';
import styles from './SetlistSuggestPage.module.css';
import shared from '../styles/shared.module.css';

// Sortable joke item component
const SortableJokeItem: React.FC<{
  joke: Joke;
  index: number;
  onRemove: (jokeId: string) => void;
  availableTags: Tag[];
}> = ({ joke, index, onRemove, availableTags }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: joke.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.jokeItem}
      {...attributes}
      {...listeners}
    >
      <div className={styles.dragHandle}>⋮⋮</div>
      <div className={styles.jokeNumber}>{index + 1}</div>
      <div className={styles.jokeInfo}>
        <span className={styles.jokeName}>{joke.name}</span>
        <div className={styles.jokeDetails}>
          <span className={styles.rating}>
            {'★'.repeat(joke.rating || 0)}{'☆'.repeat(5 - (joke.rating || 0))}
          </span>
          <span className={styles.duration}>
            {formatSecondsToMMSS(joke.duration || 0)}
          </span>
        </div>
      </div>
      <div className={styles.jokeTags}>
        {joke.tags.map((tagId) => {
          const tag = availableTags.find((t) => t.id === tagId);
          return tag ? (
            <span
              key={tagId}
              className={styles.tag}
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ) : null;
        })}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(joke.id);
        }}
        className={styles.removeButton}
        title="Remove joke"
      >
        ×
      </button>
    </div>
  );
};

// Duration presets in seconds
const DURATION_PRESETS = [
  { label: '5m', value: 5 * 60 },
  { label: '10m', value: 10 * 60 },
  { label: '15m', value: 15 * 60 },
  { label: '30m', value: 30 * 60 },
  { label: '45m', value: 45 * 60 },
];

export function SetlistSuggestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data state
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration state
  const [config, setConfig] = useState<SuggestionConfig>(getDefaultConfig());
  const [durationInput, setDurationInput] = useState('15:00');

  // Results state
  const [suggestedJokes, setSuggestedJokes] = useState<Joke[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Save state
  const [setlistName, setSetlistName] = useState('');
  const [saving, setSaving] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [jokesData, tagsData] = await Promise.all([
        jokeService.getJokes(user.id),
        tagService.getTags(user.id),
      ]);

      setJokes(jokesData);
      setTags(tagsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle configuration changes
  const handleModeChange = (mode: 'duration' | 'quantity') => {
    setConfig(prev => ({ ...prev, mode }));
  };

  const handleDurationInputChange = (value: string) => {
    setDurationInput(value);
    try {
      const seconds = parseMMSSToSeconds(value);
      setConfig(prev => ({ ...prev, targetDuration: seconds }));
    } catch {
      // Invalid input, keep previous value
    }
  };

  const handlePresetClick = (seconds: number) => {
    setConfig(prev => ({ ...prev, targetDuration: seconds }));
    setDurationInput(formatSecondsToMMSS(seconds));
  };

  const handleQuantityChange = (value: string) => {
    const quantity = parseInt(value, 10) || 1;
    setConfig(prev => ({ ...prev, targetQuantity: Math.max(1, quantity) }));
  };

  const handleTagFilterChange = (tagId: string) => {
    if (tagId && !config.filterTagIds.includes(tagId)) {
      setConfig(prev => ({
        ...prev,
        filterTagIds: [...prev.filterTagIds, tagId],
      }));
    }
  };

  const handleRemoveTagFilter = (tagId: string) => {
    setConfig(prev => ({
      ...prev,
      filterTagIds: prev.filterTagIds.filter(id => id !== tagId),
    }));
  };

  const handleOptionChange = (option: 'preferHigherRating' | 'groupByTags', value: boolean) => {
    setConfig(prev => ({ ...prev, [option]: value }));
  };

  // Generate suggestions
  const handleGenerate = () => {
    const result = suggest(jokes, config);
    setSuggestedJokes(result.jokes);
    setTotalDuration(result.totalDuration);
    setAverageRating(result.averageRating);
    setHasGenerated(true);
    setSetlistName('');
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSuggestedJokes(items => {
        const oldIndex = items.findIndex(j => j.id === active.id);
        const newIndex = items.findIndex(j => j.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Remove joke from results
  const handleRemoveJoke = (jokeId: string) => {
    setSuggestedJokes(prev => {
      const newJokes = prev.filter(j => j.id !== jokeId);
      // Recalculate stats
      const newDuration = newJokes.reduce((sum, j) => sum + (j.duration || 0), 0);
      const ratedJokes = newJokes.filter(j => j.rating != null && j.rating > 0);
      const newAvgRating = ratedJokes.length > 0
        ? ratedJokes.reduce((sum, j) => sum + (j.rating || 0), 0) / ratedJokes.length
        : 0;
      setTotalDuration(newDuration);
      setAverageRating(newAvgRating);
      return newJokes;
    });
  };

  // Save as setlist
  const handleSaveSetlist = async () => {
    if (!user || !setlistName.trim() || suggestedJokes.length === 0) return;

    try {
      setSaving(true);
      const newSetlist = await setlistService.createSetlist({
        name: setlistName.trim(),
        user_id: user.id,
        jokes: suggestedJokes,
      });

      navigate(`/setlists/${newSetlist.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setlist');
      setSaving(false);
    }
  };

  // Get available tags for filter dropdown (excluding already selected)
  const availableTagsForFilter = tags.filter(tag => !config.filterTagIds.includes(tag.id));

  if (loading) {
    return (
      <div className={pageStyles.page}>
        <div className={pageStyles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.header}>
        <h1>Setlist Suggestion</h1>
        <button
          onClick={() => navigate('/setlists')}
          className={shared.btnSecondary}
        >
          Back to Setlists
        </button>
      </div>

      {error && (
        <div className={pageStyles.error}>
          {error}
        </div>
      )}

      {/* Configuration Section */}
      <div className={styles.configSection}>
        <h2>Configuration</h2>

        <div className={styles.configGrid}>
          {/* Mode Selection */}
          <div className={styles.configGroup}>
            <label>Selection Mode</label>
            <div className={styles.modeSelector}>
              <label className={styles.modeOption}>
                <input
                  type="radio"
                  name="mode"
                  checked={config.mode === 'duration'}
                  onChange={() => handleModeChange('duration')}
                />
                Target Duration
              </label>
              <label className={styles.modeOption}>
                <input
                  type="radio"
                  name="mode"
                  checked={config.mode === 'quantity'}
                  onChange={() => handleModeChange('quantity')}
                />
                Number of Jokes
              </label>
            </div>
          </div>

          {/* Target Input */}
          <div className={styles.configGroup}>
            <label>
              {config.mode === 'duration' ? 'Target Duration (MM:SS)' : 'Number of Jokes'}
            </label>
            {config.mode === 'duration' ? (
              <>
                <input
                  type="text"
                  value={durationInput}
                  onChange={(e) => handleDurationInputChange(e.target.value)}
                  className={styles.targetInput}
                  placeholder="15:00"
                />
                <div className={styles.presetButtons}>
                  {DURATION_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetClick(preset.value)}
                      className={`${styles.presetButton} ${config.targetDuration === preset.value ? styles.active : ''}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <input
                type="number"
                value={config.targetQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className={styles.targetInput}
                min="1"
                max={jokes.length}
              />
            )}
          </div>
        </div>

        {/* Tag Filter */}
        <div className={styles.tagFilterSection}>
          <div className={styles.configGroup}>
            <label>Filter by Tags (optional)</label>
            {config.filterTagIds.length > 0 && (
              <div className={styles.selectedTags}>
                {config.filterTagIds.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className={styles.selectedTag}
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveTagFilter(tagId)}
                        className={styles.removeTagButton}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
            {availableTagsForFilter.length > 0 && (
              <select
                value=""
                onChange={(e) => handleTagFilterChange(e.target.value)}
                className={styles.tagDropdown}
              >
                <option value="">Add tag filter...</option>
                {availableTagsForFilter.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Options */}
        <div className={styles.optionsSection}>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={config.preferHigherRating}
              onChange={(e) => handleOptionChange('preferHigherRating', e.target.checked)}
            />
            Prefer higher-rated jokes
          </label>
          <label className={styles.checkboxOption}>
            <input
              type="checkbox"
              checked={config.groupByTags}
              onChange={(e) => handleOptionChange('groupByTags', e.target.checked)}
            />
            Group by similar tags
          </label>
        </div>

        {/* Generate Button */}
        <div className={styles.generateSection}>
          <button
            onClick={handleGenerate}
            disabled={jokes.length === 0}
            className={shared.btnPrimary}
          >
            Generate Suggestions
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasGenerated && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <h2>Suggested Setlist</h2>
            <div className={styles.resultsStats}>
              <div className={styles.statItem}>
                <span>{formatSecondsToMMSS(totalDuration)}</span>
                <span> total</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{suggestedJokes.length}</span>
                <span> jokes</span>
              </div>
              <div className={styles.statItem}>
                <span>Avg rating:</span>
                <span className={styles.statValue}> {averageRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {suggestedJokes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No jokes match your criteria.</p>
              <p className={styles.emptyHint}>
                Try adjusting your filters or adding more jokes with durations.
              </p>
            </div>
          ) : (
            <>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={suggestedJokes.map(j => j.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={styles.jokeList}>
                    {suggestedJokes.map((joke, index) => (
                      <SortableJokeItem
                        key={joke.id}
                        joke={joke}
                        index={index}
                        onRemove={handleRemoveJoke}
                        availableTags={tags}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Save Section */}
              <div className={styles.saveSection}>
                <input
                  type="text"
                  value={setlistName}
                  onChange={(e) => setSetlistName(e.target.value)}
                  placeholder="Enter setlist name..."
                  className={styles.setlistNameInput}
                />
                <button
                  onClick={handleSaveSetlist}
                  disabled={!setlistName.trim() || saving}
                  className={shared.btnPrimary}
                >
                  {saving ? 'Saving...' : 'Save as Setlist'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
