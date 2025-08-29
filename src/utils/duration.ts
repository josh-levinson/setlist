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