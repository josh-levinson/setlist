import type { Joke, Tag } from '../../types'
import { getTagColor } from '../../utils/tagColors'
import styles from './TagSuggestions.module.css'

interface TagSuggestionsProps {
  joke: Joke
  availableTags: Tag[]
  suggestedTags: string[]
  tagStates: Record<string, TagState>
  tagColors: Record<string, string>
  onAcceptTag: (jokeId: string, tagName: string) => void
  onRejectTag: (jokeId: string, tagName: string) => void
  onAcceptAll: (jokeId: string, tags: Array<{ name: string; color: string }>) => void
  onRejectAll: (jokeId: string) => void
}

type TagState = 'pending' | 'accepted' | 'rejected'

export function TagSuggestions({
  joke,
  availableTags,
  suggestedTags = [],
  tagStates,
  tagColors,
  onAcceptTag,
  onRejectTag,
  onAcceptAll,
  onRejectAll,
}: TagSuggestionsProps) {



  // Get existing tags for this joke
  const existingTags = joke.tags.map(tagId =>
    availableTags.find(tag => tag.id === tagId)
  ).filter(Boolean) as Tag[]

    const handleTagClick = (tagName: string) => {
    const currentState = tagStates[tagName] || 'pending'

    if (currentState === 'pending') {
      onAcceptTag(joke.id, tagName)
    } else if (currentState === 'accepted') {
      onRejectTag(joke.id, tagName)
    } else if (currentState === 'rejected') {
      onAcceptTag(joke.id, tagName)
    }
  }

      const handleAcceptAll = () => {
    if (!suggestedTags || !Array.isArray(suggestedTags)) return

    const tagsToAccept = suggestedTags
      .filter(tag => tagStates[tag] !== 'accepted')
      .map(tag => ({
        name: tag,
        color: tagColors[tag] || getTagColor(tag, availableTags)
      }))

    onAcceptAll(joke.id, tagsToAccept)
  }

      const handleRejectAll = () => {
    onRejectAll(joke.id)
  }

  const handleReset = () => {
    onRejectAll(joke.id) // Remove any accepted tags - the parent will reset states
  }

  const pendingCount = Object.values(tagStates).filter(state => state === 'pending').length
  const acceptedCount = Object.values(tagStates).filter(state => state === 'accepted').length

  return (
    <div className={styles.container}>
      <div className={styles.jokeHeader}>
        <div>
          <div className={styles.jokeName}>{joke.name}</div>
          {joke.content && (
            <div className={styles.jokeContent}>{joke.content}</div>
          )}
        </div>
      </div>

      {existingTags.length > 0 && (
        <div className={styles.existingTags}>
          <span className={styles.existingTagsLabel}>Current tags:</span>
          <div className={styles.tagList}>
            {existingTags.map(tag => (
              <span
                key={tag.id}
                className={styles.tag}
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.suggestionsSection}>
        <span className={styles.suggestionsLabel}>
          Suggested tags ({acceptedCount} accepted, {pendingCount} pending):
        </span>

        {!suggestedTags || !Array.isArray(suggestedTags) || suggestedTags.length === 0 ? (
          <div className={styles.noSuggestions}>No tag suggestions available</div>
        ) : (
          <>
            <div className={styles.suggestionsList}>
              {suggestedTags.map(tagName => {
                const state = tagStates[tagName] || 'pending'
                const color = tagColors[tagName] || getTagColor(tagName, availableTags)

                return (
                  <button
                    key={tagName}
                    className={`${styles.suggestionTag} ${styles[state]}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleTagClick(tagName)}
                    disabled={state === 'rejected'}
                    title={
                      state === 'pending'
                        ? 'Click to accept'
                        : state === 'accepted'
                        ? 'Click to reject'
                        : 'Rejected - click to accept'
                    }
                  >
                    {tagName}
                  </button>
                )
              })}
            </div>

            <div className={styles.actionButtons}>
              <button
                className={`${styles.actionBtn} ${styles.acceptAllBtn}`}
                onClick={handleAcceptAll}
                disabled={pendingCount === 0}
              >
                Accept All ({pendingCount})
              </button>
              <button
                className={`${styles.actionBtn} ${styles.rejectAllBtn}`}
                onClick={handleRejectAll}
                disabled={acceptedCount === 0 && pendingCount === 0}
              >
                Reject All
              </button>
              <button
                className={`${styles.actionBtn} ${styles.resetBtn}`}
                onClick={handleReset}
                disabled={acceptedCount === 0 && Object.values(tagStates).every(state => state === 'pending')}
              >
                Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
