import React from "react";
import type { Setlist, Joke, Tag } from "../../types";
import { calculateSetlistDuration } from "../../types";
import styles from "./SetlistList.module.css";
import shared from "../../styles/shared.module.css";

interface SetlistListProps {
  setlists: Setlist[];
  availableJokes: Joke[];
  availableTags: Tag[];
  onEdit: (setlist: Setlist) => void;
  onDelete: (id: string) => void;
  onView: (setlist: Setlist) => void;
}

export const SetlistList: React.FC<SetlistListProps> = ({
  setlists,
  availableTags,
  onEdit,
  onDelete,
  onView,
}) => {
  const getTagById = (tagId: string) => {
    return availableTags.find((tag) => tag.id === tagId);
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
    <div className={styles.setlistList}>
      <div className={styles.header}>
        <h2>Setlists</h2>
        <p className={styles.subtitle}>
          Manage your comedy setlists and organize your jokes
        </p>
      </div>

      {setlists.length === 0 ? (
        <div className={styles.emptyState}>
          <p>
            No setlists created yet. Create your first setlist to get started!
          </p>
        </div>
      ) : (
        <div className={styles.setlists}>
          {setlists.map((setlist) => (
            <div key={setlist.id} className={styles.setlistCard}>
              <div className={styles.setlistHeader}>
                <div className={styles.setlistInfo}>
                  <h3 className={styles.setlistName}>{setlist.name}</h3>
                  <div className={styles.setlistStats}>
                    <span className={styles.stat}>
                      {setlist.jokes.length} joke
                      {setlist.jokes.length !== 1 ? "s" : ""}
                    </span>
                    <span className={styles.stat}>
                      {formatDuration(calculateSetlistDuration(setlist))}
                    </span>
                  </div>
                </div>
                <div className={styles.setlistActions}>
                  <button
                    onClick={() => onView(setlist)}
                    className={`${shared.btn} ${shared.btnPrimary}`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onEdit(setlist)}
                    className={`${shared.btn} ${shared.btnSecondary}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(setlist.id)}
                    className={`${shared.btn} ${shared.btnDanger}`}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className={styles.jokesList}>
                {setlist.jokes.map((joke) => (
                  <div key={joke.id} className={styles.jokeItem}>
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
                        const tag = getTagById(tagId);
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
          ))}
        </div>
      )}
    </div>
  );
};
