-- =============================================
-- QUICK TRAVEL AGENT SETUP
-- Simplified version for immediate setup
-- =============================================

-- =============================================
-- STEP 1: CREATE TRAVEL AGENT USER
-- =============================================

-- First, create the user in Supabase Auth Dashboard or use the API:
-- POST https://your-project.supabase.co/auth/v1/admin/users
-- {
--   "email": "agent@travelplatform.com",
--   "password": "SecurePassword123!",
--   "email_confirm": true,
--   "user_metadata": {
--     "firstName": "John",
--     "lastName": "Agent",
--     "phone": "+1-555-0123"
--   }
-- }

-- After creating the user, get the UUID and replace 'AGENT_UUID_HERE' below

-- =============================================
-- STEP 2: INSERT INTO PUBLIC.USERS TABLE
-- =============================================

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
  'AGENT_UUID_HERE', -- Replace with actual UUID from auth.users
  'agent@travelplatform.com',
  'John Travel Agent',
  'TRAVEL_AGENT',
  '{
    "firstName": "John",
    "lastName": "Agent",
    "phone": "+1-555-0123",
    "company": "Travel Solutions Inc",
    "license": "TA-2024-001",
    "specializations": ["Adventure Travel", "Cultural Tours"],
    "experience": "5 years",
    "languages": ["English", "Spanish"],
    "bio": "Experienced travel agent specializing in adventure and cultural tours"
  }',
  true,
  NOW(),
  NOW()
);

-- =============================================
-- STEP 3: CREATE ESSENTIAL TABLES
-- =============================================

-- Travel Agents table
CREATE TABLE IF NOT EXISTS public.travel_agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  license_number TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  is_verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 4.9,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  destination TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('ADVENTURE', 'CULTURAL', 'BEACH', 'CITY_BREAK', 'LUXURY', 'BUDGET')),
  travelers INTEGER NOT NULL DEFAULT 1,
  duration INTEGER NOT NULL,
  preferred_start_date DATE,
  preferred_end_date DATE,
  preferences TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUOTED', 'BOOKED', 'COMPLETED', 'CANCELLED')),
  source TEXT NOT NULL DEFAULT 'MARKETPLACE' CHECK (source IN ('MARKETPLACE', 'REFERRAL', 'DIRECT', 'SOCIAL_MEDIA')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itineraries table
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'REVISED', 'APPROVED', 'BOOKED', 'CANCELLED')),
  total_cost DECIMAL(10,2) DEFAULT 0.00,
  agent_commission DECIMAL(10,2) DEFAULT 0.00,
  customer_price DECIMAL(10,2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  duration_days INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STEP 4: INSERT TRAVEL AGENT PROFILE
-- =============================================

INSERT INTO public.travel_agents (
  user_id,
  company_name,
  license_number,
  commission_rate,
  is_verified,
  is_active,
  rating,
  created_at,
  updated_at
) VALUES (
  'AGENT_UUID_HERE', -- Replace with actual UUID
  'Travel Solutions Inc',
  'TA-2024-001',
  10.00,
  true,
  true,
  4.9,
  NOW(),
  NOW()
);

-- =============================================
-- STEP 5: INSERT SAMPLE DATA
-- =============================================

-- Sample lead
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
  'AGENT_UUID_HERE', -- Replace with actual UUID
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

-- Sample itinerary
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
  'AGENT_UUID_HERE', -- Replace with actual UUID
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
-- STEP 6: CREATE INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON public.leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_itineraries_agent_id ON public.itineraries(agent_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_lead_id ON public.itineraries(lead_id);

-- =============================================
-- STEP 7: ENABLE RLS POLICIES
-- =============================================

ALTER TABLE public.travel_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Travel agents policies
CREATE POLICY "Travel agents can view their own profile" ON public.travel_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Travel agents can update their own profile" ON public.travel_agents
  FOR UPDATE USING (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Travel agents can manage their own leads" ON public.leads
  FOR ALL USING (auth.uid() = agent_id);

-- Itineraries policies
CREATE POLICY "Travel agents can manage their own itineraries" ON public.itineraries
  FOR ALL USING (auth.uid() = agent_id);

-- =============================================
-- STEP 8: VERIFY SETUP
-- =============================================

-- Check if the travel agent was created successfully
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  ta.company_name,
  ta.license_number,
  ta.commission_rate
FROM public.users u
LEFT JOIN public.travel_agents ta ON u.id = ta.user_id
WHERE u.email = 'agent@travelplatform.com';

-- Check sample data
SELECT 
  l.customer_name,
  l.destination,
  l.budget,
  l.status,
  i.title as itinerary_title,
  i.customer_price
FROM public.leads l
LEFT JOIN public.itineraries i ON l.id = i.lead_id
WHERE l.agent_id = 'AGENT_UUID_HERE'; -- Replace with actual UUID
