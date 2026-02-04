import React, { useState, useRef, useEffect } from 'react'
import styles from './ExportButton.module.css'

interface ExportButtonProps {
  onExportCSV: () => void
  onExportDocx: () => void
  disabled?: boolean
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onExportCSV,
  onExportDocx,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = (exportFn: () => void) => {
    exportFn()
    setIsOpen(false)
  }

  return (
    <div className={styles.exportButton} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.button}
        disabled={disabled}
      >
        Export
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className={styles.dropdown}>
          <button
            onClick={() => handleExport(onExportCSV)}
            className={styles.dropdownItem}
          >
            Export as CSV
          </button>
          <button
            onClick={() => handleExport(onExportDocx)}
            className={styles.dropdownItem}
          >
            Export as DOCX
          </button>
        </div>
      )}
    </div>
  )
}
