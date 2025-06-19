import React from 'react';
import type { Setlist, Tag } from '../../types';
import styles from './SetlistViewer.module.css';
import shared from '../../styles/shared.module.css';

interface SetlistViewerProps {
  setlist: Setlist;
  availableTags: Tag[];
  onEdit: (setlist: Setlist) => void;
  onBack: () => void;
}

export const SetlistViewer: React.FC<SetlistViewerProps> = ({
  setlist,
  availableTags,
  onEdit,
  onBack
}) => {
  const getTagById = (tagId: string) => {
    return availableTags.find(tag => tag.id === tagId);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const averageRating = setlist.jokes.length > 0
    ? (setlist.jokes.reduce((sum, joke) => sum + joke.rating, 0) / setlist.jokes.length).toFixed(1)
    : '0.0';

  return (
    <div className={styles.setlistViewer}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Setlists
        </button>
        <div className={styles.headerActions}>
          <button onClick={() => onEdit(setlist)} className={`${shared.btn} ${shared.btnPrimary}`}>
            Edit Setlist
          </button>
        </div>
      </div>

      <div className={styles.setlistInfo}>
        <h1 className={styles.setlistName}>{setlist.name}</h1>
        <div className={styles.setlistStats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Jokes</span>
            <span className={styles.statValue}>{setlist.jokes.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Duration</span>
            <span className={styles.statValue}>{formatDuration(setlist.totalDuration)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Avg Rating</span>
            <span className={styles.statValue}>★ {averageRating}</span>
          </div>
        </div>
      </div>

      <div className={styles.jokesSection}>
        <h2 className={styles.sectionTitle}>Jokes in Setlist</h2>
        {setlist.jokes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No jokes in this setlist yet.</p>
          </div>
        ) : (
          <div className={styles.jokesList}>
            {setlist.jokes.map((joke, index) => (
              <div key={joke.id} className={styles.jokeItem}>
                <div className={styles.jokeNumber}>
                  {index + 1}
                </div>
                <div className={styles.jokeContent}>
                  <div className={styles.jokeHeader}>
                    <h3 className={styles.jokeName}>{joke.name}</h3>
                    <div className={styles.jokeMeta}>
                      <span className={styles.rating}>★ {joke.rating}</span>
                      <span className={styles.duration}>{formatDuration(joke.duration)}</span>
                    </div>
                  </div>
                  {joke.content && (
                    <p className={styles.jokeText}>{joke.content}</p>
                  )}
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
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Duration:</span>
          <span className={styles.summaryValue}>{formatDuration(setlist.totalDuration)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Average Rating:</span>
          <span className={styles.summaryValue}>★ {averageRating}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Joke Count:</span>
          <span className={styles.summaryValue}>{setlist.jokes.length}</span>
        </div>
      </div>
    </div>
  );
}; 