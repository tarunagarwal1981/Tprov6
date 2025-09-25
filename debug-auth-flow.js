#!/usr/bin/env node

/**
 * Debug Authentication Flow
 * 
 * This script helps debug authentication issues by checking:
 * 1. Supabase connection
 * 2. User profiles in database
 * 3. Role assignments
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function debugAuthFlow() {
  console.log('🔍 Debugging Authentication Flow...');
  console.log('');

  try {
    // 1. Check Supabase connection
    console.log('1️⃣ Testing Supabase connection...');
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (!testResponse.ok) {
      console.error('❌ Supabase connection failed:', testResponse.status);
      return;
    }
    console.log('✅ Supabase connection successful');
    console.log('');

    // 2. Get all users from auth.users
    console.log('2️⃣ Checking auth.users...');
    const authUsersResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (authUsersResponse.ok) {
      const authUsers = await authUsersResponse.json();
      console.log(`✅ Found ${authUsers.users.length} users in auth.users:`);
      authUsers.users.forEach(user => {
        console.log(`   📧 ${user.email} (ID: ${user.id})`);
        console.log(`   📝 Metadata:`, user.user_metadata);
      });
    } else {
      console.error('❌ Failed to fetch auth users:', authUsersResponse.status);
    }
    console.log('');

    // 3. Get all users from public.users
    console.log('3️⃣ Checking public.users...');
    const publicUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (publicUsersResponse.ok) {
      const publicUsers = await publicUsersResponse.json();
      console.log(`✅ Found ${publicUsers.length} users in public.users:`);
      publicUsers.forEach(user => {
        console.log(`   📧 ${user.email} (ID: ${user.id})`);
        console.log(`   👤 Name: ${user.name}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   ✅ Active: ${user.is_active}`);
        console.log('');
      });
    } else {
      console.error('❌ Failed to fetch public users:', publicUsersResponse.status);
    }

    // 4. Check for mismatches
    console.log('4️⃣ Checking for mismatches...');
    if (authUsersResponse.ok && publicUsersResponse.ok) {
      const authUsers = await authUsersResponse.json();
      const publicUsers = await publicUsersResponse.json();
      
      const authUserIds = new Set(authUsers.users.map(u => u.id));
      const publicUserIds = new Set(publicUsers.map(u => u.id));
      
      // Find users in auth but not in public
      const missingInPublic = authUsers.users.filter(u => !publicUserIds.has(u.id));
      if (missingInPublic.length > 0) {
        console.log('⚠️  Users in auth.users but NOT in public.users:');
        missingInPublic.forEach(user => {
          console.log(`   📧 ${user.email} (ID: ${user.id})`);
        });
      } else {
        console.log('✅ All auth users have profiles in public.users');
      }
      
      // Find users in public but not in auth
      const missingInAuth = publicUsers.filter(u => !authUserIds.has(u.id));
      if (missingInAuth.length > 0) {
        console.log('⚠️  Users in public.users but NOT in auth.users:');
        missingInAuth.forEach(user => {
          console.log(`   📧 ${user.email} (ID: ${user.id})`);
        });
      } else {
        console.log('✅ All public users have auth accounts');
      }
    }

  } catch (error) {
    console.error('💥 Error during debug:', error.message);
  }
}

// Run the debug script
debugAuthFlow().catch(console.error);
