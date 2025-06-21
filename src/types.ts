export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string; // Owner of the tag
}

export interface Joke {
  id: string;
  name: string;
  content?: string;
  rating: number;
  duration: number; // in minutes
  tags: string[]; // array of tag IDs
  user_id: string; // Owner of the joke
  created_at: string;
  updated_at: string;
}

export interface Setlist {
  id: string;
  name: string;
  jokes: Joke[];
  user_id: string; // Owner of the setlist
  created_at: string;
  updated_at: string;
}

// Utility function to calculate total duration from setlist jokes
export const calculateSetlistDuration = (setlist: Setlist): number => {
  return setlist.jokes.reduce((sum, joke) => sum + joke.duration, 0);
};

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 