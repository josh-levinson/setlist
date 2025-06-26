import { createClient } from '@supabase/supabase-js'
import type { Joke, Setlist, Tag } from '../src/types'

// Get environment variables for Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('💡 Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set')
  console.log('💡 You can also set SUPABASE_URL and SUPABASE_ANON_KEY for CLI usage')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample data for generating random content
const jokeNames = [
  'The Classic Knock Knock',
  'The One-Liner',
  'The Dad Joke',
  'The Office Joke',
  'The Animal Joke',
  'The Food Joke',
  'The Technology Joke',
  'The Travel Joke',
  'The Marriage Joke',
  'The Parenting Joke',
  'The Gym Joke',
  'The Coffee Joke',
  'The Weather Joke',
  'The Shopping Joke',
  'The Restaurant Joke',
  'The Doctor Joke',
  'The Teacher Joke',
  'The Student Joke',
  'The Neighbor Joke',
  'The Traffic Joke'
]

const jokeContents = [
  "Knock knock. Who's there? Boo. Boo who? Don't cry, it's just a joke!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why did the tomato turn red? Because it saw the salad dressing!",
  "Why do programmers prefer dark mode? Because light attracts bugs!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "My wife told me to stop impersonating a flamingo. I had to put my foot down.",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
  "I used to be a baker, but I couldn't make enough dough.",
  "What do you call a fake noodle? An impasta!",
  "Why did the math book look so sad? Because it had too many problems.",
  "I'm on a seafood diet. I see food and I eat it.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "What do you call a can opener that doesn't work? A can't opener!",
  "I'm so good at sleeping, I can do it with my eyes closed.",
  "Why did the golfer bring two pairs of pants? In case he got a hole in one!",
  "What do you call a bear with no teeth? A gummy bear!",
  "I'm terrible at telling jokes. I always forget the punchline...",
  "Why did the cookie go to the doctor? Because it was feeling crumbly!",
  "What do you call a fish wearing a bowtie? So-fish-ticated!",
  "I'm reading a book about mazes. I got lost in it.",
  "Why don't oysters donate to charity? Because they're shellfish!",
  "What do you call a dinosaur that crashes his car? Tyrannosaurus wrecks!",
  "I'm so good at sleeping, I can do it with my eyes closed.",
  "Why did the scarecrow win an award? Because he was outstanding in his field!",
  "What do you call a fake noodle? An impasta!",
  "I'm on a seafood diet. I see food and I eat it."
]

const tagNames = [
  'clean', 'classic', 'observational', 'marriage', 'science', 'dad-joke',
  'work', 'animals', 'food', 'technology', 'travel', 'parenting', 'gym',
  'coffee', 'weather', 'shopping', 'restaurant', 'doctor', 'teacher',
  'student', 'neighbor', 'traffic', 'pun', 'one-liner', 'story', 'callback'
]

const tagColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
  '#F1948A', '#85C1E9', '#F7DC6F', '#D7BDE2', '#A9CCE3', '#FAD7A0',
  '#ABEBC6', '#F9E79F', '#D5A6BD', '#A3E4D7', '#F8C471', '#D2B4DE'
]

const setlistNames = [
  'Clean Comedy Night',
  'Quick One-Liners',
  'Observational Comedy',
  'Dad Jokes Galore',
  'Workplace Humor',
  'Family-Friendly Set',
  'Late Night Material',
  'Crowd Work Heavy',
  'Storytelling Set',
  'Improv Night',
  'Roast Battle',
  'Comedy Workshop',
  'Open Mic Night',
  'Corporate Event',
  'Wedding Reception',
  'Birthday Party',
  'Bar Comedy',
  'Club Set',
  'Theater Performance',
  'Podcast Guest'
]

// Utility functions
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const randomFloat = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

