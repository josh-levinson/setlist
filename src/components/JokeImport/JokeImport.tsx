import React, { useState, useRef } from 'react'
import { importJokes, type ImportResult, type ImportedJoke } from '../../utils/fileImport'
import styles from './JokeImport.module.css'

interface JokeImportProps {
  onImport: (jokes: ImportedJoke[]) => void
  onCancel: () => void
}

export const JokeImport: React.FC<JokeImportProps> = ({ onImport, onCancel }) => {
  const [importing, setImporting] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [selectedJokes, setSelectedJokes] = useState<ImportedJoke[]>([])
  const [expandedJoke, setExpandedJoke] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isDocx = file.name.toLowerCase().endsWith('.docx')
    setImporting(true)
    setIsAiProcessing(isDocx)
    setResult(null)

    try {
      const importResult = await importJokes(file)
      setResult(importResult)
      setSelectedJokes(importResult.jokes)
    } catch (error) {
      setResult({
        jokes: [],
        errors: [`Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      })
    } finally {
      setImporting(false)
      setIsAiProcessing(false)
    }
  }

  const handleImport = () => {
    if (selectedJokes.length > 0) {
      onImport(selectedJokes)
    }
  }

  const handleRemoveJoke = (index: number) => {
    setSelectedJokes(prev => prev.filter((_, i) => i !== index))
    if (expandedJoke === index) {
      setExpandedJoke(null)
    } else if (expandedJoke !== null && expandedJoke > index) {
      setExpandedJoke(expandedJoke - 1)
    }
  }

  const toggleExpanded = (index: number) => {
    setExpandedJoke(expandedJoke === index ? null : index)
  }

  const handleReset = () => {
    setResult(null)
    setSelectedJokes([])
    setExpandedJoke(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Import Jokes</h2>
      
      <div className={styles.content}>
        {!result && (
          <>
            <div className={styles.instructions}>
              <h3>Supported File Formats</h3>
              <ul>
                <li><strong>Word documents (.docx)</strong> - AI will automatically identify and parse jokes</li>
                <li><strong>CSV files</strong> - Comma-separated values with columns</li>
                <li><strong>Excel files</strong> - .xlsx or .xls format with columns</li>
              </ul>

              <h3>For CSV/Excel files</h3>
              <ul>
                <li><strong>name</strong> - The joke name (required)</li>
                <li><strong>content</strong> - The joke content (optional)</li>
                <li><strong>rating</strong> - Rating 1-5 (optional)</li>
                <li><strong>duration</strong> - Duration in minutes (optional)</li>
                <li><strong>tags</strong> - Comma-separated tag names (optional)</li>
              </ul>
            </div>

            <div className={styles.fileInput}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.docx"
                onChange={handleFileSelect}
                disabled={importing}
                className={styles.input}
              />
              {importing && (
                <div className={isAiProcessing ? styles.aiLoading : styles.loading}>
                  {isAiProcessing ? 'Analyzing document with AI...' : 'Processing file...'}
                </div>
              )}
            </div>
          </>
        )}

        {result && (
          <div className={styles.results}>
            <div className={styles.summary}>
              <h3>Review Jokes</h3>
              <p>
                {selectedJokes.length} of {result.jokes.length} jokes selected
                {selectedJokes.length < result.jokes.length && (
                  <span className={styles.removedCount}>
                    {' '}({result.jokes.length - selectedJokes.length} removed)
                  </span>
                )}
              </p>
              {result.errors.length > 0 && (
                <p className={styles.errorCount}>{result.errors.length} errors found</p>
              )}
            </div>

            {result.errors.length > 0 && (
              <div className={styles.errors}>
                <h4>Errors</h4>
                <ul>
                  {result.errors.map((error, index) => (
                    <li key={index} className={styles.error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedJokes.length > 0 && (
              <div className={styles.reviewSection}>
                <h4>Click to expand, X to remove</h4>
                <div className={styles.reviewList}>
                  {selectedJokes.map((joke, index) => (
                    <div
                      key={index}
                      className={`${styles.reviewItem} ${expandedJoke === index ? styles.expanded : ''}`}
                    >
                      <div className={styles.reviewHeader}>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => handleRemoveJoke(index)}
                          title="Remove joke"
                        >
                          ×
                        </button>
                        <div
                          className={styles.reviewInfo}
                          onClick={() => toggleExpanded(index)}
                        >
                          <div className={styles.reviewName}>{joke.name}</div>
                          <div className={styles.reviewMeta}>
                            {joke.rating && `Rating: ${joke.rating}`}
                            {joke.rating && joke.duration && ' | '}
                            {joke.duration && `${joke.duration}m`}
                            {joke.tags.length > 0 && ` | ${joke.tags.join(', ')}`}
                          </div>
                        </div>
                      </div>
                      {expandedJoke === index && joke.content && (
                        <div className={styles.reviewContent}>
                          {joke.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedJokes.length === 0 && result.jokes.length > 0 && (
              <div className={styles.emptyState}>
                All jokes have been removed. Choose a different file or cancel.
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button 
          type="button" 
          className={styles.cancelBtn} 
          onClick={onCancel}
        >
          Cancel
        </button>
        
        {result && (
          <button 
            type="button" 
            className={styles.resetBtn} 
            onClick={handleReset}
          >
            Choose Different File
          </button>
        )}
        
        {result && selectedJokes.length > 0 && (
          <button
            type="button"
            className={styles.importBtn}
            onClick={handleImport}
          >
            Accept {selectedJokes.length} Remaining
          </button>
        )}
      </div>
    </div>
  )
}