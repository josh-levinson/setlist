export interface Joke {
  id: string;
  name: string;
  content?: string;
  rating: number;
  duration: number; // in minutes
}

export interface Setlist {
  id: string;
  name: string;
  jokes: Joke[];
  totalDuration: number;
} 