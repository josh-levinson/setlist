import type { Joke, Setlist } from '../types';

export const dummyJokes: Joke[] = [
  {
    id: '1',
    name: 'The Classic Knock Knock',
    content: 'Knock knock. Who\'s there? Boo. Boo who? Don\'t cry, it\'s just a joke!',
    rating: 4,
    duration: 1.5,
    tags: ['clean', 'classic'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'The One-Liner',
    content: 'I told my wife she was drawing her eyebrows too high. She looked surprised.',
    rating: 5,
    duration: 1.0,
    tags: ['observational', 'marriage'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'The Dad Joke',
    content: 'Why don\'t scientists trust atoms? Because they make up everything!',
    rating: 3,
    duration: 2.0,
    tags: ['science', 'dad-joke'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'The Office Joke',
    content: 'Why did the scarecrow win an award? Because he was outstanding in his field!',
    rating: 4,
    duration: 1.5,
    tags: ['work', 'clean'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'The Animal Joke',
    content: 'What do you call a bear with no teeth? A gummy bear!',
    rating: 3,
    duration: 1.0,
    tags: ['animals', 'clean'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'The Food Joke',
    content: 'Why did the tomato turn red? Because it saw the salad dressing!',
    rating: 2,
    duration: 1.5,
    tags: ['food', 'clean'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'The Technology Joke',
    content: 'Why do programmers prefer dark mode? Because light attracts bugs!',
    rating: 4,
    duration: 1.0,
    tags: ['technology', 'work'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'The Travel Joke',
    content: 'Why don\'t eggs tell jokes? They\'d crack each other up!',
    rating: 3,
    duration: 1.0,
    tags: ['food', 'clean'],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const dummySetlists: Setlist[] = [
  {
    id: '1',
    name: 'Clean Comedy Night',
    jokes: [dummyJokes[0], dummyJokes[1], dummyJokes[2], dummyJokes[5]],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Quick One-Liners',
    jokes: [dummyJokes[1], dummyJokes[3], dummyJokes[4], dummyJokes[5], dummyJokes[6], dummyJokes[7]],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Observational Comedy',
    jokes: [dummyJokes[0], dummyJokes[2]],
    user_id: 'dummy-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]; 