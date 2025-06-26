import { supabase } from '../src/lib/supabase'

// Script to create a test user for seeding
const createTestUser = async () => {
  try {
    console.log('🔧 Creating test user for seeding...')
    
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })
    
    if (error) {
      console.error('❌ Error creating test user:', error.message)
      process.exit(1)
    }
    
    if (!data.user) {
      console.error('❌ No user created')
      process.exit(1)
    }
    
    console.log('✅ Test user created successfully!')
    console.log('🆔 User ID:', data.user.id)
    console.log('📧 Email:', testEmail)
    console.log('🔑 Password:', testPassword)
    console.log('')
    console.log('💡 You can now use this ID with the seed script:')
    console.log(`   bun run seed ${data.user.id}`)
    console.log('')
    console.log('⚠️  Note: This is a test user. You may want to delete it later.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser()
}

export { createTestUser } 