import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { jokeService } from '../services/dataService'
import { formatSecondsToMMSS } from '../utils/duration'
import type { Joke } from '../types'
import styles from './Pages.module.css'
import shared from '../styles/shared.module.css'

const DEFAULT_WPM = 130

export function DurationCalculatorPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [wpm, setWpm] = useState(DEFAULT_WPM)
  const [selectedJokes, setSelectedJokes] = useState<Set<string>>(new Set())
  const [updatedCount, setUpdatedCount] = useState<number | null>(null)

  // Manual calculator state
  const [manualText, setManualText] = useState('')

  useEffect(() => {
    if (user) {
      loadJokes()
    }
  }, [user])

  const loadJokes = async () => {
    if (!user) return
    try {
      setLoading(true)
      const allJokes = await jokeService.getJokes(user.id)
      // Filter to only jokes with content
      const jokesWithContent = allJokes.filter(j => j.content && j.content.trim().length > 0)
      setJokes(jokesWithContent)
      // Select all by default
      setSelectedJokes(new Set(jokesWithContent.map(j => j.id)))
    } catch (err) {
      console.error('Failed to load jokes:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateDuration = (text: string): number => {
    if (!text || text.trim() === '') return 0
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    return Math.round((words.length / wpm) * 60)
  }

  const getWordCount = (text: string): number => {
    if (!text || text.trim() === '') return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const toggleJoke = (jokeId: string) => {
    setSelectedJokes(prev => {
      const next = new Set(prev)
      if (next.has(jokeId)) {
        next.delete(jokeId)
      } else {
        next.add(jokeId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedJokes(new Set(jokes.map(j => j.id)))
  }

  const selectNone = () => {
    setSelectedJokes(new Set())
  }

  const updateSelectedJokes = async () => {
    if (!user || selectedJokes.size === 0) return

    try {
      setUpdating(true)
      setUpdatedCount(null)

      let count = 0
      for (const jokeId of selectedJokes) {
        const joke = jokes.find(j => j.id === jokeId)
        if (joke && joke.content) {
          const newDuration = calculateDuration(joke.content)
          await jokeService.updateJoke(jokeId, { duration: newDuration })
          count++
        }
      }

      setUpdatedCount(count)
      // Reload jokes to show updated durations
      await loadJokes()
    } catch (err) {
      console.error('Failed to update jokes:', err)
    } finally {
      setUpdating(false)
    }
  }

  // Manual calculator values
  const manualWordCount = getWordCount(manualText)
  const manualDuration = calculateDuration(manualText)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Duration Calculator</h1>
        <button
          onClick={() => navigate('/tools')}
          className={shared.btnSecondary}
        >
          Back to Tools
        </button>
      </div>

      <div className={styles.content}>
        {/* WPM Setting */}
        <div className={styles.section}>
          <h2>Speaking Pace</h2>
          <p>
            Adjust your speaking pace to calculate joke durations. Typical comedy pace is 120-140 words per minute.
          </p>
          <div className={styles.wpmInput}>
            <input
              id="wpm"
              type="number"
              min="50"
              max="250"
              value={wpm}
              onChange={(e) => setWpm(Math.max(50, Math.min(250, parseInt(e.target.value) || DEFAULT_WPM)))}
              className={styles.input}
            />
            <span className={styles.wpmHint}>
              words per minute (default: 130)
            </span>
          </div>
        </div>

        {/* Bulk Update Section */}
        <div className={styles.section}>
          <h2>Update Joke Durations</h2>
          <p>
            Select jokes below to update their durations based on word count.
            <strong> Only jokes with a description are shown</strong> — jokes without content cannot have their duration calculated.
          </p>

          {jokes.length === 0 ? (
            <p className={styles.emptyState}>
              No jokes with descriptions found. Add content to your jokes to calculate their duration.
            </p>
          ) : (
            <>
              <div className={styles.bulkActions}>
                <span>{selectedJokes.size} of {jokes.length} jokes selected</span>
                <button onClick={selectAll} className={shared.btnSecondary}>Select All</button>
                <button onClick={selectNone} className={shared.btnSecondary}>Select None</button>
                <button
                  onClick={updateSelectedJokes}
                  className={shared.btnPrimary}
                  disabled={updating || selectedJokes.size === 0}
                >
                  {updating ? 'Updating...' : `Update ${selectedJokes.size} Joke${selectedJokes.size !== 1 ? 's' : ''}`}
                </button>
              </div>

              {updatedCount !== null && (
                <div className={styles.successMessage}>
                  Successfully updated {updatedCount} joke{updatedCount !== 1 ? 's' : ''}!
                </div>
              )}

              <div className={styles.jokesList}>
                <div className={styles.jokesHeader}>
                  <span className={styles.checkboxCol}></span>
                  <span className={styles.nameCol}>Joke</span>
                  <span className={styles.wordsCol}>Words</span>
                  <span className={styles.currentCol}>Current</span>
                  <span className={styles.calculatedCol}>Calculated</span>
                </div>
                {jokes.map(joke => {
                  const wordCount = getWordCount(joke.content || '')
                  const calculatedDuration = calculateDuration(joke.content || '')
                  const currentDuration = joke.duration || 0
                  const isDifferent = calculatedDuration !== currentDuration

                  return (
                    <div
                      key={joke.id}
                      className={`${styles.jokeRow} ${selectedJokes.has(joke.id) ? styles.selected : ''}`}
                      onClick={() => toggleJoke(joke.id)}
                    >
                      <span className={styles.checkboxCol}>
                        <input
                          type="checkbox"
                          checked={selectedJokes.has(joke.id)}
                          onChange={() => toggleJoke(joke.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </span>
                      <span className={styles.nameCol}>{joke.name}</span>
                      <span className={styles.wordsCol}>{wordCount}</span>
                      <span className={styles.currentCol}>{formatSecondsToMMSS(currentDuration)}</span>
                      <span className={`${styles.calculatedCol} ${isDifferent ? styles.different : ''}`}>
                        {formatSecondsToMMSS(calculatedDuration)}
                        {isDifferent && <span className={styles.diffIndicator}>*</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className={styles.hint}>* indicates calculated duration differs from current duration</p>
            </>
          )}
        </div>

        {/* Manual Calculator */}
        <div className={styles.section}>
          <h2>Manual Calculator</h2>
          <p>
            Paste text below to calculate its duration without saving.
          </p>

          <div className={styles.calculatorForm}>
            <div className={styles.formGroup}>
              <label htmlFor="jokeText">Text</label>
              <textarea
                id="jokeText"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste text here to calculate duration..."
                className={styles.textarea}
                rows={6}
              />
            </div>
          </div>

          <div className={styles.calculatorResults}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Word Count</span>
              <span className={styles.resultValue}>{manualWordCount}</span>
            </div>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>Duration</span>
              <span className={styles.resultValue}>{formatSecondsToMMSS(manualDuration)}</span>
            </div>
          </div>
        </div>

        {/* Reference Info */}
        <div className={styles.section}>
          <h2>About Speaking Pace</h2>
          <ul className={styles.paceList}>
            <li><strong>Slow/deliberate:</strong> 100-120 WPM — dramatic timing, punchlines</li>
            <li><strong>Conversational:</strong> 120-150 WPM — natural comedy delivery</li>
            <li><strong>Fast/energetic:</strong> 150-180 WPM — high-energy, rapid-fire jokes</li>
          </ul>
          <p>
            Remember to account for pauses, audience laughter, and crowd work when planning your set.
          </p>
        </div>
      </div>
    </div>
  )
}
