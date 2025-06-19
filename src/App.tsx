import { useState, useEffect } from 'react'
import type { Joke, Tag, Setlist } from './types'
import { JokeForm, JokeList, JokeViewer, SetlistList, SetlistForm, SetlistViewer } from './components'
import { LoginForm, SignUpForm } from './components/Auth'
import { useAuth } from './contexts/AuthContext'
import { jokeService, setlistService, tagService } from './services/dataService'
import styles from './App.module.css'
import shared from './styles/shared.module.css'

type ViewMode = 'jokes' | 'setlists' | 'create-joke' | 'edit-joke' | 'view-joke' | 'create-setlist' | 'edit-setlist' | 'view-setlist'

function App() {
  const { user, loading, signOut } = useAuth()
  const [jokes, setJokes] = useState<Joke[]>([])
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('jokes')
  const [selectedJoke, setSelectedJoke] = useState<Joke | null>(null)
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      setJokes([])
      setSetlists([])
      setTags([])
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [jokesData, setlistsData, tagsData] = await Promise.all([
        jokeService.getJokes(user.id),
        setlistService.getSetlists(user.id),
        tagService.getTags(user.id)
      ])
      
      setJokes(jokesData)
      setSetlists(setlistsData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Joke management functions
  const handleCreateJoke = async (jokeData: Omit<Joke, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    try {
      const newJoke = await jokeService.createJoke({
        ...jokeData,
        user_id: user.id
      })
      setJokes(prev => [newJoke, ...prev])
      setViewMode('jokes')
    } catch (error) {
      console.error('Error creating joke:', error)
    }
  }

  const handleEditJoke = async (jokeData: Omit<Joke, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!selectedJoke || !user) return
    
    try {
      const updatedJoke = await jokeService.updateJoke(selectedJoke.id, jokeData)
      setJokes(prev => prev.map(joke => 
        joke.id === selectedJoke.id ? updatedJoke : joke
      ))
      setViewMode('jokes')
      setSelectedJoke(null)
    } catch (error) {
      console.error('Error updating joke:', error)
    }
  }

  const handleDeleteJoke = async (id: string) => {
    try {
      await jokeService.deleteJoke(id)
      setJokes(prev => prev.filter(joke => joke.id !== id))
      // Also remove from setlists
      setSetlists(prev => prev.map(setlist => ({
        ...setlist,
        jokes: setlist.jokes.filter(joke => joke.id !== id),
        totalDuration: setlist.jokes
          .filter(joke => joke.id !== id)
          .reduce((sum, joke) => sum + joke.duration, 0)
      })).filter(setlist => setlist.jokes.length > 0))
    } catch (error) {
      console.error('Error deleting joke:', error)
    }
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
  const handleCreateSetlist = async (setlistData: Omit<Setlist, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    try {
      const newSetlist = await setlistService.createSetlist({
        ...setlistData,
        user_id: user.id
      })
      setSetlists(prev => [newSetlist, ...prev])
      setViewMode('setlists')
    } catch (error) {
      console.error('Error creating setlist:', error)
    }
  }

  const handleEditSetlist = async (setlistData: Omit<Setlist, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!selectedSetlist || !user) return
    
    try {
      const updatedSetlist = await setlistService.updateSetlist(selectedSetlist.id, setlistData)
      setSetlists(prev => prev.map(setlist => 
        setlist.id === selectedSetlist.id ? updatedSetlist : setlist
      ))
      setViewMode('setlists')
      setSelectedSetlist(null)
    } catch (error) {
      console.error('Error updating setlist:', error)
    }
  }

  const handleDeleteSetlist = async (id: string) => {
    try {
      await setlistService.deleteSetlist(id)
      setSetlists(prev => prev.filter(setlist => setlist.id !== id))
    } catch (error) {
      console.error('Error deleting setlist:', error)
    }
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

  const handleCreateTag = async (tagData: Omit<Tag, 'id'>) => {
    if (!user) return
    
    try {
      const newTag = await tagService.createTag({
        ...tagData,
        user_id: user.id
      })
      setTags(prev => [...prev, newTag])
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.loading}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  // Show auth screen if not logged in
  if (!user) {
    return (
      <div className={styles.app}>
        <div className={styles.authWrapper}>
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignUp={() => setAuthMode('signup')} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loading}>
          <h2>Loading your data...</h2>
        </div>
      )
    }

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
        <div className={styles.userSection}>
          <span className={styles.userEmail}>{user.email}</span>
          {getHeaderButton()}
          <button onClick={signOut} className={shared.btnSecondary}>
            Sign Out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {renderContent()}
      </main>
    </div>
  )
}

export default App
