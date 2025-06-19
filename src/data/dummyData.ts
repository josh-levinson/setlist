import type { Joke, Setlist } from '../types';

export const dummyJokes: Joke[] = [
  {
    id: '1',
    name: 'Airplane Food',
    content: 'Why do they call it airplane food? Because it tastes like it was made by someone who has never been to a restaurant before!',
    rating: 7.5,
    duration: 2.5,
    tags: ['1', '4'] // Clean, Observational
  },
  {
    id: '2',
    name: 'Dad Joke Classic',
    content: 'Why don\'t scientists trust atoms? Because they make up everything!',
    rating: 8.2,
    duration: 1.5,
    tags: ['1', '6'] // Clean, One-liner
  },
  {
    id: '3',
    name: 'Coffee Addiction',
    content: 'I told my wife she was drawing her eyebrows too high. She looked surprised.',
    rating: 6.8,
    duration: 2.0,
    tags: ['1', '4'] // Clean, Observational
  },
  {
    id: '4',
    name: 'Gym Motivation',
    content: 'I\'m on a seafood diet. I see food and I eat it.',
    rating: 5.5,
    duration: 1.0,
    tags: ['1', '6'] // Clean, One-liner
  },
  {
    id: '5',
    name: 'Technology Woes',
    content: 'Why did the computer go to the doctor? Because it had a virus!',
    rating: 4.2,
    duration: 1.5,
    tags: ['1', '6'] // Clean, One-liner
  },
  {
    id: '6',
    name: 'Weather Report',
    content: 'What do you call a fake noodle? An impasta!',
    rating: 7.8,
    duration: 1.0,
    tags: ['1', '6'] // Clean, One-liner
  },
  {
    id: '7',
    name: 'Animal Kingdom',
    content: 'What do you call a bear with no teeth? A gummy bear!',
    rating: 6.5,
    duration: 1.5,
    tags: ['1', '6'] // Clean, One-liner
  },
  {
    id: '8',
    name: 'Math Humor',
    content: 'Why was the math book sad? Because it had too many problems!',
    rating: 5.8,
    duration: 1.0,
    tags: ['1', '6'] // Clean, One-liner
  }
];

export const dummySetlists: Setlist[] = [
  {
    id: '1',
    name: 'Clean Comedy Night',
    jokes: [dummyJokes[0], dummyJokes[1], dummyJokes[2], dummyJokes[5]],
    totalDuration: 7.0
  },
  {
    id: '2',
    name: 'Quick One-Liners',
    jokes: [dummyJokes[1], dummyJokes[3], dummyJokes[4], dummyJokes[5], dummyJokes[6], dummyJokes[7]],
    totalDuration: 7.5
  },
  {
    id: '3',
    name: 'Observational Comedy',
    jokes: [dummyJokes[0], dummyJokes[2]],
    totalDuration: 4.5
  }
]; 