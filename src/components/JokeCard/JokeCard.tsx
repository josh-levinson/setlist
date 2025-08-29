import React from 'react';
import type { Joke, Tag } from '../../types';
import styles from './JokeCard.module.css';

interface JokeCardProps {
  joke: Joke;
  availableTags: Tag[];
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onClick: (joke: Joke) => void;
}

export const JokeCard: React.FC<JokeCardProps> = ({ joke, availableTags, onEdit, onDelete, onClick }) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(joke);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(joke.id);
  };

  const handleClick = () => {
    onClick(joke);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className={styles.noRating}>No rating</span>;
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${styles.star} ${i < rating ? styles.filled : ''}`}>
        ★
      </span>
    ));
  };

  // Filter available tags to get the ones associated with this joke
  const jokeTags = availableTags.filter(tag => joke.tags.includes(tag.id));

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        <h3 className={styles.name}>{joke.name}</h3>
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={handleEdit}>
            ✏️
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            🗑️
          </button>
        </div>
      </div>
      
      <div className={styles.content}>
        {joke.content?.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      
      {jokeTags.length > 0 && (
        <div className={styles.tags}>
          {jokeTags.map((tag) => (
            <span 
              key={tag.id} 
              className={styles.tag}
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
      
      <div className={styles.meta}>
        <div className={styles.rating}>
          <span className={styles.label}>Rating:</span>
          <div className={styles.stars}>
            {renderStars(joke.rating)}
          </div>
        </div>
        <div className={styles.duration}>
          <span className={styles.label}>Duration:</span>
          <span className={styles.value}>
            {joke.duration ? `${joke.duration}m` : 'No duration'}
          </span>
        </div>
      </div>
    </div>
  );
}; 