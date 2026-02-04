import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Joke, Tag } from '../types'
import { JokeList, ConfirmationDialog, ExportButton } from '../components'
import { JokeImport } from '../components/JokeImport'
import type { ImportedJoke } from '../utils/fileImport'
import { exportJokesToCSV, exportJokesToDocx } from '../utils/fileExport'
import { useAuth } from '../contexts/AuthContext'
import { jokeService, tagService } from '../services/dataService'
import { estimateDurationFromText } from '../utils/duration'
import styles from './Pages.module.css'

export default function JokesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jokes, setJokes] = useState<Joke[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [jokeToDelete, setJokeToDelete] = useState<string | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)

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

  const handleEstimateAllDurations = async () => {
    // Find jokes with content that don't have a duration set
    const jokesToEstimate = jokes.filter(joke => joke.content?.trim() && !joke.duration)

    if (jokesToEstimate.length === 0) {
      return
    }

    setIsEstimating(true)
    try {
      const updates = jokesToEstimate.map(joke => ({
        id: joke.id,
        duration: estimateDurationFromText(joke.content || '')
      }))

      await jokeService.bulkUpdateJokes(updates)

      // Update local state
      setJokes(prev => prev.map(joke => {
        const update = updates.find(u => u.id === joke.id)
        return update ? { ...joke, duration: update.duration } : joke
      }))
    } catch (error) {
      console.error('Error estimating durations:', error)
    } finally {
      setIsEstimating(false)
    }
  }

  // Count jokes eligible for estimation
  const jokesWithoutDuration = jokes.filter(joke => joke.content?.trim() && !joke.duration).length

  const handleExportCSV = () => {
    exportJokesToCSV(jokes, tags)
  }

  const handleExportDocx = () => {
    exportJokesToDocx(jokes, tags)
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
          {jokesWithoutDuration > 0 && (
            <button
              onClick={handleEstimateAllDurations}
              className={styles.btnSecondary}
              disabled={isEstimating}
              title={`Estimate duration for ${jokesWithoutDuration} joke${jokesWithoutDuration !== 1 ? 's' : ''} with content`}
            >
              {isEstimating ? 'Estimating...' : `Estimate Durations (${jokesWithoutDuration})`}
            </button>
          )}
          <ExportButton
            onExportCSV={handleExportCSV}
            onExportDocx={handleExportDocx}
            disabled={jokes.length === 0}
          />
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