import React, { useState, useEffect } from "react";
import type { Joke, Tag } from "../../types";
import { TagSelector } from "../TagSelector";
import styles from "./JokeForm.module.css";

interface JokeFormProps {
  joke?: Joke;
  availableTags: Tag[];
  onSubmit: (joke: {
    name: string;
    content: string;
    rating: number;
    duration: number;
    tags: string[];
  }) => void;
  onCancel: () => void;
  onCreateTag?: (tag: { name: string; color: string }) => void;
}

export const JokeForm: React.FC<JokeFormProps> = ({
  joke,
  availableTags,
  onSubmit,
  onCancel,
  onCreateTag,
}) => {
  const [formData, setFormData] = useState({
    name: joke?.name || "",
    content: joke?.content || "",
    rating: joke?.rating || 3,
    duration: joke?.duration || 2,
    tags: joke?.tags || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (joke) {
      setFormData({
        name: joke.name,
        content: joke.content || "",
        rating: joke.rating,
        duration: joke.duration,
        tags: joke.tags,
      });
    }
  }, [joke]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Joke name is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Joke content is required";
    }

    if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 1 and 5";
    }

    if (formData.duration < 1) {
      newErrors.duration = "Duration must be at least 1 minute";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTagsChange = (tagIds: string[]) => {
    setFormData((prev) => ({ ...prev, tags: tagIds }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{joke ? "Edit Joke" : "Add New Joke"}</h2>

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Joke Name *
        </label>
        <input
          type="text"
          id="name"
          className={`${styles.input} ${errors.name ? styles.error : ""}`}
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter joke name"
        />
        {errors.name && (
          <span className={styles.errorMessage}>{errors.name}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="content" className={styles.label}>
          Joke Content *
        </label>
        <textarea
          id="content"
          className={`${styles.textarea} ${errors.content ? styles.error : ""}`}
          value={formData.content}
          onChange={(e) => handleInputChange("content", e.target.value)}
          placeholder="Enter joke content"
          rows={6}
        />
        {errors.content && (
          <span className={styles.errorMessage}>{errors.content}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tags</label>
        <TagSelector
          availableTags={availableTags}
          selectedTagIds={formData.tags}
          onTagsChange={handleTagsChange}
          onCreateTag={onCreateTag}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="rating" className={styles.label}>
            Rating
          </label>
          <input
            type="number"
            id="rating"
            min="1"
            max="5"
            className={`${styles.input} ${errors.rating ? styles.error : ""}`}
            value={formData.rating}
            onChange={(e) =>
              handleInputChange("rating", parseInt(e.target.value))
            }
          />
          {errors.rating && (
            <span className={styles.errorMessage}>{errors.rating}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="duration" className={styles.label}>
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            min="1"
            className={`${styles.input} ${errors.duration ? styles.error : ""}`}
            value={formData.duration}
            onChange={(e) =>
              handleInputChange("duration", parseInt(e.target.value))
            }
          />
          {errors.duration && (
            <span className={styles.errorMessage}>{errors.duration}</span>
          )}
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn}>
          {joke ? "Update Joke" : "Add Joke"}
        </button>
      </div>
    </form>
  );
};
