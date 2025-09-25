// Quick Demo Users Creation Script
// This script creates the demo users in Supabase Auth

// Instructions:
// 1. Go to your Supabase Dashboard
// 2. Navigate to Settings → API
// 3. Copy your Service Role Key
// 4. Replace 'YOUR_SERVICE_ROLE_KEY_HERE' below with your actual key
// 5. Run this script: node create-demo-auth-users.js

const SUPABASE_URL = 'https://pmadgbdfpbnhacqjxwct.supabase.co';
const SERVICE_ROLE_KEY = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Replace with your actual service role key

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
];

async function createDemoUsers() {
  if (SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('❌ Please replace YOUR_SERVICE_ROLE_KEY_HERE with your actual service role key');
    console.log('📋 Get it from: Supabase Dashboard → Settings → API → Service Role Key');
    return;
  }

  console.log('🚀 Creating demo users in Supabase Auth...');
  
  for (const user of demoUsers) {
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          user_metadata: user.user_metadata,
          email_confirm: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Created user: ${user.email} (ID: ${data.user?.id})`);
      } else {
        const error = await response.text();
        console.log(`❌ Error creating ${user.email}:`, error);
      }
    } catch (error) {
      console.log(`❌ Unexpected error for ${user.email}:`, error.message);
    }
  }
  
  console.log('🎉 Demo user creation completed!');
  console.log('📋 Next steps:');
  console.log('1. Run the demo-data.sql script in Supabase SQL Editor');
  console.log('2. Test login with the demo accounts');
}

createDemoUsers().catch(console.error);
