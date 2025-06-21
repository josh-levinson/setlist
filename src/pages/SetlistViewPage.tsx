import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Setlist, Tag } from '../types'
import { SetlistViewer } from '../components'
import { useAuth } from '../contexts/AuthContext'
import { setlistService, tagService } from '../services/dataService'
import styles from './Pages.module.css'

export default function SetlistViewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [setlist, setSetlist] = useState<Setlist | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && id) {
      loadData()
    }
  }, [user, id])

  const loadData = async () => {
    if (!user || !id) return
    
    setIsLoading(true)
    try {
      const [setlistData, tagsData] = await Promise.all([
        setlistService.getSetlist(id),
        tagService.getTags(user.id)
      ])
      
      setSetlist(setlistData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading data:', error)
      navigate('/setlists')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    if (setlist) {
      navigate(`/setlists/${setlist.id}/edit`)
    }
  }

  const handleBack = () => {
    navigate('/setlists')
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <h2>Loading setlist...</h2>
      </div>
    )
  }

  if (!setlist) {
    return (
      <div className={styles.loading}>
        <h2>Setlist not found</h2>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SetlistViewer
        setlist={setlist}
        availableTags={tags}
        onEdit={handleEdit}
        onBack={handleBack}
      />
    </div>
  )
} 