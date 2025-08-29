import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ImportedJoke {
  name: string
  content?: string
  rating?: number
  duration?: number
  tags: string[]
}

export interface ImportResult {
  jokes: ImportedJoke[]
  errors: string[]
}

export interface ImportRow {
  name?: string
  content?: string
  rating?: string | number
  duration?: string | number
  tags?: string
}

const parseRating = (value: string | number | undefined): number | undefined => {
  if (value === undefined || value === '') return undefined
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return isNaN(num) ? undefined : Math.min(Math.max(num, 1), 5)
}

const parseDuration = (value: string | number | undefined): number | undefined => {
  if (value === undefined || value === '') return undefined
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) || num <= 0 ? undefined : num
}

const parseTags = (value: string | undefined): string[] => {
  if (!value || value.trim() === '') return []
  return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
}

const validateAndTransformRow = (row: ImportRow, index: number): { joke?: ImportedJoke, error?: string } => {
  if (!row.name || row.name.trim() === '') {
    return { error: `Row ${index + 1}: Joke name is required` }
  }

  const parsedRating = parseRating(row.rating)
  const parsedDuration = parseDuration(row.duration)

  const joke: ImportedJoke = {
    name: row.name.trim(),
    tags: parseTags(row.tags)
  }

  if (row.content && row.content.trim()) {
    joke.content = row.content.trim()
  }

  if (parsedRating !== undefined) {
    joke.rating = parsedRating
  }

  if (parsedDuration !== undefined) {
    joke.duration = parsedDuration
  }

  return { joke }
}

export const parseCSV = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const jokes: ImportedJoke[] = []
        const errors: string[] = []

        results.data.forEach((row: unknown, index: number) => {
          const result = validateAndTransformRow(row as ImportRow, index)
          if (result.error) {
            errors.push(result.error)
          } else if (result.joke) {
            jokes.push(result.joke)
          }
        })

        if (results.errors.length > 0) {
          errors.push(...results.errors.map(err => `Parse error: ${err.message}`))
        }

        resolve({ jokes, errors })
      }
    })
  })
}

export const parseExcel = (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          resolve({ jokes: [], errors: ['No sheets found in Excel file'] })
          return
        }

        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length === 0) {
          resolve({ jokes: [], errors: ['Excel file is empty'] })
          return
        }

        const headers = jsonData[0] as string[]
        const jokes: ImportedJoke[] = []
        const errors: string[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const rowData = jsonData[i] as unknown[]
          const row: ImportRow = {}
          
          headers.forEach((header, index) => {
            const normalizedHeader = header?.toLowerCase()?.trim()
            const cellValue = rowData[index]
            if (normalizedHeader === 'name') row.name = cellValue as string
            else if (normalizedHeader === 'content') row.content = cellValue as string
            else if (normalizedHeader === 'rating') row.rating = cellValue as string | number
            else if (normalizedHeader === 'duration') row.duration = cellValue as string | number
            else if (normalizedHeader === 'tags') row.tags = cellValue as string
          })

          const result = validateAndTransformRow(row, i - 1)
          if (result.error) {
            errors.push(result.error)
          } else if (result.joke) {
            jokes.push(result.joke)
          }
        }

        resolve({ jokes, errors })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read Excel file'))
    reader.readAsArrayBuffer(file)
  })
}

export const importJokes = async (file: File): Promise<ImportResult> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  
  if (fileExtension === 'csv') {
    return parseCSV(file)
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel(file)
  } else {
    return {
      jokes: [],
      errors: [`Unsupported file format: ${fileExtension}. Please use CSV or Excel files.`]
    }
  }
}