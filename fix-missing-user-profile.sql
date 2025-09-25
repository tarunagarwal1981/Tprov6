-- Fix Missing User Profile Issue
-- The user exists in Supabase Auth but not in public.users table

-- Step 1: Check what users exist in auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 2: Check what users exist in public.users
SELECT id, email, name, role FROM public.users ORDER BY created_at DESC;

-- Step 3: Create user profile for the existing auth user
-- Replace 'aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837' with the actual user ID from step 1
INSERT INTO public.users (id, email, name, role) VALUES
  ('aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837', 'user@example.com', 'Test User', 'TRAVEL_AGENT')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Step 4: If you want to create the demo users properly, first get their auth user IDs
-- Then create profiles for them:

-- Example for demo users (replace with actual IDs from auth.users):
/*
INSERT INTO public.users (id, email, name, role) VALUES
  ('ACTUAL_AUTH_USER_ID_1', 'admin@travelbooking.com', 'Super Admin', 'SUPER_ADMIN'),
  ('ACTUAL_AUTH_USER_ID_2', 'operator@adventuretravel.com', 'Sarah Johnson', 'TOUR_OPERATOR'),
  ('ACTUAL_AUTH_USER_ID_3', 'agent@travelpro.com', 'Mike Chen', 'TRAVEL_AGENT')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();
*/

-- Step 5: Verify the user profile was created
SELECT * FROM public.users WHERE id = 'aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837';

-- Instructions:
-- 1. Run steps 1 and 2 to see what users exist
-- 2. Get the actual email for the user ID 'aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837'
-- 3. Update step 3 with the correct email
-- 4. Run step 3 to create the user profile
-- 5. Test the application - you should now be able to access the dashboard
