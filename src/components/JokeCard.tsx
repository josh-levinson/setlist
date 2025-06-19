import type { Joke } from '../types';

interface JokeCardProps {
  joke: Joke;
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onView: (joke: Joke) => void;
}

export function JokeCard({ joke, onEdit, onDelete, onView }: JokeCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this joke?')) {
      onDelete(joke.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(joke);
  };

  return (
    <div className="joke-card" onClick={() => onView(joke)}>
      <div className="joke-header">
        <h3 className="joke-name">{joke.name}</h3>
        <div className="joke-actions">
          <button 
            onClick={handleEdit} 
            className="btn-edit"
            title="Edit joke"
          >
            ✏️
          </button>
          <button 
            onClick={handleDelete} 
            className="btn-delete"
            title="Delete joke"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {joke.content && (
        <div className="joke-content">
          <p>{joke.content}</p>
        </div>
      )}
      
      <div className="joke-meta">
        <div className="joke-rating">
          <span className="label">Rating:</span>
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
        
        <div className="joke-duration">
          <span className="label">Duration:</span>
          <span className="duration-value">{joke.duration} min</span>
        </div>
      </div>
    </div>
  );
} 