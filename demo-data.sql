-- =============================================
-- Demo Users and Data for Travel Booking Platform
-- =============================================

-- Demo Users (these will be created in Supabase Auth)
-- Note: You'll need to manually create these users in Supabase Auth dashboard
-- or use the Supabase Admin API to create them programmatically

-- Demo User Data for the users table
-- These correspond to the auth.users that should be created

-- 1. Super Admin User
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  profile,
  is_active,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@travelbooking.com',
  'Super Admin',
  'SUPER_ADMIN',
  '{"phone": "+1-555-0101", "department": "IT", "employee_id": "ADM001"}',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  profile = EXCLUDED.profile,
  updated_at = NOW();

-- 2. Tour Operator User
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  profile,
  is_active,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'operator@adventuretravel.com',
  'Sarah Johnson',
  'TOUR_OPERATOR',
  '{"phone": "+1-555-0102", "company": "Adventure Travel Co", "experience_years": 8}',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  profile = EXCLUDED.profile,
  updated_at = NOW();

-- 3. Travel Agent User
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  profile,
  is_active,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'agent@travelpro.com',
  'Mike Chen',
  'TRAVEL_AGENT',
  '{"phone": "+1-555-0103", "agency": "Travel Pro Agency", "specialization": "Luxury Travel"}',
  true,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  profile = EXCLUDED.profile,
  updated_at = NOW();