const generateRandomId = (): string => {
  // Generate a proper UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

const generateRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

// Generate random tags
const generateTags = async (userId: string, count: number = 15): Promise<Tag[]> => {
  const tags: Tag[] = []
  
  for (let i = 0; i < count; i++) {
    const tag: Tag = {
      id: generateRandomId(),
      name: randomElement(tagNames),
      color: randomElement(tagColors),
      user_id: userId
    }
    tags.push(tag)
  }
  
  // Remove duplicates based on name
  const uniqueTags = tags.filter((tag, index, self) => 
    index === self.findIndex(t => t.name === tag.name)
  )
  
  return uniqueTags
}

// Generate random jokes
const generateJokes = async (userId: string, tags: Tag[], count: number = 50): Promise<Joke[]> => {
  const jokes: Joke[] = []
  const startDate = new Date('2023-01-01')
  const endDate = new Date()
  
  for (let i = 0; i < count; i++) {
    const jokeTags = tags
      .sort(() => 0.5 - Math.random())
      .slice(0, randomInt(1, 4))
      .map(tag => tag.id)
    
    const joke: Joke = {
      id: generateRandomId(),
      name: randomElement(jokeNames),
      content: randomElement(jokeContents),
      rating: randomInt(1, 5),
      duration: randomFloat(0.5, 5.0),
      tags: jokeTags,
      user_id: userId,
      created_at: generateRandomDate(startDate, endDate),
      updated_at: generateRandomDate(startDate, endDate)
    }
    jokes.push(joke)
  }
  
  return jokes
}

// Generate random setlists
const generateSetlists = async (userId: string, jokes: Joke[], count: number = 10): Promise<Setlist[]> => {
  const setlists: Setlist[] = []
  const startDate = new Date('2023-01-01')
  const endDate = new Date()
  
  for (let i = 0; i < count; i++) {
    const setlistJokes = jokes
      .sort(() => 0.5 - Math.random())
      .slice(0, randomInt(3, 8))
    
    const setlist: Setlist = {
      id: generateRandomId(),
      name: randomElement(setlistNames),
      jokes: setlistJokes,
      user_id: userId,
      created_at: generateRandomDate(startDate, endDate),
      updated_at: generateRandomDate(startDate, endDate)
    }
    setlists.push(setlist)
  }
  
  return setlists
}

// Main seeding function
export const seedDatabase = async (userId: string, options: {
  jokeCount?: number
  setlistCount?: number
  tagCount?: number
} = {}) => {
  const {
    jokeCount = 50,
    setlistCount = 10,
    tagCount = 15
  } = options
  
  console.log('🌱 Starting database seeding...')
  console.log(`📊 Generating ${tagCount} tags, ${jokeCount} jokes, and ${setlistCount} setlists`)
  console.log(`👤 User ID: ${userId}`)
  console.log(`🔗 Supabase URL: ${supabaseUrl}`)
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('jokes')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message)
      console.log('💡 Check your Supabase URL and API key')
      throw testError
    }
    
    console.log('✅ Database connection successful')
    
    // Generate tags
    console.log('🏷️  Generating tags...')
    const tags = await generateTags(userId, tagCount)
    
    // Insert tags into database
    console.log('📝 Inserting tags...')
    for (const tag of tags) {
      const { error } = await supabase.from('tags').insert(tag)
      if (error) {
        console.error('❌ Error inserting tag:', error.message)
        console.error('Tag data:', tag)
        throw error
      }
    }
    console.log(`✅ Created ${tags.length} tags`)
    
    // Generate jokes
    console.log('😄 Generating jokes...')
    const jokes = await generateJokes(userId, tags, jokeCount)
    
    // Insert jokes into database
    console.log('📝 Inserting jokes...')
    for (const joke of jokes) {
      const { error } = await supabase.from('jokes').insert(joke)
      if (error) {
        console.error('❌ Error inserting joke:', error.message)
        console.error('Joke data:', joke)
        throw error
      }
    }
    console.log(`✅ Created ${jokes.length} jokes`)
    
    // Generate setlists
    console.log('📋 Generating setlists...')
    const setlists = await generateSetlists(userId, jokes, setlistCount)
    
    // Insert setlists and their joke associations
    console.log('📝 Inserting setlists...')
    for (const setlist of setlists) {
      const { jokes: setlistJokes, ...setlistData } = setlist
      
      // Insert setlist
      const { data: setlistResult, error: setlistError } = await supabase
        .from('setlists')
        .insert(setlistData)
        .select()
        .single()
      
      if (setlistError) {
        console.error('❌ Error inserting setlist:', setlistError.message)
        console.error('Setlist data:', setlistData)
        throw setlistError
      }
      
      if (setlistResult) {
        // Insert joke associations
        const jokeAssociations = setlistJokes.map(joke => ({
          setlist_id: setlistResult.id,
          joke_id: joke.id
        }))
        
        const { error: associationError } = await supabase
          .from('setlist_jokes')
          .insert(jokeAssociations)
        
        if (associationError) {
          console.error('❌ Error inserting joke associations:', associationError.message)
          throw associationError
        }
      }
    }
    console.log(`✅ Created ${setlists.length} setlists`)
    
    console.log('🎉 Database seeding completed successfully!')
    
    return {
      tags: tags.length,
      jokes: jokes.length,
      setlists: setlists.length
    }
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// CLI usage
if (require.main === module) {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Please provide a user ID as an argument')
    console.log('Usage: bun run scripts/seed.ts <user-id>')
    process.exit(1)
  }
  
  const jokeCount = parseInt(process.argv[3]) || 50
  const setlistCount = parseInt(process.argv[4]) || 10
  const tagCount = parseInt(process.argv[5]) || 15
  
  seedDatabase(userId, { jokeCount, setlistCount, tagCount })
    .then((result) => {
      console.log('📈 Seeding Summary:', result)
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
} 