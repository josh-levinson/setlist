import { useState } from 'react'
import type { Joke, Tag } from './types'
import { JokeForm, JokeList, JokeViewer } from './components'
import { dummyJokes } from './data/dummyData'
import styles from './App.module.css'
import shared from './styles/shared.module.css'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

// Sample tags for demonstration
const sampleTags: Tag[] = [
  { id: '1', name: 'Clean', color: '#10B981' },
  { id: '2', name: 'Dark', color: '#6B7280' },
  { id: '3', name: 'Political', color: '#EF4444' },
  { id: '4', name: 'Observational', color: '#3B82F6' },
  { id: '5', name: 'Story', color: '#8B5CF6' },
  { id: '6', name: 'One-liner', color: '#F59E0B' },
];

function App() {
  const [jokes, setJokes] = useState<Joke[]>(dummyJokes.map(joke => ({ ...joke, tags: [] })))
  const [tags, setTags] = useState<Tag[]>(sampleTags)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedJoke, setSelectedJoke] = useState<Joke | null>(null)

  const handleCreateJoke = (jokeData: Omit<Joke, 'id'>) => {
    const newJoke: Joke = {
      ...jokeData,
      id: Date.now().toString()
    }
    setJokes(prev => [...prev, newJoke])
    setViewMode('list')
  }

  const handleEditJoke = (jokeData: Omit<Joke, 'id'>) => {
    if (!selectedJoke) return
    
    const updatedJoke: Joke = {
      ...jokeData,
      id: selectedJoke.id
    }
    
    setJokes(prev => prev.map(joke => 
      joke.id === selectedJoke.id ? updatedJoke : joke
    ))
    setViewMode('list')
    setSelectedJoke(null)
  }

  const handleDeleteJoke = (id: string) => {
    setJokes(prev => prev.filter(joke => joke.id !== id))
  }

  const handleViewJoke = (joke: Joke) => {
    setSelectedJoke(joke)
    setViewMode('view')
  }

  const handleEditClick = (joke: Joke) => {
    setSelectedJoke(joke)
    setViewMode('edit')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedJoke(null)
  }

  const handleCreateNew = () => {
    setSelectedJoke(null)
    setViewMode('create')
  }

  const handleCreateTag = (tagData: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tagData,
      id: Date.now().toString()
    }
    setTags(prev => [...prev, newTag])
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎭 Comedy Setlist Manager</h1>
        {viewMode === 'list' && (
          <button onClick={handleCreateNew} className={shared.btnPrimary}>
            + Add New Joke
          </button>
        )}
      </header>

      <main className={styles.main}>
        {viewMode === 'list' && (
          <JokeList
            jokes={jokes}
            availableTags={tags}
            onEdit={handleEditClick}
            onDelete={handleDeleteJoke}
            onView={handleViewJoke}
          />
        )}

        {viewMode === 'create' && (
          <JokeForm
            availableTags={tags}
            onSubmit={handleCreateJoke}
            onCancel={handleBackToList}
            onCreateTag={handleCreateTag}
          />
        )}

        {viewMode === 'edit' && selectedJoke && (
          <JokeForm
            joke={selectedJoke}
            availableTags={tags}
            onSubmit={handleEditJoke}
            onCancel={handleBackToList}
            onCreateTag={handleCreateTag}
          />
        )}

        {viewMode === 'view' && selectedJoke && (
          <JokeViewer
            joke={selectedJoke}
            availableTags={tags}
            onEdit={handleEditClick}
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  )
}

export default App
