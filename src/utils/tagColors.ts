import type { Tag } from '../types'

// Predefined color palette for tags
const TAG_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F', // Light Yellow
  '#BB8FCE', // Light Purple
  '#85C1E9', // Light Blue
  '#F8C471', // Orange
  '#82E0AA', // Light Green
  '#F1948A', // Light Red
  '#85929E', // Gray
  '#D7BDE2', // Lavender
]

/**
 * Find an existing tag by name (case-insensitive) and return its color
 */
export function findExistingTagColor(tagName: string, existingTags: Tag[]): string | null {
  const existingTag = existingTags.find(
    tag => tag.name.toLowerCase() === tagName.toLowerCase()
  )
  return existingTag?.color || null
}

/**
 * Generate a random color from the predefined palette
 */
export function generateRandomTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
}

/**
 * Get a color for a tag name, either from existing tags or generate a new one
 */
export function getTagColor(tagName: string, existingTags: Tag[]): string {
  const existingColor = findExistingTagColor(tagName, existingTags)
  return existingColor || generateRandomTagColor()
}

/**
 * Generate colors for multiple tag names, ensuring no duplicates within the batch
 */
export function generateTagColors(tagNames: string[], existingTags: Tag[]): Record<string, string> {
  const usedColors = new Set(existingTags.map(tag => tag.color))
  const availableColors = TAG_COLORS.filter(color => !usedColors.has(color))
  const result: Record<string, string> = {}

  let colorIndex = 0

  for (const tagName of tagNames) {
    const existingColor = findExistingTagColor(tagName, existingTags)

    if (existingColor) {
      result[tagName] = existingColor
    } else {
      // Use available colors first, then cycle through all colors
      if (colorIndex < availableColors.length) {
        result[tagName] = availableColors[colorIndex]
      } else {
        result[tagName] = TAG_COLORS[colorIndex % TAG_COLORS.length]
      }
      colorIndex++
    }
  }

  return result
}
