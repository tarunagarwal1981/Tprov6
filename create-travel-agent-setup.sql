-- =============================================
-- TRAVEL AGENT SETUP QUERIES
-- Complete database setup for travel agent functionality
-- =============================================

-- =============================================
-- 1. CREATE TRAVEL AGENT USER IN AUTH.USERS
-- =============================================

-- Insert user into auth.users (Supabase authentication table)
-- Note: This should be done through Supabase Auth API or Dashboard
-- The following is for reference - actual user creation should use Supabase Auth

-- Example user creation (use Supabase Auth API instead):
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_user_meta_data,
--   raw_app_meta_data,
--   is_super_admin,
--   role
-- ) VALUES (
--   'agent-001-uuid-here', -- Replace with actual UUID
--   'agent@travelplatform.com',
--   crypt('password123', gen_salt('bf')), -- Replace with actual password hash
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"firstName": "John", "lastName": "Agent", "phone": "+1-555-0123"}',
--   '{"provider": "email", "providers": ["email"]}',
--   false,
--   'authenticated'
-- );

-- =============================================
-- 2. INSERT USER INTO PUBLIC.USERS TABLE
-- =============================================

-- Insert the travel agent into the public.users table
-- Replace 'agent-001-uuid-here' with the actual UUID from auth.users
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  profile,
  is_active,
  created_at,
  updated_at
) VALUES (
  'agent-001-uuid-here', -- Replace with actual UUID from auth.users
  'agent@travelplatform.com',
  'John Travel Agent',
  'TRAVEL_AGENT',
  '{
    "firstName": "John",
    "lastName": "Agent",
    "phone": "+1-555-0123",
    "company": "Travel Solutions Inc",
    "license": "TA-2024-001",
    "specializations": ["Adventure Travel", "Cultural Tours", "Luxury Travel"],
    "experience": "5 years",
    "languages": ["English", "Spanish", "French"],
    "bio": "Experienced travel agent specializing in adventure and cultural tours"
  }',
  true,
  NOW(),
  NOW()
);

-- =============================================
-- 3. CREATE TRAVEL AGENTS TABLE (if not exists)
-- =============================================

CREATE TABLE IF NOT EXISTS public.travel_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Professional Information
  company_name TEXT,
  license_number TEXT,
  license_expiry DATE,
  certifications TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  
  -- Contact Information
  phone TEXT,
  address JSONB DEFAULT '{}',
  website TEXT,
  
  -- Professional Details
  experience_years INTEGER DEFAULT 0,
  languages TEXT[] DEFAULT '{}',
  bio TEXT,
  
  -- Business Information
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Default 10% commission
  minimum_commission DECIMAL(10,2) DEFAULT 50.00,
  maximum_commission DECIMAL(10,2) DEFAULT 1000.00,
  
  -- Status and Verification
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. CREATE LEADS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Customer Information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Trip Details
  destination TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('ADVENTURE', 'CULTURAL', 'BEACH', 'CITY_BREAK', 'LUXURY', 'BUDGET')),
  travelers INTEGER NOT NULL DEFAULT 1,
  duration INTEGER NOT NULL, -- in days
  
  -- Dates
  preferred_start_date DATE,
  preferred_end_date DATE,
  flexible_dates BOOLEAN DEFAULT true,
  
  -- Preferences and Requirements
  preferences TEXT[] DEFAULT '{}',
  special_requirements TEXT[] DEFAULT '{}',
  dietary_requirements TEXT[] DEFAULT '{}',
  accessibility_needs TEXT[] DEFAULT '{}',
  
  -- Lead Management
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUOTED', 'BOOKED', 'COMPLETED', 'CANCELLED')),
  source TEXT NOT NULL DEFAULT 'MARKETPLACE' CHECK (source IN ('MARKETPLACE', 'REFERRAL', 'DIRECT', 'SOCIAL_MEDIA', 'WEBSITE')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  
  -- Additional Information
  notes TEXT,
  estimated_value DECIMAL(10,2),
  probability_of_booking DECIMAL(5,2) DEFAULT 50.00, -- Percentage
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- =============================================
-- 5. CREATE ITINERARIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Itinerary Details
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'REVISED', 'APPROVED', 'BOOKED', 'CANCELLED')),
  
  -- Pricing
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  agent_commission DECIMAL(10,2) DEFAULT 0.00,
  customer_price DECIMAL(10,2) DEFAULT 0.00,
  markup_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Trip Details
  start_date DATE,
  end_date DATE,
  duration_days INTEGER DEFAULT 0,
  
  -- Additional Information
  notes TEXT,
  client_feedback TEXT,
  internal_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);

-- =============================================
-- 6. CREATE ITINERARY DAYS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  
  -- Day Information
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  
  -- Day Details
  accommodation TEXT,
  meals TEXT[] DEFAULT '{}',
  transportation TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(itinerary_id, day_number)
);

