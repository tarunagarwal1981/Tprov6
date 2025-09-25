-- =============================================
-- Debug User Profile Issues
-- =============================================

-- Step 1: Check what users exist in auth.users
SELECT 
  id, 
  email, 
  created_at,
  raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- Step 2: Check what users exist in public.users
SELECT 
  id, 
  email, 
  name, 
  role,
  is_active,
  created_at
FROM public.users 
ORDER BY created_at DESC;

-- Step 3: Find users that exist in auth.users but NOT in public.users
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  pu.id as profile_id,
  pu.role as profile_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Step 4: Check for role mismatches
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'role' as auth_role,
  pu.role as profile_role,
  pu.name as profile_name
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE au.raw_user_meta_data->>'role' != pu.role::text;

-- Step 5: Fix a specific user (replace with actual user ID and email)
-- First, get the user ID from auth.users
-- Then update the role in public.users

-- Example: Update user role to TOUR_OPERATOR
-- UPDATE public.users 
-- SET role = 'TOUR_OPERATOR', updated_at = NOW()
-- WHERE email = 'your-email@example.com';

-- Step 6: Create missing user profile (if needed)
-- INSERT INTO public.users (id, email, name, role, is_active, created_at)
-- VALUES (
--   'USER_ID_FROM_AUTH_USERS',
--   'email@example.com',
--   'User Name',
--   'TOUR_OPERATOR',
--   true,
--   NOW()
-- );

-- Step 7: Verify the fix
-- SELECT * FROM public.users WHERE email = 'your-email@example.com';
