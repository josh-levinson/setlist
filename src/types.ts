export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Joke {
  id: string;
  name: string;
  content?: string;
  rating: number;
  duration: number; // in minutes
  tags: string[]; // array of tag IDs
}

export interface Setlist {
  id: string;
  name: string;
  jokes: Joke[];
  totalDuration: number;
} 