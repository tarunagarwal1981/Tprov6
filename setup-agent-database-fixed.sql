-- =============================================
-- TRAVEL AGENT DATABASE SETUP (UPDATED)
-- For agent@travelplatform.com (UID: 90e205ba-b02c-44e0-bf89-4814bfc3802c)
-- Handles existing user gracefully
-- =============================================

-- =============================================
-- STEP 1: INSERT OR UPDATE USER IN PUBLIC.USERS TABLE
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
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
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
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  profile = EXCLUDED.profile,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- =============================================
-- STEP 2: CREATE ESSENTIAL TABLES (if not exists)
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

-- Itinerary days table
CREATE TABLE IF NOT EXISTS public.itinerary_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  accommodation TEXT,
  meals TEXT[] DEFAULT '{}',
  transportation TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(itinerary_id, day_number)
);

-- Itinerary activities table
CREATE TABLE IF NOT EXISTS public.itinerary_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_id UUID REFERENCES public.itinerary_days(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_hours DECIMAL(4,2) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0.00,
  type TEXT NOT NULL CHECK (type IN ('PACKAGE', 'CUSTOM')),
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  time_slot TEXT NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itinerary packages table
CREATE TABLE IF NOT EXISTS public.itinerary_packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  package_name TEXT NOT NULL,
  operator_id UUID REFERENCES public.tour_operators(id) ON DELETE CASCADE NOT NULL,
  operator_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
  booking_request_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(itinerary_id, package_id)
);

-- Custom itinerary items table
CREATE TABLE IF NOT EXISTS public.custom_itinerary_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('FLIGHT', 'HOTEL', 'TRANSFER', 'ACTIVITY', 'MEAL', 'OTHER')),
  cost DECIMAL(10,2) NOT NULL,
  supplier TEXT,
  supplier_contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking requests table
CREATE TABLE IF NOT EXISTS public.booking_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  operator_id UUID REFERENCES public.tour_operators(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  requested_start_date DATE NOT NULL,
  requested_end_date DATE NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
  response_message TEXT,
  confirmed_price DECIMAL(10,2),
  confirmed_dates JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID')),
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Communication log table
CREATE TABLE IF NOT EXISTS public.communication_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EMAIL', 'PHONE', 'MEETING', 'NOTE', 'SMS', 'WHATSAPP')),
  subject TEXT,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  attachments TEXT[] DEFAULT '{}',
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STEP 3: INSERT OR UPDATE TRAVEL AGENT PROFILE
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
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
  'Travel Solutions Inc',
  'TA-2024-001',
  10.00,
  true,
  true,
  4.9,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  license_number = EXCLUDED.license_number,
  commission_rate = EXCLUDED.commission_rate,
  is_verified = EXCLUDED.is_verified,
  is_active = EXCLUDED.is_active,
  rating = EXCLUDED.rating,
  updated_at = NOW();

-- =============================================
-- STEP 4: CLEAR EXISTING SAMPLE DATA (if any)
-- =============================================

-- Delete existing sample data for this agent to avoid duplicates
DELETE FROM public.itineraries WHERE agent_id = '90e205ba-b02c-44e0-bf89-4814bfc3802c';
DELETE FROM public.leads WHERE agent_id = '90e205ba-b02c-44e0-bf89-4814bfc3802c';

-- =============================================
-- STEP 5: INSERT SAMPLE DATA
-- =============================================

-- Sample lead 1
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
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
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

-- Sample lead 2
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
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
  'Mike Chen',
  'mike.chen@email.com',
  '+1-555-0456',
  'Paris, France',
  5000.00,
  'CULTURAL',
  2,
  10,
  '2024-04-20',
  '2024-04-30',
  ARRAY['Museums', 'Fine dining', 'Historical sites'],
  'CONTACTED',
  'REFERRAL',
  'First-time visitors to Europe',
  NOW()
);

-- Sample lead 3
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
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
  'Emily Davis',
  'emily.davis@email.com',
  '+1-555-0789',
  'Tokyo, Japan',
  4000.00,
  'CULTURAL',
  1,
  5,
  '2024-05-10',
  '2024-05-15',
  ARRAY['Temples', 'Sushi', 'Cherry blossoms', 'Technology'],
  'QUOTED',
  'DIRECT',
  'Solo traveler interested in Japanese culture',
  NOW()
);

-- Sample itinerary 1 (for Sarah Johnson)
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
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
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

-- Sample itinerary 2 (for Mike Chen)
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
  (SELECT id FROM public.leads WHERE customer_email = 'mike.chen@email.com' LIMIT 1),
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
  'Paris Cultural Experience',
  '10-day cultural tour of Paris including museums, dining, and historical sites',
  'SENT',
  4500.00,
  450.00,
  5000.00,
  '2024-04-20',
  '2024-04-30',
  10,
  'Sent to client for review',
  NOW()
);