-- =============================================
-- 7. CREATE ITINERARY ACTIVITIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.itinerary_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity Information
  name TEXT NOT NULL,
  description TEXT,
  duration_hours DECIMAL(4,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0.00,
  type TEXT NOT NULL CHECK (type IN ('PACKAGE', 'CUSTOM')),
  
  -- Package Reference (if applicable)
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  
  -- Timing and Location
  time_slot TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Additional Information
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. CREATE ITINERARY PACKAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.itinerary_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  
  -- Package Details
  package_name TEXT NOT NULL,
  operator_id UUID REFERENCES public.tour_operators(id) ON DELETE CASCADE NOT NULL,
  operator_name TEXT NOT NULL,
  
  -- Quantity and Pricing
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Booking Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
  booking_request_id UUID, -- Reference to booking request
  
  -- Additional Information
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(itinerary_id, package_id)
);

-- =============================================
-- 9. CREATE CUSTOM ITINERARY ITEMS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.custom_itinerary_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  
  -- Item Information
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('FLIGHT', 'HOTEL', 'TRANSFER', 'ACTIVITY', 'MEAL', 'OTHER')),
  
  -- Pricing
  cost DECIMAL(10,2) NOT NULL,
  
  -- Supplier Information
  supplier TEXT,
  supplier_contact TEXT,
  
  -- Additional Information
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 10. CREATE BOOKING REQUESTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.booking_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  operator_id UUID REFERENCES public.tour_operators(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Request Details
  quantity INTEGER NOT NULL DEFAULT 1,
  requested_start_date DATE NOT NULL,
  requested_end_date DATE NOT NULL,
  
  -- Special Requests
  special_requests TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
  
  -- Response Information
  response_message TEXT,
  confirmed_price DECIMAL(10,2),
  confirmed_dates JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- =============================================
-- 11. CREATE COMMISSIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  
  -- Commission Details
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID')),
  
  -- Payment Information
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Additional Information
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- =============================================
-- 12. CREATE COMMUNICATION LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.communication_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Communication Details
  type TEXT NOT NULL CHECK (type IN ('EMAIL', 'PHONE', 'MEETING', 'NOTE', 'SMS', 'WHATSAPP')),
  subject TEXT,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  
  -- Additional Information
  attachments TEXT[] DEFAULT '{}',
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 13. INSERT TRAVEL AGENT PROFILE
-- =============================================

-- Insert travel agent profile information
INSERT INTO public.travel_agents (
  user_id,
  company_name,
  license_number,
  certifications,
  specializations,
  phone,
  experience_years,
  languages,
  bio,
  commission_rate,
  is_verified,
  is_active,
  rating,
  created_at,
  updated_at
) VALUES (
  'agent-001-uuid-here', -- Replace with actual UUID from auth.users
  'Travel Solutions Inc',
  'TA-2024-001',
  ARRAY['IATA Certified', 'Travel Agent License', 'Destination Specialist'],
  ARRAY['Adventure Travel', 'Cultural Tours', 'Luxury Travel'],
  '+1-555-0123',
  5,
  ARRAY['English', 'Spanish', 'French'],
  'Experienced travel agent specializing in adventure and cultural tours with 5+ years of experience.',
  10.00,
  true,
  true,
  4.9,
  NOW(),
  NOW()
);

-- =============================================
-- 14. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON public.leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_destination ON public.leads(destination);

-- Itineraries indexes
CREATE INDEX IF NOT EXISTS idx_itineraries_agent_id ON public.itineraries(agent_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_lead_id ON public.itineraries(lead_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON public.itineraries(status);

-- Itinerary days indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary_id ON public.itinerary_days(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_date ON public.itinerary_days(date);

-- Itinerary activities indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_day_id ON public.itinerary_activities(day_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_package_id ON public.itinerary_activities(package_id);

-- Itinerary packages indexes
CREATE INDEX IF NOT EXISTS idx_itinerary_packages_itinerary_id ON public.itinerary_packages(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_packages_package_id ON public.itinerary_packages(package_id);

-- Booking requests indexes
CREATE INDEX IF NOT EXISTS idx_booking_requests_agent_id ON public.booking_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_operator_id ON public.booking_requests(operator_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);

-- Commissions indexes
CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

-- Communication log indexes
CREATE INDEX IF NOT EXISTS idx_communication_log_lead_id ON public.communication_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_agent_id ON public.communication_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_created_at ON public.communication_log(created_at);

-- =============================================
-- 15. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.travel_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;

-- Travel agents policies
CREATE POLICY "Travel agents can view their own profile" ON public.travel_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Travel agents can update their own profile" ON public.travel_agents
  FOR UPDATE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Travel agents can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Travel agents can insert their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Travel agents can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = agent_id);

-- Itineraries policies
CREATE POLICY "Travel agents can view their own itineraries" ON public.itineraries
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Travel agents can insert their own itineraries" ON public.itineraries
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Travel agents can update their own itineraries" ON public.itineraries
  FOR UPDATE USING (auth.uid() = agent_id);

-- Itinerary days policies
CREATE POLICY "Travel agents can manage itinerary days" ON public.itinerary_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries 
      WHERE id = itinerary_id AND agent_id = auth.uid()
    )
  );

-- Itinerary activities policies
CREATE POLICY "Travel agents can manage itinerary activities" ON public.itinerary_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itinerary_days id
      JOIN public.itineraries i ON id.itinerary_id = i.id
      WHERE id.id = day_id AND i.agent_id = auth.uid()
    )
  );

-- Itinerary packages policies
CREATE POLICY "Travel agents can manage itinerary packages" ON public.itinerary_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries 
      WHERE id = itinerary_id AND agent_id = auth.uid()
    )
  );

