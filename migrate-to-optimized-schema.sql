-- =============================================
-- MIGRATION SCRIPT: OLD SCHEMA TO OPTIMIZED SCHEMA
-- =============================================

-- This script migrates data from the old schema to the new optimized schema
-- Run this after creating the new schema tables

-- =============================================
-- STEP 1: MIGRATE PACKAGES DATA
-- =============================================

-- Migrate basic package data
INSERT INTO public.packages (
  id,
  tour_operator_id,
  title,
  description,
  type,
  status,
  adult_price,
  child_price,
  currency,
  duration_days,
  duration_hours,
  min_group_size,
  max_group_size,
  difficulty,
  tags,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
)
SELECT 
  id,
  tour_operator_id,
  title,
  description,
  CASE 
    WHEN type = 'LAND_PACKAGE' THEN 'MULTI_CITY_PACKAGE'
    WHEN type = 'LAND_PACKAGE_WITH_HOTEL' THEN 'MULTI_CITY_PACKAGE_WITH_HOTEL'
    WHEN type = 'FLIGHT' THEN 'FIXED_DEPARTURE_WITH_FLIGHT'
    WHEN type = 'HOTEL' THEN 'MULTI_CITY_PACKAGE_WITH_HOTEL'
    WHEN type = 'CRUISE' THEN 'MULTI_CITY_PACKAGE'
    WHEN type = 'COMBO' THEN 'MULTI_CITY_PACKAGE'
    WHEN type = 'CUSTOM' THEN 'MULTI_CITY_PACKAGE'
    ELSE type
  END as type,
  status,
  COALESCE((pricing->>'basePrice')::DECIMAL(10,2), 0) as adult_price,
  COALESCE((pricing->>'childPrice')::DECIMAL(10,2), 0) as child_price,
  COALESCE(pricing->>'currency', 'USD') as currency,
  COALESCE((duration->>'days')::INTEGER, 1) as duration_days,
  COALESCE((duration->>'hours')::INTEGER, 0) as duration_hours,
  COALESCE((group_size->>'min')::INTEGER, 1) as min_group_size,
  COALESCE((group_size->>'max')::INTEGER, 10) as max_group_size,
  difficulty,
  tags,
  is_featured,
  rating,
  review_count,
  created_at,
  updated_at
FROM public.packages_old
WHERE EXISTS (SELECT 1 FROM public.packages_old);

-- =============================================
-- STEP 2: MIGRATE PACKAGE DESTINATIONS
-- =============================================

-- Migrate destinations from JSONB array to normalized table
INSERT INTO public.package_destinations (package_id, destination_id, is_primary, order_index)
SELECT 
  p.id as package_id,
  d.id as destination_id,
  (i = 0) as is_primary, -- First destination is primary
  i as order_index
FROM public.packages_old p
CROSS JOIN LATERAL unnest(p.destinations) WITH ORDINALITY AS dest(name, i)
JOIN public.destinations d ON d.name = dest.name;

-- =============================================
-- STEP 3: MIGRATE PACKAGE INCLUSIONS
-- =============================================

-- Migrate inclusions from JSONB array to normalized table
INSERT INTO public.package_inclusions (package_id, inclusion, order_index)
SELECT 
  p.id as package_id,
  inc.inclusion,
  inc.i as order_index
FROM public.packages_old p
CROSS JOIN LATERAL unnest(p.inclusions) WITH ORDINALITY AS inc(inclusion, i);

-- =============================================
-- STEP 4: MIGRATE PACKAGE EXCLUSIONS
-- =============================================

-- Migrate exclusions from JSONB array to normalized table
INSERT INTO public.package_exclusions (package_id, exclusion, order_index)
SELECT 
  p.id as package_id,
  exc.exclusion,
  exc.i as order_index
FROM public.packages_old p
CROSS JOIN LATERAL unnest(p.exclusions) WITH ORDINALITY AS exc(exclusion, i);

-- =============================================
-- STEP 5: MIGRATE PACKAGE ITINERARY
-- =============================================

-- Migrate itinerary from JSONB array to normalized table
INSERT INTO public.package_itinerary (package_id, day_number, title, description, activities, meals_included, accommodation, transportation, order_index)
SELECT 
  p.id as package_id,
  COALESCE((itinerary_item->>'day')::INTEGER, it.i) as day_number,
  COALESCE(itinerary_item->>'title', 'Day ' || it.i) as title,
  COALESCE(itinerary_item->>'description', '') as description,
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(itinerary_item->'activities')), '{}') as activities,
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(itinerary_item->'meals')), '{}') as meals_included,
  itinerary_item->>'accommodation' as accommodation,
  itinerary_item->>'transportation' as transportation,
  it.i as order_index
FROM public.packages_old p
CROSS JOIN LATERAL jsonb_array_elements(p.itinerary) WITH ORDINALITY AS it(itinerary_item, i);

-- =============================================
-- STEP 6: MIGRATE PACKAGE TYPE-SPECIFIC DETAILS
-- =============================================

-- Migrate type-specific fields to normalized table
INSERT INTO public.package_type_details (package_id, field_name, field_value, field_type)
SELECT 
  p.id as package_id,
  'startTime' as field_name,
  p.pricing->>'startTime' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'startTime' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'endTime' as field_name,
  p.pricing->>'endTime' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'endTime' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'fromLocation' as field_name,
  p.pricing->>'fromLocation' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'fromLocation' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'toLocation' as field_name,
  p.pricing->>'toLocation' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'toLocation' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'vehicleType' as field_name,
  p.pricing->>'vehicleType' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'vehicleType' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'hotelCategory' as field_name,
  p.pricing->>'hotelCategory' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'hotelCategory' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'departureAirport' as field_name,
  p.pricing->>'departureAirport' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'departureAirport' IS NOT NULL

