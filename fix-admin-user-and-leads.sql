-- =============================================
-- FIX ADMIN USER AND CREATE LEADS MARKETPLACE
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CHECK EXISTING USERS
-- =============================================

-- First, let's see what users exist
SELECT 'Current users in public.users:' as info;
SELECT id, email, name, role FROM public.users;

-- =============================================
-- 2. FIND EXISTING ADMIN USER
-- =============================================

-- Find the existing admin user and get their ID
-- This will show us the actual admin user ID to use
SELECT 'Existing admin user found:' as info;
SELECT id, email, name, role FROM public.users WHERE role = 'ADMIN' LIMIT 1;

-- =============================================
-- 3. GET ADMIN USER ID FOR LEADS
-- =============================================

-- Store the admin user ID in a variable for use in leads
-- This will be used in the INSERT statements below
SELECT 'Admin user ID to use for leads:' as info;
SELECT id as admin_user_id FROM public.users WHERE role = 'ADMIN' LIMIT 1;

-- =============================================
-- 4. CREATE LEADS MARKETPLACE TABLE (if not exists)
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
-- 5. CREATE PURCHASED LEADS TABLE (if not exists)
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
-- 6. CREATE INDEXES
-- =============================================

-- Indexes for leads marketplace
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_status ON public.leads_marketplace(status);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_destination ON public.leads_marketplace(destination);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_trip_type ON public.leads_marketplace(trip_type);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_budget ON public.leads_marketplace(budget);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_created_at ON public.leads_marketplace(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_marketplace_expires_at ON public.leads_marketplace(expires_at);

-- Indexes for purchased leads
CREATE INDEX IF NOT EXISTS idx_purchased_leads_agent_id ON public.purchased_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_lead_id ON public.purchased_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_status ON public.purchased_leads(status);
CREATE INDEX IF NOT EXISTS idx_purchased_leads_purchase_date ON public.purchased_leads(purchase_date);

-- =============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.leads_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_leads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. CREATE RLS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view available leads" ON public.leads_marketplace;
DROP POLICY IF EXISTS "Admins can manage leads" ON public.leads_marketplace;
DROP POLICY IF EXISTS "Agents can view their purchased leads" ON public.purchased_leads;
DROP POLICY IF EXISTS "Agents can update their purchased leads" ON public.purchased_leads;
DROP POLICY IF EXISTS "Agents can insert purchased leads" ON public.purchased_leads;

-- RLS Policies for leads_marketplace
CREATE POLICY "Anyone can view available leads" ON public.leads_marketplace
  FOR SELECT USING (status = 'AVAILABLE');

CREATE POLICY "Admins can manage leads" ON public.leads_marketplace
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- RLS Policies for purchased_leads
CREATE POLICY "Agents can view their purchased leads" ON public.purchased_leads
  FOR SELECT USING (auth.uid() = agent_id);

CREATE POLICY "Agents can update their purchased leads" ON public.purchased_leads
  FOR UPDATE USING (auth.uid() = agent_id);

CREATE POLICY "Agents can insert purchased leads" ON public.purchased_leads
  FOR INSERT WITH CHECK (auth.uid() = agent_id);

-- =============================================
-- 9. INSERT SAMPLE DATA
-- =============================================

-- Clear existing data first
DELETE FROM public.leads_marketplace;

-- Insert sample leads using the existing admin user ID
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
  status,
  priority,
  lead_price,
  commission_rate,
  notes,
  estimated_value,
  probability_of_booking
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
  'AVAILABLE',
  'HIGH',
  75.00,
  12.00,
  'Interested in water sports and local cuisine. Very responsive to emails.',
  3000.00,
  75.00
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
  ARRAY['Museums', 'Fine dining', 'Art galleries', 'Historical sites'],
  'AVAILABLE',
  'MEDIUM',
  100.00,
  15.00,
  'First time visiting Europe. Interested in cultural experiences.',
  5000.00,
  60.00
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
  ARRAY['Temples', 'Traditional cuisine', 'Shopping', 'Cherry blossoms'],
  'AVAILABLE',
  'HIGH',
  90.00,
  12.00,
  'Solo traveler interested in Japanese culture and cuisine.',
  4000.00,
  80.00
),
(
  (SELECT id FROM public.users WHERE role = 'ADMIN' LIMIT 1),
  'David Thompson',
  'david.thompson@email.com',
  '+1-555-0321',
  'Maldives',
  6000.00,
  'LUXURY',
  2,
  5,
  '2024-06-01',
  '2024-06-06',
  ARRAY['Overwater bungalows', 'Spa treatments', 'Snorkeling', 'Sunset dinners'],
  'AVAILABLE',
  'HIGH',
  150.00,
  20.00,
  'Anniversary trip. Looking for luxury resort with overwater bungalow.',
  6000.00,
  85.00
),
(
  (SELECT id FROM public.users WHERE role = 'ADMIN' LIMIT 1),
  'Lisa Wang',
  'lisa.wang@email.com',
  '+1-555-0654',
  'Thailand',
  2500.00,
  'BEACH',
  3,
  12,
  '2024-07-15',
  '2024-07-27',
  ARRAY['Beach resorts', 'Island hopping', 'Street food', 'Temples'],
  'AVAILABLE',
  'MEDIUM',
  60.00,
  10.00,
  'Family trip with teenager. Budget-conscious but wants good value.',
  2500.00,
  70.00
);

-- =============================================
-- 10. VERIFY DATA
-- =============================================

SELECT 'Final verification:' as info;

-- Check if tables were created successfully
SELECT 'leads_marketplace' as table_name, COUNT(*) as record_count FROM public.leads_marketplace
UNION ALL
SELECT 'purchased_leads' as table_name, COUNT(*) as record_count FROM public.purchased_leads;

-- Show sample leads with admin info
SELECT 
  lm.id,
  lm.customer_name,
  lm.destination,
  lm.budget,
  lm.trip_type,
  lm.status,
  lm.lead_price,
  u.name as admin_name,
  lm.created_at
FROM public.leads_marketplace lm
JOIN public.users u ON lm.admin_id = u.id
ORDER BY lm.created_at DESC;
