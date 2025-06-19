import { useState } from 'react'
import type { Joke } from './types'
import { JokeForm } from './components/JokeForm'
import { JokeList } from './components/JokeList'
import { JokeViewer } from './components/JokeViewer'
import { dummyJokes } from './data/dummyData'
import './App.css'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

function App() {
  const [jokes, setJokes] = useState<Joke[]>(dummyJokes)
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎭 Comedy Setlist Manager</h1>
        {viewMode === 'list' && (
          <button onClick={handleCreateNew} className="btn-primary">
            + Add New Joke
          </button>
        )}
      </header>

      <main className="app-main">
        {viewMode === 'list' && (
          <JokeList
            jokes={jokes}
            onEdit={handleEditClick}
            onDelete={handleDeleteJoke}
            onView={handleViewJoke}
          />
        )}

        {viewMode === 'create' && (
          <JokeForm
            onSubmit={handleCreateJoke}
            onCancel={handleBackToList}
          />
        )}

        {viewMode === 'edit' && selectedJoke && (
          <JokeForm
            joke={selectedJoke}
            onSubmit={handleEditJoke}
            onCancel={handleBackToList}
          />
        )}

        {viewMode === 'view' && selectedJoke && (
          <JokeViewer
            joke={selectedJoke}
            onEdit={handleEditClick}
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  )
}

export default App