UNION ALL

SELECT 
  p.id as package_id,
  'arrivalAirport' as field_name,
  p.pricing->>'arrivalAirport' as field_value,
  'text' as field_type
FROM public.packages_old p
WHERE p.pricing->>'arrivalAirport' IS NOT NULL;

-- =============================================
-- STEP 7: MIGRATE CANCELLATION POLICIES
-- =============================================

-- Migrate cancellation policies from JSONB to normalized table
INSERT INTO public.package_cancellation_policies (package_id, days_before_departure, cancellation_fee_percentage, description)
SELECT 
  p.id as package_id,
  COALESCE((policy->>'daysBeforeDeparture')::INTEGER, 0) as days_before_departure,
  COALESCE((policy->>'feePercentage')::DECIMAL(5,2), 0) as cancellation_fee_percentage,
  policy->>'description' as description
FROM public.packages_old p
CROSS JOIN LATERAL jsonb_array_elements(p.cancellation_policy) AS policy;

-- =============================================
-- STEP 8: MIGRATE BOOKINGS DATA
-- =============================================

-- Migrate bookings data
INSERT INTO public.bookings (
  id,
  package_id,
  user_id,
  travel_agent_id,
  status,
  booking_reference,
  total_price,
  currency,
  adult_count,
  child_count,
  departure_date,
  return_date,
  special_requests,
  notes,
  created_at,
  updated_at
)
SELECT 
  id,
  package_id,
  user_id,
  travel_agent_id,
  status,
  id::text as booking_reference, -- Use ID as reference for now
  COALESCE((pricing->>'total')::DECIMAL(10,2), 0) as total_price,
  COALESCE(pricing->>'currency', 'USD') as currency,
  COALESCE((travelers->>'adultCount')::INTEGER, 0) as adult_count,
  COALESCE((travelers->>'childCount')::INTEGER, 0) as child_count,
  (dates->>'departure')::DATE as departure_date,
  (dates->>'return')::DATE as return_date,
  special_requests,
  notes,
  created_at,
  updated_at
FROM public.bookings_old;

-- =============================================
-- STEP 9: MIGRATE BOOKING TRAVELERS
-- =============================================

-- Migrate travelers from JSONB to normalized table
INSERT INTO public.booking_travelers (
  booking_id,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  passport_number,
  passport_expiry,
  dietary_requirements,
  medical_conditions,
  emergency_contact_name,
  emergency_contact_phone
)
SELECT 
  b.id as booking_id,
  traveler->>'firstName' as first_name,
  traveler->>'lastName' as last_name,
  traveler->>'email' as email,
  traveler->>'phone' as phone,
  (traveler->>'dateOfBirth')::DATE as date_of_birth,
  traveler->>'passportNumber' as passport_number,
  (traveler->>'passportExpiry')::DATE as passport_expiry,
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(traveler->'dietaryRequirements')), '{}') as dietary_requirements,
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(traveler->'medicalConditions')), '{}') as medical_conditions,
  traveler->>'emergencyContactName' as emergency_contact_name,
  traveler->>'emergencyContactPhone' as emergency_contact_phone
FROM public.bookings_old b
CROSS JOIN LATERAL jsonb_array_elements(b.travelers) AS traveler;

-- =============================================
-- STEP 10: CLEANUP OLD TABLES (OPTIONAL)
-- =============================================

-- Uncomment these lines after verifying the migration was successful
-- DROP TABLE IF EXISTS public.packages_old;
-- DROP TABLE IF EXISTS public.bookings_old;

-- =============================================
-- STEP 11: UPDATE SEQUENCES AND STATISTICS
-- =============================================

-- Update table statistics for better query planning
ANALYZE public.packages;
ANALYZE public.package_destinations;
ANALYZE public.package_inclusions;
ANALYZE public.package_exclusions;
ANALYZE public.package_itinerary;
ANALYZE public.package_type_details;
ANALYZE public.package_cancellation_policies;
ANALYZE public.bookings;
ANALYZE public.booking_travelers;
ANALYZE public.reviews;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify migration results
SELECT 
  'Packages migrated' as table_name,
  COUNT(*) as record_count
FROM public.packages

UNION ALL

SELECT 
  'Package destinations migrated' as table_name,
  COUNT(*) as record_count
FROM public.package_destinations

UNION ALL

SELECT 
  'Package inclusions migrated' as table_name,
  COUNT(*) as record_count
FROM public.package_inclusions

UNION ALL

SELECT 
  'Package exclusions migrated' as table_name,
  COUNT(*) as record_count
FROM public.package_exclusions

UNION ALL

SELECT 
  'Package itinerary migrated' as table_name,
  COUNT(*) as record_count
FROM public.package_itinerary

UNION ALL

SELECT 
  'Package type details migrated' as table_name,
  COUNT(*) as record_count
FROM public.package_type_details

UNION ALL

SELECT 
  'Bookings migrated' as table_name,
  COUNT(*) as record_count
FROM public.bookings

UNION ALL

SELECT 
  'Booking travelers migrated' as table_name,
  COUNT(*) as record_count
FROM public.booking_travelers;
