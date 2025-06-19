import React from 'react';
import type { Joke } from '../../types';
import styles from './JokeCard.module.css';

interface JokeCardProps {
  joke: Joke;
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onClick: (joke: Joke) => void;
}

export const JokeCard: React.FC<JokeCardProps> = ({ joke, onEdit, onDelete, onClick }) => {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${styles.star} ${i < rating ? styles.filled : ''}`}>
        ★
      </span>
    ));
  };

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
      
      {joke.tags && joke.tags.length > 0 && (
        <div className={styles.tags}>
          {joke.tags.map((tagId) => (
            <span key={tagId} className={styles.tag}>
              {tagId}
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
          <span className={styles.value}>{joke.duration}s</span>
        </div>
      </div>
    </div>
  );
}; 