-- Custom itinerary items policies
CREATE POLICY "Travel agents can manage custom items" ON public.custom_itinerary_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries 
      WHERE id = itinerary_id AND agent_id = auth.uid()
    )
  );

-- Booking requests policies
CREATE POLICY "Travel agents can manage their booking requests" ON public.booking_requests
  FOR ALL USING (auth.uid() = agent_id);

-- Commissions policies
CREATE POLICY "Travel agents can view their own commissions" ON public.commissions
  FOR SELECT USING (auth.uid() = agent_id);

-- Communication log policies
CREATE POLICY "Travel agents can manage their communication log" ON public.communication_log
  FOR ALL USING (auth.uid() = agent_id);

-- =============================================
-- 16. INSERT SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample lead
INSERT INTO public.leads (
  agent_id,
  customer_name,
  customer_email,
  customer_phone,
  destination,
  budget,
  trip_type,
  travelers,
  duration,
  preferred_start_date,
  preferred_end_date,
  preferences,
  status,
  source,
  notes,
  created_at
) VALUES (
  'agent-001-uuid-here', -- Replace with actual UUID
  'Sarah Johnson',
  'sarah.johnson@email.com',
  '+1-555-0123',
  'Bali, Indonesia',
  3000.00,
  'ADVENTURE',
  2,
  7,
  '2024-03-15',
  '2024-03-22',
  ARRAY['Beach activities', 'Cultural experiences', 'Adventure sports'],
  'NEW',
  'MARKETPLACE',
  'Interested in water sports and local cuisine',
  NOW()
);

-- Insert sample itinerary
INSERT INTO public.itineraries (
  lead_id,
  agent_id,
  title,
  description,
  status,
  total_cost,
  agent_commission,
  customer_price,
  start_date,
  end_date,
  duration_days,
  notes,
  created_at
) VALUES (
  (SELECT id FROM public.leads WHERE customer_email = 'sarah.johnson@email.com' LIMIT 1),
  'agent-001-uuid-here', -- Replace with actual UUID
  'Bali Adventure Package',
  '7-day adventure package including water sports and cultural experiences',
  'DRAFT',
  2800.00,
  280.00,
  3000.00,
  '2024-03-15',
  '2024-03-22',
  7,
  'Waiting for client approval',
  NOW()
);

-- =============================================
-- 17. VERIFICATION QUERIES
-- =============================================

-- Verify the travel agent user was created
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  ta.company_name,
  ta.license_number,
  ta.commission_rate,
  ta.is_verified
FROM public.users u
LEFT JOIN public.travel_agents ta ON u.id = ta.user_id
WHERE u.email = 'agent@travelplatform.com';

-- Verify the sample lead was created
SELECT 
  l.id,
  l.customer_name,
  l.customer_email,
  l.destination,
  l.budget,
  l.trip_type,
  l.status,
  u.name as agent_name
FROM public.leads l
JOIN public.users u ON l.agent_id = u.id
WHERE l.customer_email = 'sarah.johnson@email.com';

-- Verify the sample itinerary was created
SELECT 
  i.id,
  i.title,
  i.status,
  i.customer_price,
  i.agent_commission,
  l.customer_name,
  u.name as agent_name
FROM public.itineraries i
JOIN public.leads l ON i.lead_id = l.id
JOIN public.users u ON i.agent_id = u.id
WHERE i.title = 'Bali Adventure Package';

-- =============================================
-- NOTES FOR IMPLEMENTATION
-- =============================================

/*
IMPORTANT NOTES:

1. USER CREATION:
   - Replace 'agent-001-uuid-here' with the actual UUID from auth.users
   - Create the user in auth.users first using Supabase Auth API
   - Use the returned UUID in all subsequent queries

2. AUTHENTICATION:
   - The agent dashboard will be accessible at /agent/dashboard
   - Only users with role 'TRAVEL_AGENT' can access agent routes
   - RLS policies ensure agents can only see their own data

3. PASSWORD SETUP:
   - Set up the password through Supabase Auth Dashboard or API
   - Use a secure password for the agent account

4. TESTING:
   - Use the verification queries to confirm everything was created correctly
   - Test the agent dashboard login and functionality

5. SCALABILITY:
   - All tables have proper indexes for performance
   - RLS policies ensure data security
   - Foreign key constraints maintain data integrity

6. EXTENSIONS:
   - The schema uses uuid-ossp and pgcrypto extensions
   - Make sure these are enabled in your Supabase project

7. CUSTOMIZATION:
   - Modify the sample data as needed
   - Adjust commission rates and business rules
   - Add additional fields as required
*/
