// =============================================
// TRAVEL AGENT USER CREATION SCRIPT
// Use this script to create a travel agent user via Supabase Auth API
// =============================================

import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project details
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTravelAgentUser() {
  try {
    console.log('🚀 Creating travel agent user...');

    // Create user in auth.users table
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'agent@travelplatform.com',
      password: 'SecurePassword123!',
      email_confirm: true,
      user_metadata: {
        firstName: 'John',
        lastName: 'Agent',
        phone: '+1-555-0123',
        company: 'Travel Solutions Inc',
        license: 'TA-2024-001'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created successfully:', authData.user.id);

    // Insert into public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: 'agent@travelplatform.com',
        name: 'John Travel Agent',
        role: 'TRAVEL_AGENT',
        profile: {
          firstName: 'John',
          lastName: 'Agent',
          phone: '+1-555-0123',
          company: 'Travel Solutions Inc',
          license: 'TA-2024-001',
          specializations: ['Adventure Travel', 'Cultural Tours', 'Luxury Travel'],
          experience: '5 years',
          languages: ['English', 'Spanish', 'French'],
          bio: 'Experienced travel agent specializing in adventure and cultural tours'
        },
        is_active: true
      })
      .select();

    if (userError) {
      console.error('❌ Error creating public user:', userError);
      return;
    }

    console.log('✅ Public user created successfully:', userData[0]);

    // Insert into travel_agents table
    const { data: agentData, error: agentError } = await supabase
      .from('travel_agents')
      .insert({
        user_id: authData.user.id,
        company_name: 'Travel Solutions Inc',
        license_number: 'TA-2024-001',
        commission_rate: 10.00,
        is_verified: true,
        is_active: true,
        rating: 4.9
      })
      .select();

    if (agentError) {
      console.error('❌ Error creating travel agent profile:', agentError);
      return;
    }

    console.log('✅ Travel agent profile created successfully:', agentData[0]);

    // Insert sample lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert({
        agent_id: authData.user.id,
        customer_name: 'Sarah Johnson',
        customer_email: 'sarah.johnson@email.com',
        customer_phone: '+1-555-0123',
        destination: 'Bali, Indonesia',
        budget: 3000.00,
        trip_type: 'ADVENTURE',
        travelers: 2,
        duration: 7,
        preferred_start_date: '2024-03-15',
        preferred_end_date: '2024-03-22',
        preferences: ['Beach activities', 'Cultural experiences', 'Adventure sports'],
        status: 'NEW',
        source: 'MARKETPLACE',
        notes: 'Interested in water sports and local cuisine'
      })
      .select();

    if (leadError) {
      console.error('❌ Error creating sample lead:', leadError);
      return;
    }

    console.log('✅ Sample lead created successfully:', leadData[0]);

    // Insert sample itinerary
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itineraries')
      .insert({
        lead_id: leadData[0].id,
        agent_id: authData.user.id,
        title: 'Bali Adventure Package',
        description: '7-day adventure package including water sports and cultural experiences',
        status: 'DRAFT',
        total_cost: 2800.00,
        agent_commission: 280.00,
        customer_price: 3000.00,
        start_date: '2024-03-15',
        end_date: '2024-03-22',
        duration_days: 7,
        notes: 'Waiting for client approval'
      })
      .select();

    if (itineraryError) {
      console.error('❌ Error creating sample itinerary:', itineraryError);
      return;
    }

    console.log('✅ Sample itinerary created successfully:', itineraryData[0]);

    console.log('🎉 Travel agent setup completed successfully!');
    console.log('📧 Email: agent@travelplatform.com');
    console.log('🔑 Password: SecurePassword123!');
    console.log('🆔 User ID:', authData.user.id);
    console.log('🌐 Dashboard URL: /agent/dashboard');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Alternative: Create user with custom UUID
