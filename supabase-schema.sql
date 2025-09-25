-- =============================================
-- Travel Booking Platform Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'TRAVEL_AGENT' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TOUR_OPERATOR', 'TRAVEL_AGENT')),
  profile JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour Operators table
CREATE TABLE public.tour_operators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  company_details JSONB NOT NULL DEFAULT '{}',
  commission_rates JSONB NOT NULL DEFAULT '{}',
  licenses JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Destinations table
CREATE TABLE public.destinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  coordinates JSONB NOT NULL DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  best_time_to_visit TEXT[] DEFAULT '{}',
  weather JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE public.packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tour_operator_id UUID REFERENCES public.tour_operators(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ACTIVITY', 'TRANSFERS', 'LAND_PACKAGE', 'CRUISE', 'HOTEL', 'FLIGHT', 'COMBO', 'CUSTOM')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED')),
  pricing JSONB NOT NULL DEFAULT '{}',
  itinerary JSONB DEFAULT '[]',
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  terms_and_conditions TEXT[] DEFAULT '{}',
  cancellation_policy JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  destinations TEXT[] DEFAULT '{}',
  duration JSONB NOT NULL DEFAULT '{}',
  group_size JSONB NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'EASY' CHECK (difficulty IN ('EASY', 'MODERATE', 'CHALLENGING', 'EXPERT')),
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  travel_agent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED')),
  travelers JSONB NOT NULL DEFAULT '[]',
  pricing JSONB NOT NULL DEFAULT '{}',
  dates JSONB NOT NULL DEFAULT '{}',
  special_requests TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, user_id)
);

-- Package Images table
CREATE TABLE public.package_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Tour Operators indexes
CREATE INDEX idx_tour_operators_user_id ON public.tour_operators(user_id);
CREATE INDEX idx_tour_operators_verified ON public.tour_operators(is_verified);
CREATE INDEX idx_tour_operators_rating ON public.tour_operators(rating);

-- Packages indexes
CREATE INDEX idx_packages_tour_operator_id ON public.packages(tour_operator_id);
CREATE INDEX idx_packages_status ON public.packages(status);
CREATE INDEX idx_packages_type ON public.packages(type);
CREATE INDEX idx_packages_featured ON public.packages(is_featured);
CREATE INDEX idx_packages_rating ON public.packages(rating);
CREATE INDEX idx_packages_created_at ON public.packages(created_at);
CREATE INDEX idx_packages_destinations ON public.packages USING GIN(destinations);
CREATE INDEX idx_packages_tags ON public.packages USING GIN(tags);

-- Bookings indexes
CREATE INDEX idx_bookings_package_id ON public.bookings(package_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_travel_agent_id ON public.bookings(travel_agent_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);

-- Reviews indexes
CREATE INDEX idx_reviews_package_id ON public.reviews(package_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);

-- Package Images indexes
CREATE INDEX idx_package_images_package_id ON public.package_images(package_id);
CREATE INDEX idx_package_images_primary ON public.package_images(is_primary);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_images ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Tour Operators policies
CREATE POLICY "Tour operators can view their own profile" ON public.tour_operators
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Tour operators can update their own profile" ON public.tour_operators
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view verified tour operators" ON public.tour_operators
  FOR SELECT USING (is_verified = true);

CREATE POLICY "Tour operators can create their profile" ON public.tour_operators
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Packages policies
CREATE POLICY "Anyone can view active packages" ON public.packages
  FOR SELECT USING (status = 'ACTIVE');

CREATE POLICY "Tour operators can manage their own packages" ON public.packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.tour_operators 
      WHERE id = tour_operator_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all packages" ON public.packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Travel agents can view their bookings" ON public.bookings
  FOR SELECT USING (travel_agent_id = auth.uid());

CREATE POLICY "Tour operators can view bookings for their packages" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators to ON p.tour_operator_id = to.id
      WHERE p.id = package_id AND to.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (user_id = auth.uid());

-- Package Images policies
CREATE POLICY "Anyone can view package images" ON public.package_images
  FOR SELECT USING (true);

CREATE POLICY "Tour operators can manage images for their packages" ON public.package_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators to ON p.tour_operator_id = to.id
      WHERE p.id = package_id AND to.user_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tour_operators_updated_at BEFORE UPDATE ON public.tour_operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'TRAVEL_AGENT')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update package rating when review is added/updated
CREATE OR REPLACE FUNCTION update_package_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  -- Calculate average rating and count for the package
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
  INTO avg_rating, review_count
  FROM public.reviews
  WHERE package_id = COALESCE(NEW.package_id, OLD.package_id);
  
  -- Update package with new rating and count
  UPDATE public.packages
  SET rating = COALESCE(avg_rating, 0.0),
      review_count = review_count
  WHERE id = COALESCE(NEW.package_id, OLD.package_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update package rating
CREATE TRIGGER update_package_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_package_rating();

-- =============================================
-- LEADS MARKETPLACE TABLES
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

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Insert sample destinations
INSERT INTO public.destinations (name, country, city, coordinates, highlights, best_time_to_visit, weather) VALUES
('Paris', 'France', 'Paris', '{"latitude": 48.8566, "longitude": 2.3522}', '{"Eiffel Tower", "Louvre Museum", "Notre-Dame", "Champs-Élysées"}', '{"Spring", "Fall"}', '{"temperature": {"min": 5, "max": 25, "unit": "C"}, "conditions": ["Rainy", "Sunny"], "bestMonths": ["April", "May", "September", "October"]}'),
('Tokyo', 'Japan', 'Tokyo', '{"latitude": 35.6762, "longitude": 139.6503}', '{"Tokyo Skytree", "Senso-ji Temple", "Shibuya Crossing", "Tsukiji Fish Market"}', '{"Spring", "Fall"}', '{"temperature": {"min": 2, "max": 30, "unit": "C"}, "conditions": ["Rainy", "Sunny", "Snowy"], "bestMonths": ["March", "April", "October", "November"]}'),
('New York', 'USA', 'New York', '{"latitude": 40.7128, "longitude": -74.0060}', '{"Statue of Liberty", "Central Park", "Times Square", "Brooklyn Bridge"}', '{"Spring", "Fall"}', '{"temperature": {"min": -5, "max": 35, "unit": "C"}, "conditions": ["Rainy", "Sunny", "Snowy"], "bestMonths": ["April", "May", "September", "October"]}');

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('package-images', 'package-images', true),
('user-avatars', 'user-avatars', true),
('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Anyone can view package images" ON storage.objects
  FOR SELECT USING (bucket_id = 'package-images');

CREATE POLICY "Authenticated users can upload package images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'package-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own package images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'package-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own package images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'package-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
