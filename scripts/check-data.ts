import { createClient } from '@supabase/supabase-js'

// Get environment variables for Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('💡 Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const checkData = async (userId?: string) => {
  try {
    console.log('🔍 Checking database for data...')
    console.log(`🔗 Supabase URL: ${supabaseUrl}`)
    
    // Check tags
    console.log('\n🏷️  Checking tags...')
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .limit(10)
    
    if (tagsError) {
      console.error('❌ Error fetching tags:', tagsError.message)
    } else {
      console.log(`✅ Found ${tags?.length || 0} tags`)
      if (tags && tags.length > 0) {
        console.log('Sample tags:', tags.slice(0, 3).map(t => ({ id: t.id, name: t.name, user_id: t.user_id })))
      }
    }
    
    // Check jokes
    console.log('\n😄 Checking jokes...')
    const { data: jokes, error: jokesError } = await supabase
      .from('jokes')
      .select('*')
      .limit(10)
    
    if (jokesError) {
      console.error('❌ Error fetching jokes:', jokesError.message)
    } else {
      console.log(`✅ Found ${jokes?.length || 0} jokes`)
      if (jokes && jokes.length > 0) {
        console.log('Sample jokes:', jokes.slice(0, 3).map(j => ({ id: j.id, name: j.name, user_id: j.user_id })))
      }
    }
    
    // Check setlists
    console.log('\n📋 Checking setlists...')
    const { data: setlists, error: setlistsError } = await supabase
      .from('setlists')
      .select('*')
      .limit(10)
    
    if (setlistsError) {
      console.error('❌ Error fetching setlists:', setlistsError.message)
    } else {
      console.log(`✅ Found ${setlists?.length || 0} setlists`)
      if (setlists && setlists.length > 0) {
        console.log('Sample setlists:', setlists.slice(0, 3).map(s => ({ id: s.id, name: s.name, user_id: s.user_id })))
      }
    }
    
    // Check setlist_jokes
    console.log('\n🔗 Checking setlist_jokes...')
    const { data: setlistJokes, error: setlistJokesError } = await supabase
      .from('setlist_jokes')
      .select('*')
      .limit(10)
    
    if (setlistJokesError) {
      console.error('❌ Error fetching setlist_jokes:', setlistJokesError.message)
    } else {
      console.log(`✅ Found ${setlistJokes?.length || 0} setlist_jokes`)
      if (setlistJokes && setlistJokes.length > 0) {
        console.log('Sample setlist_jokes:', setlistJokes.slice(0, 3))
      }
    }
    
    // If user ID provided, check data for that specific user
    if (userId) {
      console.log(`\n👤 Checking data for user: ${userId}`)
      
      const { data: userTags, error: userTagsError } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
      
      const { data: userJokes, error: userJokesError } = await supabase
        .from('jokes')
        .select('*')
        .eq('user_id', userId)
      
      const { data: userSetlists, error: userSetlistsError } = await supabase
        .from('setlists')
        .select('*')
        .eq('user_id', userId)
      
      console.log(`📊 User data summary:`)
      console.log(`   Tags: ${userTags?.length || 0}`)
      console.log(`   Jokes: ${userJokes?.length || 0}`)
      console.log(`   Setlists: ${userSetlists?.length || 0}`)
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// CLI usage
if (require.main === module) {
  const userId = process.argv[2]
  checkData(userId)
}

export { checkData } 