// Demo Users Creation Script for Supabase
// This script helps create demo users in Supabase Auth

import { createClient } from '@supabase/supabase-js'

// Use your Supabase credentials
const supabaseUrl = 'https://pmadgbdfpbnhacqjxwct.supabase.co'
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE' // Replace with your actual service role key

// Create admin client for user creation
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Demo users to create
const demoUsers = [
  {
    email: 'admin@travelbooking.com',
    password: 'Admin123!',
    user_metadata: {
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  },
  {
    email: 'operator@adventuretravel.com',
    password: 'Operator123!',
    user_metadata: {
      name: 'Sarah Johnson',
      role: 'TOUR_OPERATOR'
    }
  },
  {
    email: 'agent@travelpro.com',
    password: 'Agent123!',
    user_metadata: {
      name: 'Mike Chen',
      role: 'TRAVEL_AGENT'
    }
  }
]

async function createDemoUsers() {
  console.log('🚀 Creating demo users...')
  
  for (const user of demoUsers) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true // Skip email confirmation for demo users
      })
      
      if (error) {
        console.error(`❌ Error creating user ${user.email}:`, error.message)
      } else {
        console.log(`✅ Created user: ${user.email} (ID: ${data.user?.id})`)
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${user.email}:`, err)
    }
  }
  
  console.log('🎉 Demo user creation completed!')
}

// Run the script
createDemoUsers().catch(console.error)

// Instructions:
// 1. Replace 'YOUR_SERVICE_ROLE_KEY_HERE' with your actual Supabase service role key
// 2. Run this script: node create-demo-users.js
// 3. After creating users, run the demo-data.sql script in your Supabase SQL editor
// 4. Test login with the demo accounts:
//    - admin@travelbooking.com / Admin123!
//    - operator@adventuretravel.com / Operator123!
//    - agent@travelpro.com / Agent123!
