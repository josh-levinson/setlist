import { useState } from 'react';
import type { Tag } from '../types';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag?: (tag: Omit<Tag, 'id'>) => void;
}

export function TagSelector({ 
  availableTags, 
  selectedTagIds, 
  onTagsChange, 
  onCreateTag 
}: TagSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagsChange(newSelectedTags);
  };

  const handleCreateTag = () => {
    if (newTagName.trim() && onCreateTag) {
      onCreateTag({
        name: newTagName.trim(),
        color: newTagColor
      });
      setNewTagName('');
      setNewTagColor('#3B82F6');
      setShowCreateForm(false);
    }
  };

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id));
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id));

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <button
            key={tag.id}
            className="tag selected"
            style={{ backgroundColor: tag.color }}
            onClick={() => handleTagToggle(tag.id)}
            title={`Remove ${tag.name}`}
          >
            {tag.name} ×
          </button>
        ))}
      </div>

      {unselectedTags.length > 0 && (
        <div className="available-tags">
          <span className="label">Available tags:</span>
          {unselectedTags.map(tag => (
            <button
              key={tag.id}
              className="tag available"
              style={{ backgroundColor: tag.color }}
              onClick={() => handleTagToggle(tag.id)}
              title={`Add ${tag.name}`}
            >
              {tag.name} +
            </button>
          ))}
        </div>
      )}

      {onCreateTag && (
        <div className="create-tag-section">
          {!showCreateForm ? (
            <button
              className="btn-secondary small"
              onClick={() => setShowCreateForm(true)}
            >
              + Create New Tag
            </button>
          ) : (
            <div className="create-tag-form">
              <input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="tag-name-input"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="tag-color-input"
                title="Choose tag color"
              />
              <button
                className="btn-primary small"
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
              >
                Create
              </button>
              <button
                className="btn-secondary small"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 