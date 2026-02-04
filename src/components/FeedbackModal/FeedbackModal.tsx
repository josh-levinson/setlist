import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { feedbackService } from '../../services/dataService'
import styles from './FeedbackModal.module.css'
import shared from '../../styles/shared.module.css'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  pageContext?: string
}

export function FeedbackModal({ isOpen, onClose, pageContext }: FeedbackModalProps) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !comment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      await feedbackService.createFeedback({
        user_id: user.id,
        comment: comment.trim(),
        page_context: pageContext,
      })
      setSubmitted(true)
      setComment('')
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
      console.error('Feedback submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setComment('')
    setSubmitted(false)
    setError(null)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Send Feedback</h2>
        </div>
        <div className={styles.content}>
          {submitted ? (
            <p className={styles.success}>Thanks for your feedback!</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className={styles.description}>
                Help us improve! Share your thoughts, report bugs, or suggest features.
              </p>
              <textarea
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What's on your mind?"
                rows={5}
                required
                disabled={submitting}
              />
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.actions}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={shared.btnSecondary}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={shared.btnPrimary}
                  disabled={submitting || !comment.trim()}
                >
                  {submitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
        {submitted && (
          <div className={styles.actions}>
            <button onClick={handleClose} className={shared.btnPrimary}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
