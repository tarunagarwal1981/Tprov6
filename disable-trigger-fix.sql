-- Quick Fix: Temporarily Disable User Creation Trigger
-- This will allow you to create users in Supabase Auth without database conflicts

-- Step 1: Disable the trigger that's causing the issue
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Now you can create users in Supabase Auth Dashboard
-- Go to Authentication → Users → Add User and create:
-- - admin@travelbooking.com / Admin123!
-- - operator@adventuretravel.com / Operator123!
-- - agent@travelpro.com / Agent123!

-- Step 3: After creating auth users, manually insert their profiles
INSERT INTO public.users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@travelbooking.com', 'Super Admin', 'SUPER_ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'operator@adventuretravel.com', 'Sarah Johnson', 'TOUR_OPERATOR'),
  ('00000000-0000-0000-0000-000000000003', 'agent@travelpro.com', 'Mike Chen', 'TRAVEL_AGENT')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Step 4: Re-enable the trigger for future users (optional)
-- Uncomment the lines below if you want to re-enable the trigger:
/*
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
*/

-- Instructions:
-- 1. Run this SQL script in Supabase SQL Editor
-- 2. Go to Supabase Dashboard → Authentication → Users
-- 3. Create the demo users manually
-- 4. The user profiles will be created automatically via the INSERT statements above