async function createTravelAgentWithCustomUUID() {
  const customUUID = 'agent-001-uuid-here'; // Replace with your desired UUID

  try {
    console.log('🚀 Creating travel agent user with custom UUID...');

    // Create user in auth.users table with custom UUID
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      id: customUUID,
      email: 'agent@travelplatform.com',
      password: 'SecurePassword123!',
      email_confirm: true,
      user_metadata: {
        firstName: 'John',
        lastName: 'Agent',
        phone: '+1-555-0123'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError);
      return;
    }

    console.log('✅ Auth user created with custom UUID:', authData.user.id);

    // Continue with the rest of the setup...
    // (Same as above function)

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Verification function
async function verifyTravelAgentSetup() {
  try {
    console.log('🔍 Verifying travel agent setup...');

    // Check auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const agentUser = authUsers.users.find(user => user.email === 'agent@travelplatform.com');
    
    if (agentUser) {
      console.log('✅ Auth user found:', agentUser.id);
    } else {
      console.log('❌ Auth user not found');
      return;
    }

    // Check public user
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'agent@travelplatform.com')
      .single();

    if (publicError) {
      console.error('❌ Error fetching public user:', publicError);
      return;
    }

    console.log('✅ Public user found:', publicUser);

    // Check travel agent profile
    const { data: agentProfile, error: agentError } = await supabase
      .from('travel_agents')
      .select('*')
      .eq('user_id', agentUser.id)
      .single();

    if (agentError) {
      console.error('❌ Error fetching agent profile:', agentError);
      return;
    }

    console.log('✅ Travel agent profile found:', agentProfile);

    // Check sample data
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('agent_id', agentUser.id);

    if (leadsError) {
      console.error('❌ Error fetching leads:', leadsError);
      return;
    }

    console.log('✅ Sample leads found:', leads.length);

    const { data: itineraries, error: itinerariesError } = await supabase
      .from('itineraries')
      .select('*')
      .eq('agent_id', agentUser.id);

    if (itinerariesError) {
      console.error('❌ Error fetching itineraries:', itinerariesError);
      return;
    }

    console.log('✅ Sample itineraries found:', itineraries.length);

    console.log('🎉 Verification completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
  }
}

// Export functions for use
export {
  createTravelAgentUser,
  createTravelAgentWithCustomUUID,
  verifyTravelAgentSetup
};

// Run the setup if this file is executed directly
if (require.main === module) {
  createTravelAgentUser()
    .then(() => verifyTravelAgentSetup())
    .catch(console.error);
}

// =============================================
// USAGE INSTRUCTIONS
// =============================================

/*
USAGE INSTRUCTIONS:

1. INSTALLATION:
   npm install @supabase/supabase-js

2. CONFIGURATION:
   - Replace 'YOUR_SUPABASE_URL' with your actual Supabase URL
   - Replace 'YOUR_SUPABASE_SERVICE_ROLE_KEY' with your service role key
   - Get these from your Supabase project settings

3. RUN THE SCRIPT:
   node create-travel-agent-user.js

4. ALTERNATIVE METHODS:

   A. Using Supabase Dashboard:
      - Go to Authentication > Users
      - Click "Add user"
      - Fill in the details
      - Copy the UUID and use it in the SQL queries

   B. Using SQL directly:
      - Run the quick-agent-setup.sql file
      - Replace 'AGENT_UUID_HERE' with the actual UUID

   C. Using Supabase CLI:
      - Use the Supabase CLI to run the SQL files

5. VERIFICATION:
   - Run verifyTravelAgentSetup() to check everything was created correctly
   - Test login at /agent/dashboard
   - Check that the agent can see their leads and itineraries

6. CUSTOMIZATION:
   - Modify the user details as needed
   - Change the sample data
   - Adjust commission rates and business rules

7. SECURITY:
   - Use a strong password
   - Enable 2FA if needed
   - Review RLS policies
   - Test access controls

8. TROUBLESHOOTING:
   - Check Supabase logs for errors
   - Verify RLS policies are enabled
   - Ensure all tables exist
   - Check foreign key constraints
*/
