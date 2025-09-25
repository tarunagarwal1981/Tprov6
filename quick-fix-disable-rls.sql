-- =============================================
-- QUICK FIX: Temporarily Disable RLS for Testing
-- =============================================

-- Temporarily disable RLS on users table to test authentication
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Test the query that was failing
SELECT role, name, profile 
FROM public.users 
WHERE id = 'aaec6dc9-7ab5-4dd5-bf6f-e2472d3d2837';

-- If the above works, you can re-enable RLS later with proper policies
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
