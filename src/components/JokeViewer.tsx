import type { Joke, Tag } from '../types';

interface JokeViewerProps {
  joke: Joke;
  availableTags: Tag[];
  onEdit: (joke: Joke) => void;
  onBack: () => void;
}

export function JokeViewer({ joke, availableTags, onEdit, onBack }: JokeViewerProps) {
  const jokeTags = availableTags.filter(tag => joke.tags.includes(tag.id));

  return (
    <div className="joke-viewer">
      <div className="joke-viewer-header">
        <button onClick={onBack} className="btn-back">
          ← Back to List
        </button>
        <button onClick={() => onEdit(joke)} className="btn-edit">
          Edit Joke
        </button>
      </div>

      <div className="joke-viewer-content">
        <h1 className="joke-title">{joke.name}</h1>
        
        <div className="joke-meta-info">
          <div className="meta-item">
            <span className="meta-label">Rating:</span>
            <div className="rating-display">
              <span className="rating-value">{joke.rating.toFixed(1)}/10</span>
              <div className="rating-stars">
                {[...Array(10)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`star ${i < Math.floor(joke.rating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Duration:</span>
            <span className="duration-value">{joke.duration} minutes</span>
          </div>
        </div>

        {jokeTags.length > 0 && (
          <div className="joke-tags-section">
            <h3>Tags</h3>
            <div className="joke-tags">
              {jokeTags.map(tag => (
                <span
                  key={tag.id}
                  className="tag"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {joke.content && (
          <div className="joke-content-section">
            <h3>Content</h3>
            <div className="joke-content-text">
              {joke.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}

        <div className="joke-actions">
          <button onClick={() => onEdit(joke)} className="btn-primary">
            Edit Joke
          </button>
        </div>
      </div>
    </div>
  );
} 