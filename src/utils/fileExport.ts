import Papa from 'papaparse'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from 'docx'
import type { Joke, Setlist, Tag } from '../types'
import { formatSecondsToMMSS } from './duration'

interface JokeExportRow {
  name: string
  content: string
  rating: string
  duration: string
  tags: string
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const getTagNames = (tagIds: string[], tags: Tag[]): string => {
  return tagIds
    .map(id => tags.find(t => t.id === id)?.name)
    .filter(Boolean)
    .join(', ')
}

const jokeToExportRow = (joke: Joke, tags: Tag[]): JokeExportRow => ({
  name: joke.name,
  content: joke.content || '',
  rating: joke.rating?.toString() || '',
  duration: joke.duration?.toString() || '',
  tags: getTagNames(joke.tags, tags),
})

// CSV Export Functions

export const exportJokesToCSV = (jokes: Joke[], tags: Tag[]) => {
  const rows = jokes.map(joke => jokeToExportRow(joke, tags))
  const csv = Papa.unparse(rows, {
    columns: ['name', 'content', 'rating', 'duration', 'tags'],
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, 'jokes.csv')
}

export const exportSetlistToCSV = (setlist: Setlist, tags: Tag[]) => {
  const rows = setlist.jokes.map(joke => jokeToExportRow(joke, tags))
  const csv = Papa.unparse(rows, {
    columns: ['name', 'content', 'rating', 'duration', 'tags'],
  })
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const filename = `${setlist.name.replace(/[^a-z0-9]/gi, '_')}.csv`
  downloadFile(blob, filename)
}

// DOCX Export Functions

const createJokeParagraphs = (joke: Joke, tags: Tag[], index?: number): Paragraph[] => {
  const paragraphs: Paragraph[] = []

  // Joke name as heading
  const nameText = index !== undefined ? `${index + 1}. ${joke.name}` : joke.name
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: nameText, bold: true, size: 28 })],
      spacing: { before: 240, after: 120 },
    })
  )

  // Content
  if (joke.content) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: joke.content, size: 24 })],
        spacing: { after: 120 },
      })
    )
  }

  // Metadata line
  const metaParts: string[] = []
  if (joke.rating) metaParts.push(`Rating: ${joke.rating}/5`)
  if (joke.duration) metaParts.push(`Duration: ${formatSecondsToMMSS(joke.duration)}`)
  const tagNames = getTagNames(joke.tags, tags)
  if (tagNames) metaParts.push(`Tags: ${tagNames}`)

  if (metaParts.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: metaParts.join(' | '), size: 20, italics: true, color: '666666' })],
        spacing: { after: 200 },
      })
    )
  }

  return paragraphs
}

export const exportJokesToDocx = async (jokes: Joke[], tags: Tag[]) => {
  const children: Paragraph[] = [
    new Paragraph({
      text: 'My Jokes',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `${jokes.length} jokes exported`, size: 22, color: '666666' })],
      spacing: { after: 400 },
    }),
  ]

  jokes.forEach(joke => {
    children.push(...createJokeParagraphs(joke, tags))
  })

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  downloadFile(blob, 'jokes.docx')
}

export const exportSetlistToDocx = async (setlist: Setlist, tags: Tag[]) => {
  const totalDuration = setlist.jokes.reduce((sum, j) => sum + (j.duration || 0), 0)
  const avgRating = setlist.jokes.length > 0
    ? (setlist.jokes.reduce((sum, j) => sum + (j.rating || 0), 0) / setlist.jokes.length).toFixed(1)
    : '0.0'

  const children: Paragraph[] = [
    new Paragraph({
      text: setlist.name,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${setlist.jokes.length} jokes | ${formatSecondsToMMSS(totalDuration)} total | Avg rating: ${avgRating}`,
          size: 22,
          color: '666666',
        }),
      ],
      spacing: { after: 400 },
    }),
  ]

  setlist.jokes.forEach((joke, index) => {
    children.push(...createJokeParagraphs(joke, tags, index))
  })

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `${setlist.name.replace(/[^a-z0-9]/gi, '_')}.docx`
  downloadFile(blob, filename)
}
