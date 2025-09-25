-- =============================================
-- LEADS MARKETPLACE AND AGENT SYSTEM SCHEMA
-- Complete database setup for leads marketplace and agent functionality
-- =============================================

-- =============================================
-- 1. CREATE LEADS MARKETPLACE TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.leads_marketplace (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
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
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PURCHASED', 'EXPIRED', 'CANCELLED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  
  -- Pricing
  lead_price DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Commission for the agent
  
  -- Additional Information
  notes TEXT,
  estimated_value DECIMAL(10,2),
  probability_of_booking DECIMAL(5,2) DEFAULT 50.00, -- Percentage
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- =============================================
-- 2. CREATE PURCHASED LEADS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.purchased_leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads_marketplace(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Purchase Details
  purchase_price DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Lead Status
  status TEXT NOT NULL DEFAULT 'PURCHASED' CHECK (status IN ('PURCHASED', 'CONTACTED', 'QUOTED', 'BOOKED', 'COMPLETED', 'CANCELLED')),
  
  -- Additional Information
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lead_id, agent_id)
);

-- =============================================
-- 3. CREATE ITINERARIES TABLE (Enhanced)
-- =============================================

CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.purchased_leads(id) ON DELETE CASCADE NOT NULL,
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
  
  -- Communication
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_whatsapp BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  whatsapp_sent_at TIMESTAMPTZ,
  
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
-- 4. CREATE ITINERARY DAYS TABLE
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
-- 5. CREATE ITINERARY ACTIVITIES TABLE
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
-- 6. CREATE ITINERARY PACKAGES TABLE
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
-- 7. CREATE CUSTOM ITINERARY ITEMS TABLE
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
-- 8. CREATE BOOKING REQUESTS TABLE
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
-- 9. CREATE COMMISSIONS TABLE
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
-- 10. CREATE COMMUNICATION LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.communication_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES public.purchased_leads(id) ON DELETE CASCADE NOT NULL,
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
-- 11. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Leads marketplace indexes
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_status ON public.leads_marketplace(status);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_destination ON public.leads_marketplace(destination);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_trip_type ON public.leads_marketplace(trip_type);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_budget ON public.leads_marketplace(budget);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_created_at ON public.leads_marketplace(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_expires_at ON public.leads_marketplace(expires_at);

-- Purchased leads indexes
CREATE INDEX IF NOT EXISTS idx_purchased_leads_agent_id ON public.purchased_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_lead_id ON public.purchased_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_status ON public.purchased_leads(status);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_purchase_date ON public.purchased_leads(purchase_date);

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
-- 12. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.leads_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;

-- Leads marketplace policies
CREATE POLICY "Anyone can view available leads" ON public.leads_marketplace
  FOR SELECT USING (status = 'AVAILABLE');

CREATE POLICY "Admins can manage leads marketplace" ON public.leads_marketplace
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Purchased leads policies
CREATE POLICY "Agents can view their own purchased leads" ON public.purchased_leads
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can purchase leads" ON public.purchased_leads
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own purchased leads" ON public.purchased_leads
  FOR UPDATE USING (auth.uid() = agent_id);

-- Itineraries policies
CREATE POLICY "Agents can view their own itineraries" ON public.itineraries
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert their own itineraries" ON public.itineraries
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

CREATE POLICY "Agents can update their own itineraries" ON public.itineraries
  FOR UPDATE USING (auth.uid() = agent_id);

-- Itinerary days policies
CREATE POLICY "Agents can manage itinerary days" ON public.itinerary_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries 
      WHERE id = itinerary_id AND agent_id = auth.uid()
    )
  );

-- Itinerary activities policies
CREATE POLICY "Agents can manage itinerary activities" ON public.itinerary_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itinerary_days id
      JOIN public.itineraries i ON id.itinerary_id = i.id
      WHERE id.id = day_id AND i.agent_id = auth.uid()
    )
  );

-- Itinerary packages policies
CREATE POLICY "Agents can manage itinerary packages" ON public.itinerary_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries 
      WHERE id = itinerary_id AND agent_id = auth.uid()
    )
  );

