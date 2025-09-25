-- =============================================
-- Fix User Profile Issues
-- =============================================

-- Step 1: Check what's in your database
SELECT 
  'auth.users' as table_name,
  id, 
  email, 
  created_at,
  raw_user_meta_data->>'role' as metadata_role
FROM auth.users 
WHERE email IN ('operator@adventuretravel.com', 'user@example.com')
UNION ALL
SELECT 
  'public.users' as table_name,
  id, 
  email, 
  created_at,
  role as metadata_role
FROM public.users 
WHERE email IN ('operator@adventuretravel.com', 'user@example.com')
ORDER BY table_name, email;

-- Step 2: Check if there's a mismatch
-- The issue is that the user ID 'aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837' 
-- belongs to 'user@example.com' but you're logging in as 'operator@adventuretravel.com'

-- Step 3: Get the correct user ID for operator@adventuretravel.com
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'operator@adventuretravel.com';

-- Step 4: Update the user profile to match the correct user
-- Replace 'CORRECT_USER_ID' with the ID from step 3
UPDATE public.users 
SET 
  email = 'operator@adventuretravel.com',
  name = 'Sarah Johnson',
  role = 'TOUR_OPERATOR',
  updated_at = NOW()
WHERE id = 'CORRECT_USER_ID';

-- Step 5: If the operator user doesn't have a profile, create one
-- First get the user ID from auth.users
-- Then create the profile
INSERT INTO public.users (id, email, name, role, is_active, created_at)
SELECT 
  au.id,
  au.email,
  'Sarah Johnson',
  'TOUR_OPERATOR',
  true,
  NOW()
FROM auth.users au
WHERE au.email = 'operator@adventuretravel.com'
AND NOT EXISTS (
  SELECT 1 FROM public.users pu 
  WHERE pu.id = au.id
);

-- Step 6: Verify the fix
SELECT * FROM public.users WHERE email = 'operator@adventuretravel.com';