-- Sample itinerary 3 (for Emily Davis)
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
  (SELECT id FROM public.leads WHERE customer_email = 'emily.davis@email.com' LIMIT 1),
  '90e205ba-b02c-44e0-bf89-4814bfc3802c',
  'Tokyo Cultural Journey',
  '5-day solo cultural journey through Tokyo',
  'APPROVED',
  3600.00,
  360.00,
  4000.00,
  '2024-05-10',
  '2024-05-15',
  5,
  'Client approved, ready for booking',
  NOW()
);

-- =============================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON public.leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_destination ON public.leads(destination);

CREATE INDEX IF NOT EXISTS idx_itineraries_agent_id ON public.itineraries(agent_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_lead_id ON public.itineraries(lead_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_status ON public.itineraries(status);

CREATE INDEX IF NOT EXISTS idx_itinerary_days_itinerary_id ON public.itinerary_days(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_date ON public.itinerary_days(date);

CREATE INDEX IF NOT EXISTS idx_itinerary_activities_day_id ON public.itinerary_activities(day_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_activities_package_id ON public.itinerary_activities(package_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_packages_itinerary_id ON public.itinerary_packages(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_packages_package_id ON public.itinerary_packages(package_id);

CREATE INDEX IF NOT EXISTS idx_booking_requests_agent_id ON public.booking_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_operator_id ON public.booking_requests(operator_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON public.booking_requests(status);

CREATE INDEX IF NOT EXISTS idx_commissions_agent_id ON public.commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

CREATE INDEX IF NOT EXISTS idx_communication_log_lead_id ON public.communication_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_agent_id ON public.communication_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_created_at ON public.communication_log(created_at);

-- =============================================
-- STEP 7: ENABLE ROW LEVEL SECURITY (RLS) POLICIES
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Travel agents can view their own profile" ON public.travel_agents;
DROP POLICY IF EXISTS "Travel agents can update their own profile" ON public.travel_agents;
DROP POLICY IF EXISTS "Travel agents can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Travel agents can insert their own leads" ON public.leads;
DROP POLICY IF EXISTS "Travel agents can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Travel agents can view their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Travel agents can insert their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Travel agents can update their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Travel agents can manage itinerary days" ON public.itinerary_days;
DROP POLICY IF EXISTS "Travel agents can manage itinerary activities" ON public.itinerary_activities;
DROP POLICY IF EXISTS "Travel agents can manage itinerary packages" ON public.itinerary_packages;
DROP POLICY IF EXISTS "Travel agents can manage custom items" ON public.custom_itinerary_items;
DROP POLICY IF EXISTS "Travel agents can manage their booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Travel agents can view their own commissions" ON public.commissions;
DROP POLICY IF EXISTS "Travel agents can manage their communication log" ON public.communication_log;

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
-- STEP 8: VERIFICATION QUERIES
-- =============================================

-- Verify the travel agent user was created/updated
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

-- Verify the sample leads were created
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
WHERE l.agent_id = '90e205ba-b02c-44e0-bf89-4814bfc3802c'
ORDER BY l.created_at DESC;

-- Verify the sample itineraries were created
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
WHERE i.agent_id = '90e205ba-b02c-44e0-bf89-4814bfc3802c'
ORDER BY i.created_at DESC;

-- Count total records for verification
SELECT 
  'Users' as table_name, COUNT(*) as count FROM public.users WHERE role = 'TRAVEL_AGENT'
UNION ALL
SELECT 'Travel Agents', COUNT(*) FROM public.travel_agents
UNION ALL
SELECT 'Leads', COUNT(*) FROM public.leads WHERE agent_id = '90e205ba-b02c-44e0-bf89-4814bfc3802c'
UNION ALL
SELECT 'Itineraries', COUNT(*) FROM public.itineraries WHERE agent_id = '90e205ba-b02c-44e0-bf89-4814bfc3802c';

-- =============================================
-- SETUP COMPLETE!
-- =============================================

/*
🎉 TRAVEL AGENT SETUP COMPLETE!

✅ User Details:
   - Email: agent@travelplatform.com
   - UUID: 90e205ba-b02c-44e0-bf89-4814bfc3802c
   - Role: TRAVEL_AGENT
   - Company: Travel Solutions Inc
   - Commission Rate: 10%

✅ Sample Data Created:
   - 3 Leads (Sarah Johnson, Mike Chen, Emily Davis)
   - 3 Itineraries (Bali Adventure, Paris Cultural, Tokyo Journey)
   - All with different statuses for testing

✅ Security:
   - RLS policies enabled
   - Agent can only see their own data
   - Proper foreign key constraints

✅ Performance:
   - Indexes created for optimal query performance
   - Proper data types and constraints

🌐 Next Steps:
   1. Run this SQL in your Supabase SQL editor
   2. Test login at http://localhost:3001/agent/dashboard
   3. Verify the agent can see their leads and itineraries
   4. Test the dashboard functionality

🔐 Login Credentials:
   - Email: agent@travelplatform.com
   - Password: [Your chosen password]
   - Dashboard: /agent/dashboard
*/

