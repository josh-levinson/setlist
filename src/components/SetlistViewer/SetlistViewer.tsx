import React, { useState } from 'react';
import type { Setlist, Tag } from '../../types';
import { calculateSetlistDuration } from '../../types';
import { formatSecondsToMMSS } from '../../utils/duration';
import { exportSetlistToCSV, exportSetlistToDocx } from '../../utils/fileExport';
import { ExportButton } from '../ExportButton';
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
  const [stageMode, setStageMode] = useState(false);
  const [stageDarkMode, setStageDarkMode] = useState(false);

  const getTagById = (tagId: string) => {
    return availableTags.find(tag => tag.id === tagId);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    return formatSecondsToMMSS(seconds);
  };

  const totalDuration = calculateSetlistDuration(setlist);
  const averageRating = setlist.jokes.length > 0
    ? (setlist.jokes.reduce((sum, joke) => sum + (joke.rating || 0), 0) / setlist.jokes.length).toFixed(1)
    : '0.0';

  const handleExportCSV = () => {
    exportSetlistToCSV(setlist, availableTags);
  };

  const handleExportDocx = () => {
    exportSetlistToDocx(setlist, availableTags);
  };

  if (stageMode) {
    const stageModeClass = stageDarkMode
      ? `${styles.stageMode} ${styles.stageModeDark}`
      : styles.stageMode;

    return (
      <div className={stageModeClass}>
        <div className={styles.stageHeader}>
          <button
            onClick={() => setStageMode(false)}
            className={styles.exitStageMode}
          >
            Exit
          </button>
          <button
            onClick={() => setStageDarkMode(!stageDarkMode)}
            className={styles.stageDarkToggle}
          >
            {stageDarkMode ? 'Light' : 'Dark'}
          </button>
        </div>
        <h1 className={styles.stageTitle}>{setlist.name}</h1>
        <ol className={styles.stageList}>
          {setlist.jokes.map((joke) => (
            <li key={joke.id} className={styles.stageItem}>
              {joke.name}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className={styles.setlistViewer}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          ← Back to Setlists
        </button>
        <div className={styles.headerActions}>
          <ExportButton
            onExportCSV={handleExportCSV}
            onExportDocx={handleExportDocx}
          />
          <button
            onClick={() => setStageMode(true)}
            className={`${shared.btn} ${shared.btnSecondary}`}
          >
            Stage Mode
          </button>
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
            <span className={styles.statValue}>{formatDuration(totalDuration)}</span>
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
                      <span className={styles.rating}>★ {joke.rating || 'N/A'}</span>
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
          <span className={styles.summaryValue}>{formatDuration(totalDuration)}</span>
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