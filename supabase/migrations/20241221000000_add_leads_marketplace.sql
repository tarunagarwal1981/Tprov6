-- =============================================
-- Add leads marketplace tables
-- =============================================

-- Leads marketplace table
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

-- Purchased leads table
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

-- Enable RLS
ALTER TABLE public.leads_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_leads ENABLE ROW LEVEL SECURITY;

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
