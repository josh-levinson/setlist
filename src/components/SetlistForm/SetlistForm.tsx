import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Setlist, Joke, Tag } from "../../types";
import styles from "./SetlistForm.module.css";
import shared from "../../styles/shared.module.css";

interface SetlistFormProps {
  setlist?: Setlist;
  availableJokes: Joke[];
  availableTags: Tag[];
  onSubmit: (
    setlistData: Omit<Setlist, "id" | "user_id" | "created_at" | "updated_at">
  ) => void;
  onCancel: () => void;
}

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

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.sortableJokeItem}
      {...attributes}
      {...listeners}
    >
      <div className={styles.dragHandle}>⋮⋮</div>
      <div className={styles.jokeNumber}>{index + 1}</div>
      <div className={styles.jokeInfo}>
        <span className={styles.jokeName}>{joke.name}</span>
        <div className={styles.jokeDetails}>
          <span className={styles.rating}>★ {joke.rating || 'N/A'}</span>
          <span className={styles.duration}>
            {formatDuration(joke.duration)}
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
        onClick={() => onRemove(joke.id)}
        className={styles.removeButton}
        title="Remove joke"
      >
        ×
      </button>
    </div>
  );
};

export const SetlistForm: React.FC<SetlistFormProps> = ({
  setlist,
  availableJokes,
  availableTags,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(setlist?.name || "");
  const [selectedJokeIds, setSelectedJokeIds] = useState<string[]>(
    setlist?.jokes.map((joke) => joke.id) || []
  );
  const [searchTerm, setSearchTerm] = useState("");

  const isEditing = !!setlist;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredJokes = availableJokes.filter(
    (joke) =>
      !selectedJokeIds.includes(joke.id) &&
      (joke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        joke.content?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedJokes = availableJokes.filter((joke) =>
    selectedJokeIds.includes(joke.id)
  );

  const totalDuration = selectedJokes.reduce(
    (sum, joke) => sum + (joke.duration || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a setlist name");
      return;
    }

    if (selectedJokeIds.length === 0) {
      alert("Please select at least one joke");
      return;
    }

    const setlistData: Omit<
      Setlist,
      "id" | "user_id" | "created_at" | "updated_at"
    > = {
      name: name.trim(),
      jokes: selectedJokes,
    };

    onSubmit(setlistData);
  };

  const addJoke = (jokeId: string) => {
    setSelectedJokeIds((prev) => [...prev, jokeId]);
  };

  const removeJoke = (jokeId: string) => {
    setSelectedJokeIds((prev) => prev.filter((id) => id !== jokeId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedJokeIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={styles.setlistForm}>
      <div className={styles.header}>
        <h2>{isEditing ? "Edit Setlist" : "Create New Setlist"}</h2>
        <p className={styles.subtitle}>
          {isEditing
            ? "Update your setlist details"
            : "Organize your jokes into a setlist"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <label htmlFor="name" className={styles.label}>
            Setlist Name *
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            placeholder="Enter setlist name..."
            required
          />
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.label}>
              Selected Jokes ({selectedJokes.length})
            </label>
            {selectedJokes.length > 0 && (
              <span className={styles.totalDuration}>
                Total Duration: {formatDuration(totalDuration)}
              </span>
            )}
          </div>

          {selectedJokes.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No jokes selected yet</p>
              <p className={styles.emptyHint}>Search and add jokes below</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedJokeIds}
                strategy={verticalListSortingStrategy}
              >
                <div className={styles.selectedJokesList}>
                  {selectedJokes.map((joke, index) => (
                    <SortableJokeItem
                      key={joke.id}
                      joke={joke}
                      index={index}
                      onRemove={removeJoke}
                      availableTags={availableTags}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className={styles.formSection}>
          <div className={styles.sectionHeader}>
            <label className={styles.label}>Available Jokes</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              placeholder="Search jokes..."
            />
          </div>

          {filteredJokes.length === 0 ? (
            <div className={styles.emptyState}>
              {searchTerm ? "No jokes found matching your search" : "All jokes have been added to the setlist"}
            </div>
          ) : (
            <div className={styles.availableJokesList}>
              {filteredJokes.map((joke) => (
                <div key={joke.id} className={styles.availableJokeItem}>
                  <div className={styles.jokeInfo}>
                    <span className={styles.jokeName}>{joke.name}</span>
                    <div className={styles.jokeDetails}>
                      <span className={styles.rating}>★ {joke.rating || 'N/A'}</span>
                      <span className={styles.duration}>
                        {formatDuration(joke.duration)}
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
                    onClick={() => addJoke(joke.id)}
                    className={styles.addButton}
                    title="Add joke to setlist"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={`${shared.btn} ${shared.btnSecondary}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${shared.btn} ${shared.btnPrimary}`}
          >
            {isEditing ? "Update Setlist" : "Create Setlist"}
          </button>
        </div>
      </form>
    </div>
  );
};
