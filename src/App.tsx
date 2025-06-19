import { useState } from 'react'
import type { Joke, Tag, Setlist } from './types'
import { JokeForm, JokeList, JokeViewer, SetlistList, SetlistForm, SetlistViewer } from './components'
import { dummyJokes, dummySetlists } from './data/dummyData'
import styles from './App.module.css'
import shared from './styles/shared.module.css'

type ViewMode = 'jokes' | 'setlists' | 'create-joke' | 'edit-joke' | 'view-joke' | 'create-setlist' | 'edit-setlist' | 'view-setlist'

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
  const [jokes, setJokes] = useState<Joke[]>(dummyJokes)
  const [setlists, setSetlists] = useState<Setlist[]>(dummySetlists)
  const [tags, setTags] = useState<Tag[]>(sampleTags)
  const [viewMode, setViewMode] = useState<ViewMode>('jokes')
  const [selectedJoke, setSelectedJoke] = useState<Joke | null>(null)
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null)

  // Joke management functions
  const handleCreateJoke = (jokeData: Omit<Joke, 'id'>) => {
    const newJoke: Joke = {
      ...jokeData,
      id: Date.now().toString()
    }
    setJokes(prev => [...prev, newJoke])
    setViewMode('jokes')
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
    setViewMode('jokes')
    setSelectedJoke(null)
  }

  const handleDeleteJoke = (id: string) => {
    setJokes(prev => prev.filter(joke => joke.id !== id))
    // Also remove from setlists
    setSetlists(prev => prev.map(setlist => ({
      ...setlist,
      jokes: setlist.jokes.filter(joke => joke.id !== id),
      totalDuration: setlist.jokes
        .filter(joke => joke.id !== id)
        .reduce((sum, joke) => sum + joke.duration, 0)
    })).filter(setlist => setlist.jokes.length > 0))
  }

  const handleViewJoke = (joke: Joke) => {
    setSelectedJoke(joke)
    setViewMode('view-joke')
  }

  const handleEditClick = (joke: Joke) => {
    setSelectedJoke(joke)
    setViewMode('edit-joke')
  }

  // Setlist management functions
  const handleCreateSetlist = (setlistData: Omit<Setlist, 'id'>) => {
    const newSetlist: Setlist = {
      ...setlistData,
      id: Date.now().toString()
    }
    setSetlists(prev => [...prev, newSetlist])
    setViewMode('setlists')
  }

  const handleEditSetlist = (setlistData: Omit<Setlist, 'id'>) => {
    if (!selectedSetlist) return
    
    const updatedSetlist: Setlist = {
      ...setlistData,
      id: selectedSetlist.id
    }
    
    setSetlists(prev => prev.map(setlist => 
      setlist.id === selectedSetlist.id ? updatedSetlist : setlist
    ))
    setViewMode('setlists')
    setSelectedSetlist(null)
  }

  const handleDeleteSetlist = (id: string) => {
    setSetlists(prev => prev.filter(setlist => setlist.id !== id))
  }

  const handleViewSetlist = (setlist: Setlist) => {
    setSelectedSetlist(setlist)
    setViewMode('view-setlist')
  }

  const handleEditSetlistClick = (setlist: Setlist) => {
    setSelectedSetlist(setlist)
    setViewMode('edit-setlist')
  }

  // Navigation functions
  const handleBackToJokes = () => {
    setViewMode('jokes')
    setSelectedJoke(null)
  }

  const handleBackToSetlists = () => {
    setViewMode('setlists')
    setSelectedSetlist(null)
  }

  const handleCreateNewJoke = () => {
    setSelectedJoke(null)
    setViewMode('create-joke')
  }

  const handleCreateNewSetlist = () => {
    setSelectedSetlist(null)
    setViewMode('create-setlist')
  }

  const handleCreateTag = (tagData: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tagData,
      id: Date.now().toString()
    }
    setTags(prev => [...prev, newTag])
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'jokes':
        return (
          <JokeList
            jokes={jokes}
            availableTags={tags}
            onEdit={handleEditClick}
            onDelete={handleDeleteJoke}
            onView={handleViewJoke}
          />
        )

      case 'setlists':
        return (
          <SetlistList
            setlists={setlists}
            availableJokes={jokes}
            availableTags={tags}
            onEdit={handleEditSetlistClick}
            onDelete={handleDeleteSetlist}
            onView={handleViewSetlist}
          />
        )

      case 'create-joke':
        return (
          <JokeForm
            availableTags={tags}
            onSubmit={handleCreateJoke}
            onCancel={handleBackToJokes}
            onCreateTag={handleCreateTag}
          />
        )

      case 'edit-joke':
        return selectedJoke ? (
          <JokeForm
            joke={selectedJoke}
            availableTags={tags}
            onSubmit={handleEditJoke}
            onCancel={handleBackToJokes}
            onCreateTag={handleCreateTag}
          />
        ) : null

      case 'view-joke':
        return selectedJoke ? (
          <JokeViewer
            joke={selectedJoke}
            availableTags={tags}
            onEdit={handleEditClick}
            onBack={handleBackToJokes}
          />
        ) : null

      case 'create-setlist':
        return (
          <SetlistForm
            availableJokes={jokes}
            availableTags={tags}
            onSubmit={handleCreateSetlist}
            onCancel={handleBackToSetlists}
          />
        )

      case 'edit-setlist':
        return selectedSetlist ? (
          <SetlistForm
            setlist={selectedSetlist}
            availableJokes={jokes}
            availableTags={tags}
            onSubmit={handleEditSetlist}
            onCancel={handleBackToSetlists}
          />
        ) : null

      case 'view-setlist':
        return selectedSetlist ? (
          <SetlistViewer
            setlist={selectedSetlist}
            availableTags={tags}
            onEdit={handleEditSetlistClick}
            onBack={handleBackToSetlists}
          />
        ) : null

      default:
        return null
    }
  }

  const getHeaderButton = () => {
    if (viewMode === 'jokes') {
      return (
        <button onClick={handleCreateNewJoke} className={shared.btnPrimary}>
          + Add New Joke
        </button>
      )
    }
    if (viewMode === 'setlists') {
      return (
        <button onClick={handleCreateNewSetlist} className={shared.btnPrimary}>
          + Create New Setlist
        </button>
      )
    }
    return null
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎭 Comedy Setlist Manager</h1>
        <div className={styles.navigation}>
          <button
            onClick={() => setViewMode('jokes')}
            className={`${styles.navButton} ${viewMode === 'jokes' ? styles.active : ''}`}
          >
            Jokes
          </button>
          <button
            onClick={() => setViewMode('setlists')}
            className={`${styles.navButton} ${viewMode === 'setlists' ? styles.active : ''}`}
          >
            Setlists
          </button>
        </div>
        {getHeaderButton()}
      </header>

      <main className={styles.main}>
        {renderContent()}
      </main>
    </div>
  )
}

export default App
