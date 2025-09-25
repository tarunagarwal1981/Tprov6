-- =============================================
-- Auto Create Tour Operator Profile
-- =============================================

-- This script automatically creates a tour operator profile for any user
-- who has the TOUR_OPERATOR role but doesn't have a profile yet

-- Step 1: Create tour operator profiles for all TOUR_OPERATOR users who don't have one
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
)
SELECT 
  u.id as user_id,
  COALESCE(u.name || ' Travel Company', 'Travel Company') as company_name,
  jsonb_build_object(
    'legalName', COALESCE(u.name || ' Travel Company', 'Travel Company'),
    'registrationNumber', 'REG-' || substr(u.id::text, 1, 8),
    'taxId', 'TAX-' || substr(u.id::text, 1, 8),
    'website', 'https://' || lower(replace(u.name, ' ', '')) || '.com',
    'phone', '+1-555-0123',
    'address', jsonb_build_object(
      'street', '123 Travel Street',
      'city', 'San Francisco',
      'state', 'CA',
      'country', 'USA',
      'postalCode', '94102'
    )
  ) as company_details,
  jsonb_build_object(
    'standard', 15.0,
    'premium', 20.0,
    'luxury', 25.0
  ) as commission_rates,
  '[]'::jsonb as licenses,
  '[]'::jsonb as certifications,
  false as is_verified,
  0.0 as rating,
  0 as review_count
FROM public.users u
WHERE u.role = 'TOUR_OPERATOR'
  AND NOT EXISTS (
    SELECT 1 FROM public.tour_operators to 
    WHERE to.user_id = u.id
  );

-- Step 2: Verify the results
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
WHERE u.role = 'TOUR_OPERATOR'
ORDER BY u.created_at DESC;
