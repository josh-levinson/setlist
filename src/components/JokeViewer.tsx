import type { Joke } from '../types';

interface JokeViewerProps {
  joke: Joke;
  onEdit: (joke: Joke) => void;
  onBack: () => void;
}

export function JokeViewer({ joke, onEdit, onBack }: JokeViewerProps) {
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