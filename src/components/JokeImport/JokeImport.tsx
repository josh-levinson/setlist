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
    if (result && result.jokes.length > 0) {
      onImport(result.jokes)
    }
  }

  const handleReset = () => {
    setResult(null)
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
              <h3>Import Results</h3>
              <p>{result.jokes.length} jokes ready to import</p>
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

            {result.jokes.length > 0 && (
              <div className={styles.preview}>
                <h4>Preview ({result.jokes.length} jokes)</h4>
                <div className={styles.jokesList}>
                  {result.jokes.slice(0, 5).map((joke, index) => (
                    <div key={index} className={styles.jokePreview}>
                      <div className={styles.jokeName}>{joke.name}</div>
                      <div className={styles.jokeDetails}>
                        {joke.rating && `Rating: ${joke.rating}`}
                        {joke.rating && joke.duration && ' | '}
                        {joke.duration && `Duration: ${joke.duration}m`}
                        {joke.tags.length > 0 && ` | Tags: ${joke.tags.join(', ')}`}
                      </div>
                    </div>
                  ))}
                  {result.jokes.length > 5 && (
                    <div className={styles.moreIndicator}>
                      ...and {result.jokes.length - 5} more jokes
                    </div>
                  )}
                </div>
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
        
        {result && result.jokes.length > 0 && (
          <button 
            type="button" 
            className={styles.importBtn} 
            onClick={handleImport}
          >
            Import {result.jokes.length} Jokes
          </button>
        )}
      </div>
    </div>
  )
}