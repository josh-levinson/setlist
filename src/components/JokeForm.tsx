import { useState, useEffect } from 'react';
import type { Joke, Tag } from '../types';
import { TagSelector } from './TagSelector';

interface JokeFormProps {
  joke?: Joke;
  availableTags: Tag[];
  onSubmit: (joke: Omit<Joke, 'id'>) => void;
  onCancel: () => void;
  onCreateTag?: (tag: Omit<Tag, 'id'>) => void;
}

export function JokeForm({ joke, availableTags, onSubmit, onCancel, onCreateTag }: JokeFormProps) {
  const [name, setName] = useState(joke?.name || '');
  const [content, setContent] = useState(joke?.content || '');
  const [rating, setRating] = useState(joke?.rating || 0);
  const [duration, setDuration] = useState(joke?.duration || 1);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(joke?.tags || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (joke) {
      setName(joke.name);
      setContent(joke.content || '');
      setRating(joke.rating);
      setDuration(joke.duration);
      setSelectedTagIds(joke.tags || []);
    }
  }, [joke]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (rating < 0 || rating > 10) {
      newErrors.rating = 'Rating must be between 0 and 10';
    }

    if (duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: name.trim(),
        content: content.trim() || undefined,
        rating,
        duration,
        tags: selectedTagIds
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="joke-form">
      <h2>{joke ? 'Edit Joke' : 'Create New Joke'}</h2>
      
      <div className="form-group">
        <label htmlFor="name">Joke Name *</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="content">Content (optional)</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Enter your joke content here..."
        />
      </div>

      <div className="form-group">
        <label>Tags</label>
        <TagSelector
          availableTags={availableTags}
          selectedTagIds={selectedTagIds}
          onTagsChange={setSelectedTagIds}
          onCreateTag={onCreateTag}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="rating">Rating (0-10)</label>
          <input
            type="number"
            id="rating"
            min="0"
            max="10"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
            className={errors.rating ? 'error' : ''}
          />
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            min="0.1"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
            className={errors.duration ? 'error' : ''}
          />
          {errors.duration && <span className="error-message">{errors.duration}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {joke ? 'Update Joke' : 'Create Joke'}
        </button>
      </div>
    </form>
  );
} 