import { supabase } from '../src/lib/supabase'

// Simple script to help get a user ID for seeding
const getCurrentUserId = async () => {
  try {
    console.log('🔍 Checking for authenticated user...')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('ℹ️  No authenticated user found in this context')
      console.log('')
      console.log('💡 This is normal when running scripts from CLI')
      console.log('')
      console.log('📋 To get a user ID for seeding, you have a few options:')
      console.log('')
      console.log('1. 🖥️  Check your browser console while logged into the app:')
      console.log('   - Open your app in the browser')
      console.log('   - Open DevTools (F12)')
      console.log('   - In the console, run: supabase.auth.getUser()')
      console.log('   - Copy the user.id value')
      console.log('')
      console.log('2. 🗄️  Check your database directly:')
      console.log('   - Go to your Supabase dashboard')
      console.log('   - Navigate to Authentication > Users')
      console.log('   - Copy any user ID from the list')
      console.log('')
      console.log('3. 🧪 Use a test user ID:')
      console.log('   - You can use any UUID format like:')
      console.log('   - 00000000-0000-0000-0000-000000000001')
      console.log('')
      console.log('4. 🔧 Create a test user programmatically:')
      console.log('   - Use the createUser script (if available)')
      console.log('')
      console.log('🚀 Once you have a user ID, run:')
      console.log('   bun run seed <user-id>')
      
      process.exit(0)
    }
    
    if (!user) {
      console.log('❌ No user found')
      console.log('💡 Please log in to your application first')
      process.exit(1)
    }
    
    console.log('✅ Current user ID:', user.id)
    console.log('📧 Email:', user.email)
    console.log('')
    console.log('💡 You can now use this ID with the seed script:')
    console.log(`   bun run seed ${user.id}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  getCurrentUserId()
}

export { getCurrentUserId } 