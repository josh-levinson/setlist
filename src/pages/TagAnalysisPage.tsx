import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { jokeService, tagService, llmTagService } from '../services/dataService'
import { TagSuggestions } from '../components/TagSuggestions'
import { generateTagColors } from '../utils/tagColors'
import type { Joke, Tag } from '../types'
import styles from './Pages.module.css'
import shared from '../styles/shared.module.css'

interface JokeSuggestion {
  id: string
  suggestedTags: string[]
}

type TagState = 'pending' | 'accepted' | 'rejected'

export function TagAnalysisPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [jokes, setJokes] = useState<Joke[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [suggestions, setSuggestions] = useState<JokeSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingTagChanges, setPendingTagChanges] = useState<Record<string, { add: string[], remove: string[] }>>({})
  const [tagStates, setTagStates] = useState<Record<string, Record<string, TagState>>>({}) // jokeId -> tagName -> state
  const [tagColors, setTagColors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [jokesData, tagsData] = await Promise.all([
        jokeService.getJokes(user.id),
        tagService.getTags(user.id)
      ])

      setJokes(jokesData)
      setAvailableTags(tagsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

    const generateSuggestions = async () => {
    console.log('generateSuggestions called', { user: !!user, jokesLength: jokes.length })

    if (!user || jokes.length === 0) {
      console.log('Early return: no user or no jokes')
      return
    }

    try {
      setGenerating(true)
      setError(null)

      // Prepare jokes for LLM (use content if available, otherwise use name)
      const jokesForLLM = jokes.map(joke => ({
        id: joke.id,
        name: joke.name,
        content: joke.content && joke.content.trim().length > 0 ? joke.content : joke.name
      }))

      console.log('Jokes for LLM:', jokesForLLM.length, jokesForLLM)

      if (jokesForLLM.length === 0) {
        setError('No jokes found to analyze.')
        return
      }

      console.log('Calling LLM service...')
      const suggestionsData = await llmTagService.generateJokeTags(jokesForLLM)
      console.log('LLM response:', suggestionsData)

      // Handle the API response format - extract results array
      const rawSuggestions = Array.isArray(suggestionsData) ? suggestionsData : ((suggestionsData as any)?.results || [])

            // Transform the API response to match our expected format
      const suggestions = rawSuggestions.map((item: any) => ({
        id: item.id,
        suggestedTags: item.tags || item.suggestedTags || []
      }))

      // Collect all unique tag names from suggestions
      const allSuggestedTagNames = new Set<string>()
      suggestions.forEach((suggestion: JokeSuggestion) => {
        suggestion.suggestedTags.forEach((tag: string) => allSuggestedTagNames.add(tag))
      })

      // Generate consistent colors for all suggested tags
      const newTagColors = generateTagColors(Array.from(allSuggestedTagNames), availableTags)
      setTagColors(newTagColors)

      // Initialize tag states for all jokes
      const initialTagStates: Record<string, Record<string, TagState>> = {}
      suggestions.forEach((suggestion: JokeSuggestion) => {
        initialTagStates[suggestion.id] = {}
        suggestion.suggestedTags.forEach((tag: string) => {
          initialTagStates[suggestion.id][tag] = 'pending'
        })
      })
      setTagStates(initialTagStates)

      setSuggestions(suggestions)
      console.log('Raw API response:', rawSuggestions)
      console.log('Transformed suggestions:', suggestions)
      console.log('Generated tag colors:', newTagColors)
      setPendingTagChanges({}) // Reset pending changes
    } catch (err) {
      console.error('Error generating suggestions:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions')
    } finally {
      setGenerating(false)
    }
  }

    const handleAcceptTag = async (jokeId: string, tagName: string) => {
    // Update tag state
    setTagStates(prev => ({
      ...prev,
      [jokeId]: {
        ...prev[jokeId],
        [tagName]: 'accepted'
      }
    }))

    // Check if tag already exists
    let tag = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())

    // Create tag if it doesn't exist
    if (!tag && user) {
      try {
        const color = tagColors[tagName]
        tag = await tagService.createTag({
          name: tagName,
          color: color,
          user_id: user.id
        })
        setAvailableTags(prev => [...prev, tag!])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create tag')
        return
      }
    }

    if (!tag) return

    // Update pending changes
    setPendingTagChanges(prev => {
      const current = prev[jokeId] || { add: [], remove: [] }
      return {
        ...prev,
        [jokeId]: {
          add: [...current.add.filter(id => id !== tag!.id), tag!.id],
          remove: current.remove.filter(id => id !== tag!.id)
        }
      }
    })
  }

  const handleRejectTag = (jokeId: string, tagName: string) => {
    // Update tag state
    setTagStates(prev => ({
      ...prev,
      [jokeId]: {
        ...prev[jokeId],
        [tagName]: 'rejected'
      }
    }))

    const tag = availableTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())
    if (!tag) return

    // Update pending changes
    setPendingTagChanges(prev => {
      const current = prev[jokeId] || { add: [], remove: [] }
      return {
        ...prev,
        [jokeId]: {
          add: current.add.filter(id => id !== tag.id),
          remove: [...current.remove.filter(id => id !== tag.id), tag.id]
        }
      }
    })
  }

  const handleAcceptAll = async (jokeId: string, tags: Array<{ name: string; color: string }>) => {
    for (const tagData of tags) {
      await handleAcceptTag(jokeId, tagData.name)
    }
  }

  const handleRejectAll = (jokeId: string) => {
    const jokeSuggestions = suggestions.find(s => s.id === jokeId)
    if (!jokeSuggestions) return

    for (const tagName of jokeSuggestions.suggestedTags) {
      handleRejectTag(jokeId, tagName)
    }
  }

  const handleAcceptAllForAllJokes = async () => {
    for (const suggestion of suggestions) {
      const tagsToAccept = suggestion.suggestedTags
        .filter(tagName => {
          const currentState = tagStates[suggestion.id]?.[tagName]
          return currentState !== 'accepted'
        })
        .map(tagName => ({
          name: tagName,
          color: tagColors[tagName]
        }))

      if (tagsToAccept.length > 0) {
        await handleAcceptAll(suggestion.id, tagsToAccept)
      }
    }
  }

  const applyAllChanges = async () => {
    if (!user) return

    try {
      setLoading(true)

      for (const [jokeId, changes] of Object.entries(pendingTagChanges)) {
        const joke = jokes.find(j => j.id === jokeId)
        if (!joke) continue

        const currentTags = [...joke.tags]

        // Remove tags
        const tagsAfterRemoval = currentTags.filter(tagId => !changes.remove.includes(tagId))

        // Add new tags (avoid duplicates)
        const finalTags = [...new Set([...tagsAfterRemoval, ...changes.add])]

        if (finalTags.length !== currentTags.length ||
            !finalTags.every(tag => currentTags.includes(tag))) {
          await jokeService.updateJoke(jokeId, { tags: finalTags })
        }
      }

      // Reload data to reflect changes
      await loadData()
      setPendingTagChanges({})

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply changes')
    } finally {
      setLoading(false)
    }
  }

  const discardChanges = () => {
    setPendingTagChanges({})
  }

  const hasPendingChanges = Object.keys(pendingTagChanges).length > 0

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
        <h1>AI Tag Analysis</h1>
        <button
          onClick={() => navigate('/tools')}
          className={shared.btnSecondary}
        >
          Back to Tools
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Generate Tag Suggestions</h2>
                    <p>
            Use AI to analyze your jokes and suggest relevant tags.
            The AI will analyze joke content when available, or the joke title if no content is provided.
          </p>

          <div className={styles.stats}>
            <span>Total jokes: {jokes.length}</span>
            <span>Jokes with content: {jokes.filter(j => j.content?.trim()).length}</span>
            <span>Available tags: {availableTags.length}</span>
          </div>

          <button
            onClick={generateSuggestions}
            disabled={generating || jokes.length === 0}
            className={shared.btnPrimary}
          >
            {generating ? (
              <>
                <span className={styles.spinner}></span>
                Generating Suggestions...
              </>
            ) : (
              'Generate Tag Suggestions'
            )}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Review Suggestions</h2>
              <div className={styles.actionButtons}>
                <button
                  onClick={handleAcceptAllForAllJokes}
                  className={shared.btnPrimary}
                  disabled={loading}
                >
                  Accept All for All Jokes
                </button>
                {hasPendingChanges && (
                  <>
                    <button
                      onClick={applyAllChanges}
                      className={shared.btnPrimary}
                      disabled={loading}
                    >
                      Apply All Changes
                    </button>
                    <button
                      onClick={discardChanges}
                      className={shared.btnSecondary}
                    >
                      Discard Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.suggestionsList}>
              {suggestions.map(suggestion => {
                const joke = jokes.find(j => j.id === suggestion.id)
                if (!joke) return null

                return (
                  <TagSuggestions
                    key={joke.id}
                    joke={joke}
                    availableTags={availableTags}
                    suggestedTags={suggestion.suggestedTags}
                    tagStates={tagStates[joke.id] || {}}
                    tagColors={tagColors}
                    onAcceptTag={handleAcceptTag}
                    onRejectTag={handleRejectTag}
                    onAcceptAll={handleAcceptAll}
                    onRejectAll={handleRejectAll}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
