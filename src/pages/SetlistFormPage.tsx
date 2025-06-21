import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Setlist, Joke, Tag } from '../types'
import { SetlistForm } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { setlistService, jokeService, tagService } from '../services/dataService'
import styles from './Pages.module.css'

export default function SetlistFormPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [setlist, setSetlist] = useState<Setlist | null>(null)
  const [jokes, setJokes] = useState<Joke[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, id])

  const loadData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [jokesData, tagsData] = await Promise.all([
        jokeService.getJokes(user.id),
        tagService.getTags(user.id)
      ])
      
      setJokes(jokesData)
      setTags(tagsData)

      if (id && id !== 'new') {
        const setlistData = await setlistService.getSetlist(id)
        setSetlist(setlistData)
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (setlistData: Omit<Setlist, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    try {
      if (isEditing && setlist) {
        await setlistService.updateSetlist(setlist.id, setlistData)
      } else {
        await setlistService.createSetlist({
          ...setlistData,
          user_id: user.id
        })
      }
      navigate('/setlists')
    } catch (error) {
      console.error('Error saving setlist:', error)
    }
  }

  const handleCancel = () => {
    navigate('/setlists')
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>{isEditing ? 'Edit Setlist' : 'Create New Setlist'}</h1>
      </div>
      
      <SetlistForm
        setlist={setlist || undefined}
        availableJokes={jokes}
        availableTags={tags}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
} 