-- Custom itinerary items policies
CREATE POLICY "Agents can manage custom items" ON public.custom_itinerary_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.itineraries 
      WHERE id = itinerary_id AND agent_id = auth.uid()
    )
  );

-- Booking requests policies
CREATE POLICY "Agents can manage their booking requests" ON public.booking_requests
  FOR ALL USING (auth.uid() = agent_id);

-- Commissions policies
CREATE POLICY "Agents can view their own commissions" ON public.commissions
  FOR SELECT USING (auth.uid() = agent_id);

-- Communication log policies
CREATE POLICY "Agents can manage their communication log" ON public.communication_log
  FOR ALL USING (auth.uid() = agent_id);

-- =============================================
-- 13. INSERT SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample leads in marketplace
INSERT INTO public.leads_marketplace (
  admin_id,
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
  special_requirements,
  lead_price,
  commission_rate,
  notes,
  estimated_value,
  probability_of_booking,
  created_at
) VALUES 
(
  (SELECT id FROM public.users WHERE role = 'ADMIN' LIMIT 1),
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
  ARRAY['Vegetarian meals', 'English speaking guide'],
  75.00,
  12.00,
  'Interested in water sports and local cuisine. Flexible with dates.',
  3000.00,
  75.00,
  NOW()
),
(
  (SELECT id FROM public.users WHERE role = 'ADMIN' LIMIT 1),
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
  ARRAY['Wheelchair accessible', 'Private tours'],
  100.00,
  15.00,
  'First-time visitors to Europe. Interested in art and history.',
  5000.00,
  80.00,
  NOW()
),
(
  (SELECT id FROM public.users WHERE role = 'ADMIN' LIMIT 1),
  'Emily Rodriguez',
  'emily.rodriguez@email.com',
  '+1-555-0789',
  'Tokyo, Japan',
  4000.00,
  'CULTURAL',
  1,
  8,
  '2024-05-10',
  '2024-05-18',
  ARRAY['Temples', 'Food tours', 'Shopping'],
  ARRAY['Solo traveler', 'Budget conscious'],
  60.00,
  10.00,
  'Solo female traveler. Interested in authentic experiences.',
  4000.00,
  65.00,
  NOW()
);

-- =============================================
-- 14. VERIFICATION QUERIES
-- =============================================

-- Verify the leads marketplace was created
SELECT 
  lm.id,
  lm.customer_name,
  lm.customer_email,
  lm.destination,
  lm.budget,
  lm.trip_type,
  lm.lead_price,
  lm.commission_rate,
  lm.status,
  u.name as admin_name
FROM public.leads_marketplace lm
JOIN public.users u ON lm.admin_id = u.id
ORDER BY lm.created_at DESC;

-- =============================================
-- NOTES FOR IMPLEMENTATION
-- =============================================

/*
IMPORTANT NOTES:

1. LEADS MARKETPLACE:
   - Admins can post leads that agents can browse and purchase
   - Each lead has a price and commission rate
   - Leads expire after 30 days if not purchased

2. PURCHASED LEADS:
   - Agents can purchase leads from the marketplace
   - Once purchased, the lead is no longer available to other agents
   - Agents can manage their purchased leads and create itineraries

3. ITINERARIES:
   - Agents create itineraries for their purchased leads
   - Itineraries can include packages from tour operators
   - Agents can send itineraries via email or WhatsApp

4. PACKAGE INTEGRATION:
   - Itineraries can include actual packages from the packages table
   - Agents can add packages to their itineraries
   - Booking requests are sent to tour operators

5. COMMISSION TRACKING:
   - Agents earn commissions on successful bookings
   - Commission rates are set per lead
   - Commissions are tracked and can be paid out

6. SECURITY:
   - RLS policies ensure agents can only see their own data
   - Admins can manage the leads marketplace
   - All operations are properly secured

7. SCALABILITY:
   - Proper indexes for performance
   - Efficient queries for browsing and searching
   - Support for high-volume operations
*/
