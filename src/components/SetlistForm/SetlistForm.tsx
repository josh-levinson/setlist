import React, { useState } from "react";
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

  const filteredJokes = availableJokes.filter(
    (joke) =>
      joke.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      joke.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedJokes = availableJokes.filter((joke) =>
    selectedJokeIds.includes(joke.id)
  );

  const totalDuration = selectedJokes.reduce(
    (sum, joke) => sum + joke.duration,
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

  const toggleJokeSelection = (jokeId: string) => {
    setSelectedJokeIds((prev) =>
      prev.includes(jokeId)
        ? prev.filter((id) => id !== jokeId)
        : [...prev, jokeId]
    );
  };

  const moveJokeUp = (index: number) => {
    if (index === 0) return;
    const newSelectedJokeIds = [...selectedJokeIds];
    [newSelectedJokeIds[index], newSelectedJokeIds[index - 1]] = [
      newSelectedJokeIds[index - 1],
      newSelectedJokeIds[index],
    ];
    setSelectedJokeIds(newSelectedJokeIds);
  };

  const moveJokeDown = (index: number) => {
    if (index === selectedJokeIds.length - 1) return;
    const newSelectedJokeIds = [...selectedJokeIds];
    [newSelectedJokeIds[index], newSelectedJokeIds[index + 1]] = [
      newSelectedJokeIds[index + 1],
      newSelectedJokeIds[index],
    ];
    setSelectedJokeIds(newSelectedJokeIds);
  };

  const removeJoke = (jokeId: string) => {
    setSelectedJokeIds((prev) => prev.filter((id) => id !== jokeId));
  };

  const formatDuration = (minutes: number) => {
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
          <label className={styles.label}>
            Selected Jokes ({selectedJokes.length})
          </label>
          <div className={styles.selectedJokes}>
            {selectedJokes.length === 0 ? (
              <p className={styles.emptyMessage}>No jokes selected yet</p>
            ) : (
              selectedJokes.map((joke, index) => (
                <div key={joke.id} className={styles.selectedJoke}>
                  <div className={styles.jokeInfo}>
                    <span className={styles.jokeName}>{joke.name}</span>
                    <div className={styles.jokeDetails}>
                      <span className={styles.rating}>★ {joke.rating}</span>
                      <span className={styles.duration}>
                        {formatDuration(joke.duration)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.jokeActions}>
                    <button
                      type="button"
                      onClick={() => moveJokeUp(index)}
                      disabled={index === 0}
                      className={styles.moveButton}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveJokeDown(index)}
                      disabled={index === selectedJokes.length - 1}
                      className={styles.moveButton}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeJoke(joke.id)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {selectedJokes.length > 0 && (
            <div className={styles.totalDuration}>
              Total Duration: {formatDuration(totalDuration)}
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <label className={styles.label}>Available Jokes</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            placeholder="Search jokes..."
          />
          <div className={styles.availableJokes}>
            {filteredJokes.map((joke) => (
              <div
                key={joke.id}
                className={`${styles.availableJoke} ${
                  selectedJokeIds.includes(joke.id) ? styles.selected : ""
                }`}
                onClick={() => toggleJokeSelection(joke.id)}
              >
                <div className={styles.jokeInfo}>
                  <span className={styles.jokeName}>{joke.name}</span>
                  <div className={styles.jokeDetails}>
                    <span className={styles.rating}>★ {joke.rating}</span>
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
              </div>
            ))}
          </div>
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
