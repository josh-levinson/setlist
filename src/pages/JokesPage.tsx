import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Joke, Tag } from '../types'
import { JokeList, ConfirmationDialog } from '../components'
import { JokeImport } from '../components/JokeImport'
import type { ImportedJoke } from '../utils/fileImport'
import { useAuth } from '../contexts/AuthContext'
import { jokeService, tagService } from '../services/dataService'
import styles from './Pages.module.css'

export default function JokesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jokes, setJokes] = useState<Joke[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [jokeToDelete, setJokeToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [jokesData, tagsData] = await Promise.all([
        jokeService.getJokes(user.id),
        tagService.getTags(user.id)
      ])
      
      setJokes(jokesData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditJoke = (joke: Joke) => {
    navigate(`/jokes/${joke.id}/edit`)
  }

  const handleDeleteJoke = (id: string) => {
    setJokeToDelete(id)
  }

  const confirmDeleteJoke = async () => {
    if (!jokeToDelete) return
    
    try {
      await jokeService.deleteJoke(jokeToDelete)
      setJokes(prev => prev.filter(joke => joke.id !== jokeToDelete))
    } catch (error) {
      console.error('Error deleting joke:', error)
    } finally {
      setJokeToDelete(null)
    }
  }

  const cancelDeleteJoke = () => {
    setJokeToDelete(null)
  }

  const handleViewJoke = (joke: Joke) => {
    navigate(`/jokes/${joke.id}`)
  }

  const handleCreateNewJoke = () => {
    navigate('/jokes/new')
  }

  const handleImportJokes = async (importedJokes: ImportedJoke[]) => {
    if (!user) return

    try {
      setIsLoading(true)
      const createdJokes = await Promise.all(
        importedJokes.map(joke => jokeService.createJoke({ 
          name: joke.name,
          content: joke.content || '',
          rating: joke.rating,
          duration: joke.duration,
          tags: joke.tags,
          user_id: user.id 
        }))
      )
      
      setJokes(prev => [...createdJokes, ...prev])
      setShowImport(false)
    } catch (error) {
      console.error('Error importing jokes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading your jokes...</h2>
      </div>
    )
  }

  if (showImport) {
    return (
      <div className={styles.page}>
        <JokeImport
          onImport={handleImportJokes}
          onCancel={() => setShowImport(false)}
        />
      </div>
    )
  }

  const jokeToDeleteName = jokeToDelete 
    ? jokes.find(joke => joke.id === jokeToDelete)?.name || 'this joke'
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>My Jokes</h1>
        <div className={styles.headerActions}>
          <button onClick={() => setShowImport(true)} className={styles.btnSecondary}>
            Import Jokes
          </button>
          <button onClick={handleCreateNewJoke} className={styles.btnPrimary}>
            + Add New Joke
          </button>
        </div>
      </div>
      
      <JokeList
        jokes={jokes}
        availableTags={tags}
        onEdit={handleEditJoke}
        onDelete={handleDeleteJoke}
        onView={handleViewJoke}
      />

      <ConfirmationDialog
        isOpen={!!jokeToDelete}
        title="Delete Joke"
        message={`Are you sure you want to delete "${jokeToDeleteName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteJoke}
        onCancel={cancelDeleteJoke}
      />
    </div>
  )
} 