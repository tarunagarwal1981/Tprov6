-- =============================================
-- Fix Users Table RLS Policy (Infinite Recursion)
-- =============================================

-- First, let's check what policies exist on the users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Drop all existing policies on users table to fix infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;

-- Create simple, non-recursive policies for users table
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile (for new user creation)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Allow service role to read all users (for admin functions)
CREATE POLICY "Service role can read all users" ON public.users
    FOR SELECT USING (auth.role() = 'service_role');

-- Policy 5: Allow service role to update all users (for admin functions)
CREATE POLICY "Service role can update all users" ON public.users
    FOR UPDATE USING (auth.role() = 'service_role');

-- Policy 6: Allow service role to insert users (for admin functions)
CREATE POLICY "Service role can insert users" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Verify the policies are created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Test the query that was failing
-- This should now work without infinite recursion
SELECT role, name, profile 
FROM public.users 
WHERE id = 'aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837';
