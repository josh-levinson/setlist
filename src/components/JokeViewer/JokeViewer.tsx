import type { Joke, Tag } from '../../types';
import { formatSecondsToMMSS } from '../../utils/duration';
import styles from './JokeViewer.module.css';
import shared from '../../styles/shared.module.css';

interface JokeViewerProps {
  joke: Joke;
  availableTags: Tag[];
  onEdit: (joke: Joke) => void;
  onBack: () => void;
}

export function JokeViewer({ joke, availableTags, onEdit, onBack }: JokeViewerProps) {
  const jokeTags = availableTags.filter(tag => joke.tags.includes(tag.id));

  const renderStars = (rating?: number) => {
    if (!rating) return <span className={styles.noRating}>No rating</span>;
    return Array.from({ length: 10 }, (_, i) => (
      <span 
        key={i} 
        className={`${styles.star} ${i < Math.floor(rating) ? styles.filled : ''}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className={`${styles.viewer} ${shared.container}`}>
      <div className={styles.header}>
        <button onClick={onBack} className={shared.btnBack}>
          ← Back to List
        </button>
        <button onClick={() => onEdit(joke)} className={styles.editBtn}>
          Edit Joke
        </button>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>{joke.name}</h1>
        
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Rating:</span>
            <div className={styles.ratingDisplay}>
              {joke.rating ? (
                <>
                  <span className={styles.ratingValue}>{joke.rating.toFixed(1)}/10</span>
                  <div className={styles.ratingStars}>
                    {renderStars(joke.rating)}
                  </div>
                </>
              ) : (
                <span className={styles.noRating}>No rating</span>
              )}
            </div>
          </div>
          
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Duration:</span>
            <span className={styles.durationValue}>
              {joke.duration ? formatSecondsToMMSS(joke.duration) : 'No duration'}
            </span>
          </div>
        </div>

        {jokeTags.length > 0 && (
          <div className={styles.tagsSection}>
            <h3 className={styles.sectionTitle}>Tags</h3>
            <div className={styles.tags}>
              {jokeTags.map(tag => (
                <span
                  key={tag.id}
                  className={shared.tag}
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {joke.content && (
          <div className={styles.contentSection}>
            <h3 className={styles.sectionTitle}>Content</h3>
            <div className={styles.contentText}>
              {joke.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={() => onEdit(joke)} className={shared.btnPrimary}>
            Edit Joke
          </button>
        </div>
      </div>
    </div>
  );
} 