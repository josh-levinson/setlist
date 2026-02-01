export const formatSecondsToMMSS = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const parseMMSSToSeconds = (input: string): number => {
  if (!input || input.trim() === '') return 0;
  
  const trimmed = input.trim();
  
  // Handle just seconds (e.g., "30")
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  
  // Handle MM:SS format (e.g., "1:30", "0:45")
  const mmssMatch = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (mmssMatch) {
    const minutes = parseInt(mmssMatch[1], 10);
    const seconds = parseInt(mmssMatch[2], 10);
    
    // Validate seconds are < 60
    if (seconds >= 60) {
      throw new Error('Seconds must be less than 60');
    }
    
    return minutes * 60 + seconds;
  }
  
  // Handle M: format (e.g., "2:" = 2:00)
  const mMatch = trimmed.match(/^(\d+):$/);
  if (mMatch) {
    return parseInt(mMatch[1], 10) * 60;
  }
  
  throw new Error('Invalid time format. Use MM:SS, M:, or just seconds');
};

// Speaking speed for comedy delivery (words per minute)
// Conversational speech is ~120-150 WPM, comedy is slower due to timing/pauses
const SPEAKING_WORDS_PER_MINUTE = 130;

export const estimateDurationFromText = (text: string): number => {
  if (!text || text.trim() === '') return 0;

  // Count words by splitting on whitespace
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate duration in seconds
  const minutes = wordCount / SPEAKING_WORDS_PER_MINUTE;
  const seconds = Math.round(minutes * 60);

  return seconds;
};

export const validateDurationInput = (input: string): string | null => {
  if (!input || input.trim() === '') return null;
  
  try {
    const seconds = parseMMSSToSeconds(input);
    if (seconds < 0) {
      return 'Duration must be positive';
    }
    if (seconds > 3600) { // 1 hour limit
      return 'Duration must be less than 1 hour';
    }
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid format';
  }
};