-- Tour Operator Company Details
INSERT INTO public.tour_operators (
  id,
  user_id,
  company_name,
  company_details,
  commission_rates,
  licenses,
  certifications,
  is_verified,
  rating,
  review_count,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000002',
  'Adventure Travel Co',
  '{"address": "123 Adventure St, Denver, CO 80202", "phone": "+1-555-0102", "website": "https://adventuretravel.com", "description": "Leading adventure travel company specializing in outdoor experiences worldwide."}',
  '{"standard": 0.15, "premium": 0.20, "luxury": 0.25}',
  '["Tour Operator License #TO-2024-001", "Insurance Policy #INS-2024-001"]',
  '["Certified Adventure Guide", "Wilderness First Aid", "Sustainable Tourism Certification"]',
  true,
  4.8,
  127,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_details = EXCLUDED.company_details,
  commission_rates = EXCLUDED.commission_rates,
  updated_at = NOW();

-- Demo Destinations
INSERT INTO public.destinations (
  id,
  name,
  country,
  city,
  coordinates,
  highlights,
  best_time_to_visit,
  weather,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000020',
  'Machu Picchu',
  'Peru',
  'Cusco',
  '{"lat": -13.1631, "lng": -72.5450}',
  '{"Ancient Inca Ruins", "Mountain Views", "Historical Significance", "UNESCO World Heritage"}',
  '{"May", "June", "July", "August", "September"}',
  '{"dry_season": "April-October", "rainy_season": "November-March", "avg_temp": "15-20°C"}',
  NOW()
),
(
  '00000000-0000-0000-0000-000000000021',
  'Santorini',
  'Greece',
  'Fira',
  '{"lat": 36.3932, "lng": 25.4615}',
  '{"Volcanic Landscape", "Sunset Views", "White Buildings", "Wine Tasting"}',
  '{"April", "May", "June", "September", "October"}',
  '{"summer": "25-30°C", "winter": "10-15°C", "best_weather": "April-October"}',
  NOW()
),
(
  '00000000-0000-0000-0000-000000000022',
  'Banff National Park',
  'Canada',
  'Banff',
  '{"lat": 51.1784, "lng": -115.5708}',
  '{"Mountain Scenery", "Wildlife", "Hot Springs", "Hiking Trails"}',
  '{"June", "July", "August", "September"}',
  '{"summer": "15-25°C", "winter": "-10 to 5°C", "best_season": "Summer"}',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  city = EXCLUDED.city,
  coordinates = EXCLUDED.coordinates,
  highlights = EXCLUDED.highlights,
  best_time_to_visit = EXCLUDED.best_time_to_visit,
  weather = EXCLUDED.weather,
  updated_at = NOW();

-- Demo Packages
INSERT INTO public.packages (
  id,
  tour_operator_id,
  title,
  description,
  type,
  status,
  pricing,
  itinerary,
  inclusions,
  exclusions,
  terms_and_conditions,
  cancellation_policy,
  images,
  destinations,
  duration,
  group_size,
  difficulty,
  tags,
  is_featured,
  rating,
  review_count,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000010',
  'Machu Picchu Adventure Trek',
  'Experience the ancient wonder of Machu Picchu with our 4-day guided trek through the Sacred Valley. This adventure combines cultural immersion with breathtaking mountain scenery.',
  'LAND_PACKAGE',
  'ACTIVE',
  '{"base_price": 1200, "currency": "USD", "per_person": true, "includes": ["accommodation", "meals", "guide", "transportation"]}',
  '[{"day": 1, "title": "Arrival in Cusco", "description": "City tour and acclimatization"}, {"day": 2, "title": "Sacred Valley Tour", "description": "Visit Pisac and Ollantaytambo"}, {"day": 3, "title": "Machu Picchu", "description": "Early morning visit to the ancient citadel"}, {"day": 4, "title": "Return to Cusco", "description": "Free time and departure"}]',
  '{"Professional guide", "All transportation", "3 nights accommodation", "All meals", "Entrance fees", "Airport transfers"}',
  '{"International flights", "Travel insurance", "Personal expenses", "Tips", "Alcoholic beverages"}',
  '{"Minimum age 12 years", "Moderate fitness level required", "Valid passport required", "Travel insurance recommended"}',
  '{"Free cancellation up to 30 days", "50% refund 15-30 days", "No refund within 15 days"}',
  '["https://example.com/machu-picchu-1.jpg", "https://example.com/machu-picchu-2.jpg"]',
  '["Machu Picchu", "Cusco", "Sacred Valley"]',
  '{"days": 4, "nights": 3, "description": "4 days, 3 nights"}',
  '{"min": 2, "max": 12, "description": "Small group (2-12 people)"}',
  'MODERATE',
  '{"adventure", "cultural", "hiking", "unesco", "peru"}',
  true,
  4.9,
  89,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000010',
  'Santorini Sunset Experience',
  'Discover the magic of Santorini with our luxury 3-day package featuring stunning sunsets, wine tasting, and private tours of the islands most beautiful locations.',
  'LAND_PACKAGE',
  'ACTIVE',
  '{"base_price": 1800, "currency": "USD", "per_person": true, "includes": ["luxury_hotel", "private_tours", "wine_tasting", "sunset_cruise"]}',
  '[{"day": 1, "title": "Arrival & Fira Exploration", "description": "Check-in and explore the capital"}, {"day": 2, "title": "Oia & Wine Tasting", "description": "Visit Oia village and local wineries"}, {"day": 3, "title": "Sunset Cruise", "description": "Private boat tour with sunset views"}]',
  '{"Luxury hotel accommodation", "Private guided tours", "Wine tasting sessions", "Sunset cruise", "All transfers", "Breakfast daily"}',
  '{"International flights", "Lunch and dinner", "Personal expenses", "Travel insurance", "Tips"}',
  '{"Minimum age 18 years", "Valid passport required", "Travel insurance recommended"}',
  '{"Free cancellation up to 21 days", "50% refund 7-21 days", "No refund within 7 days"}',
  '["https://example.com/santorini-1.jpg", "https://example.com/santorini-2.jpg"]',
  '["Santorini", "Fira", "Oia"]',
  '{"days": 3, "nights": 2, "description": "3 days, 2 nights"}',
  '{"min": 1, "max": 8, "description": "Private or small group (1-8 people)"}',
  'EASY',
  '{"luxury", "romantic", "sunset", "wine", "greece"}',
  true,
  4.7,
  156,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  pricing = EXCLUDED.pricing,
  itinerary = EXCLUDED.itinerary,
  inclusions = EXCLUDED.inclusions,
  exclusions = EXCLUDED.exclusions,
  updated_at = NOW();

-- Demo Bookings
INSERT INTO public.bookings (
  id,
  package_id,
  user_id,
  travel_agent_id,
  status,
  travelers,
  pricing,
  dates,
  special_requests,
  notes,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'CONFIRMED',
  '[{"name": "John Smith", "age": 35, "passport": "US123456789"}, {"name": "Jane Smith", "age": 32, "passport": "US987654321"}]',
  '{"total": 2400, "currency": "USD", "per_person": 1200, "discount": 0, "taxes": 0}',
  '{"start_date": "2024-06-15", "end_date": "2024-06-18", "duration": "4 days"}',
  '{"vegetarian_meals": true, "wheelchair_access": false}',
  'Anniversary trip for the Smiths',
  NOW()
),
(
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'PENDING',
  '[{"name": "Robert Johnson", "age": 28, "passport": "CA123456789"}]',
  '{"total": 1800, "currency": "USD", "per_person": 1800, "discount": 0, "taxes": 0}',
  '{"start_date": "2024-07-20", "end_date": "2024-07-22", "duration": "3 days"}',
  '{"honeymoon": true, "romantic_dinner": true}',
  'Honeymoon trip for Robert',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  travelers = EXCLUDED.travelers,
  pricing = EXCLUDED.pricing,
  dates = EXCLUDED.dates,
  special_requests = EXCLUDED.special_requests,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Demo Reviews
INSERT INTO public.reviews (
  id,
  package_id,
  user_id,
  booking_id,
  rating,
  title,
  comment,
  images,
  is_verified,
  helpful_count,
  created_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000050',
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000040',
  5,
  'Amazing Machu Picchu Experience!',
  'The trek was challenging but absolutely worth it. Our guide was knowledgeable and the views were breathtaking. Highly recommend this package!',
  '["https://example.com/review-machu-1.jpg"]',
  true,
  12,
  NOW()
),
(
  '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000031',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000041',
  4,
  'Beautiful Santorini Sunset',
  'The sunset cruise was magical and the wine tasting was excellent. The hotel was luxurious and the service was top-notch.',
  '["https://example.com/review-santorini-1.jpg"]',
  true,
  8,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  rating = EXCLUDED.rating,
  title = EXCLUDED.title,
  comment = EXCLUDED.comment,
  helpful_count = EXCLUDED.helpful_count,
  updated_at = NOW();

-- =============================================
-- Instructions for Manual Setup
-- =============================================

-- IMPORTANT: To complete the setup, you need to manually create these users in Supabase Auth:

-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add User" and create these accounts:

-- User 1: Super Admin
-- Email: admin@travelbooking.com
-- Password: Admin123!
-- User ID: 00000000-0000-0000-0000-000000000001

-- User 2: Tour Operator
-- Email: operator@adventuretravel.com  
-- Password: Operator123!
-- User ID: 00000000-0000-0000-0000-000000000002

-- User 3: Travel Agent
-- Email: agent@travelpro.com
-- Password: Agent123!
-- User ID: 00000000-0000-0000-0000-000000000003

-- After creating the auth users, run this SQL script to populate the database with demo data.

-- =============================================
-- Verification Queries
-- =============================================

-- Check if demo data was inserted correctly:
-- SELECT COUNT(*) as user_count FROM public.users;
-- SELECT COUNT(*) as operator_count FROM public.tour_operators;
-- SELECT COUNT(*) as package_count FROM public.packages;
-- SELECT COUNT(*) as booking_count FROM public.bookings;
-- SELECT COUNT(*) as review_count FROM public.reviews;
