-- =============================================
-- Create Tour Operator Profile for Current User
-- =============================================

-- This script ensures that the current authenticated user has a tour operator profile
-- Run this in Supabase SQL Editor after logging in as operator@adventuretravel.com

-- Step 1: Check if tour operator profile exists for the current user
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  to.id as tour_operator_id,
  to.company_name,
  to.is_verified
FROM public.users u
LEFT JOIN public.tour_operators to ON u.id = to.user_id
WHERE u.email = 'operator@adventuretravel.com';

-- Step 2: If no tour operator profile exists, create one
-- First, get the user ID
DO $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get the user ID for operator@adventuretravel.com
  SELECT id INTO user_uuid 
  FROM public.users 
  WHERE email = 'operator@adventuretravel.com';
  
  -- Check if tour operator profile exists
  IF NOT EXISTS (
    SELECT 1 FROM public.tour_operators 
    WHERE user_id = user_uuid
  ) THEN
    -- Create tour operator profile
    INSERT INTO public.tour_operators (
      user_id,
      company_name,
      company_details,
      commission_rates,
      licenses,
      certifications,
      is_verified,
      rating,
      review_count
    ) VALUES (
      user_uuid,
      'Adventure Travel Company',
      '{"legalName": "Adventure Travel Company", "registrationNumber": "ATC-2024-001", "taxId": "TAX-ATC-001", "website": "https://adventuretravel.com", "phone": "+1-555-0123", "address": {"street": "123 Adventure Street", "city": "San Francisco", "state": "CA", "country": "USA", "postalCode": "94102"}}',
      '{"standard": 15.0, "premium": 20.0, "luxury": 25.0}',
      '[]',
      '[]',
      true,
      0.0,
      0
    );
    
    RAISE NOTICE 'Tour operator profile created for user: %', user_uuid;
  ELSE
    RAISE NOTICE 'Tour operator profile already exists for user: %', user_uuid;
  END IF;
END $$;

-- Step 3: Verify the tour operator profile was created
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  u.role,
  to.id as tour_operator_id,
  to.company_name,
  to.is_verified,
  to.created_at
FROM public.users u
JOIN public.tour_operators to ON u.id = to.user_id
WHERE u.email = 'operator@adventuretravel.com';
