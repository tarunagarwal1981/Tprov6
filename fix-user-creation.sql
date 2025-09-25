-- Fix for user creation issues in Supabase
-- The handle_new_user trigger might be causing conflicts

-- First, let's check if there are any existing users in the users table that might conflict
-- Run this query in Supabase SQL Editor to check:

SELECT * FROM public.users WHERE email IN (
  'admin@travelbooking.com',
  'operator@adventuretravel.com', 
  'agent@travelpro.com'
);

-- If there are existing records, we need to either:
-- 1. Delete them first, or
-- 2. Modify the trigger to handle conflicts

-- Option 1: Delete existing demo users (if they exist)
DELETE FROM public.users WHERE email IN (
  'admin@travelbooking.com',
  'operator@adventuretravel.com',
  'agent@travelpro.com'
);

-- Option 2: Modify the trigger to handle conflicts gracefully
-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved version that handles conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle duplicate users gracefully
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'TRAVEL_AGENT')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Alternative: Temporarily disable the trigger for manual user creation
-- Uncomment the line below if you want to disable the trigger temporarily
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
