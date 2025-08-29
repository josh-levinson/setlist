import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Setlist, Joke, Tag } from '../types'
import { SetlistList, ConfirmationDialog } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { setlistService, jokeService, tagService } from '../services/dataService'
import styles from './Pages.module.css'

export default function SetlistsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [jokes, setJokes] = useState<Joke[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [setlistToDelete, setSetlistToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const [setlistsData, jokesData, tagsData] = await Promise.all([
        setlistService.getSetlists(user.id),
        jokeService.getJokes(user.id),
        tagService.getTags(user.id)
      ])
      
      setSetlists(setlistsData)
      setJokes(jokesData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSetlist = (setlist: Setlist) => {
    navigate(`/setlists/${setlist.id}/edit`)
  }

  const handleDeleteSetlist = (id: string) => {
    setSetlistToDelete(id)
  }

  const confirmDeleteSetlist = async () => {
    if (!setlistToDelete) return
    
    try {
      await setlistService.deleteSetlist(setlistToDelete)
      setSetlists(prev => prev.filter(setlist => setlist.id !== setlistToDelete))
    } catch (error) {
      console.error('Error deleting setlist:', error)
    } finally {
      setSetlistToDelete(null)
    }
  }

  const cancelDeleteSetlist = () => {
    setSetlistToDelete(null)
  }

  const handleViewSetlist = (setlist: Setlist) => {
    navigate(`/setlists/${setlist.id}`)
  }

  const handleCreateNewSetlist = () => {
    navigate('/setlists/new')
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading your setlists...</h2>
      </div>
    )
  }

  const setlistToDeleteName = setlistToDelete 
    ? setlists.find(setlist => setlist.id === setlistToDelete)?.name || 'this setlist'
    : '';

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>My Setlists</h1>
        <button onClick={handleCreateNewSetlist} className={styles.btnPrimary}>
          + Create New Setlist
        </button>
      </div>
      
      <SetlistList
        setlists={setlists}
        availableJokes={jokes}
        availableTags={tags}
        onEdit={handleEditSetlist}
        onDelete={handleDeleteSetlist}
        onView={handleViewSetlist}
      />

      <ConfirmationDialog
        isOpen={!!setlistToDelete}
        title="Delete Setlist"
        message={`Are you sure you want to delete "${setlistToDeleteName}"? This action cannot be undone.`}
        onConfirm={confirmDeleteSetlist}
        onCancel={cancelDeleteSetlist}
      />
    </div>
  )
} 