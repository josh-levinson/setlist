import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Joke, Tag } from '../types'
import { JokeViewer, ConfirmationDialog } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { jokeService, tagService } from '../services/dataService'
import styles from './Pages.module.css'

export default function JokeViewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [joke, setJoke] = useState<Joke | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (user && id) {
      loadData()
    }
  }, [user, id])

  const loadData = async () => {
    if (!user || !id) return
    
    setIsLoading(true)
    try {
      const [jokeData, tagsData] = await Promise.all([
        jokeService.getJoke(id),
        tagService.getTags(user.id)
      ])
      
      setJoke(jokeData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading data:', error)
      navigate('/jokes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    if (joke) {
      navigate(`/jokes/${joke.id}/edit`)
    }
  }

  const handleBack = () => {
    navigate('/jokes')
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!joke) return
    try {
      await jokeService.deleteJoke(joke.id)
      navigate('/jokes')
    } catch (error) {
      console.error('Error deleting joke:', error)
    }
    setShowDeleteConfirm(false)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading joke...</h2>
      </div>
    )
  }

  if (!joke) {
    return (
      <div className={styles.loading}>
        <h2>Joke not found</h2>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <JokeViewer
        joke={joke}
        availableTags={tags}
        onEdit={handleEdit}
        onBack={handleBack}
        onDelete={handleDelete}
      />
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Joke"
        message={`Are you sure you want to delete "${joke.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
} 