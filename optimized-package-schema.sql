-- =============================================
-- OPTIMIZED PACKAGE DATABASE SCHEMA
-- Production-ready, scalable, and secure
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TABLES (Optimized)
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

-- =============================================
-- OPTIMIZED PACKAGE TABLES
-- =============================================

-- Main packages table (simplified and optimized)
CREATE TABLE public.packages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tour_operator_id UUID REFERENCES public.tour_operators(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT, -- For cards and listings
  type TEXT NOT NULL CHECK (type IN ('ACTIVITY', 'TRANSFERS', 'MULTI_CITY_PACKAGE', 'MULTI_CITY_PACKAGE_WITH_HOTEL', 'FIXED_DEPARTURE_WITH_FLIGHT')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED')),
  
  -- Pricing (normalized for better performance)
  adult_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  child_price DECIMAL(10,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR')),
  
  -- Duration and group size (normalized)
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_hours INTEGER DEFAULT 0,
  min_group_size INTEGER NOT NULL DEFAULT 1,
  max_group_size INTEGER NOT NULL DEFAULT 10,
  
  -- Basic package info
  difficulty TEXT NOT NULL DEFAULT 'EASY' CHECK (difficulty IN ('EASY', 'MODERATE', 'CHALLENGING', 'EXPERT')),
  tags TEXT[] DEFAULT '{}',
  
  -- SEO and marketing
  slug TEXT UNIQUE, -- For SEO-friendly URLs
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status and ratings
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package destinations (many-to-many relationship)
CREATE TABLE public.package_destinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, destination_id)
);

-- Package inclusions (normalized for better search)
CREATE TABLE public.package_inclusions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  inclusion TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package exclusions (normalized for better search)
CREATE TABLE public.package_exclusions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  exclusion TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package itinerary (normalized for better querying)
CREATE TABLE public.package_itinerary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activities TEXT[] DEFAULT '{}',
  meals_included TEXT[] DEFAULT '{}',
  accommodation TEXT,
  transportation TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package type-specific details (flexible but indexed)
CREATE TABLE public.package_type_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'number', 'boolean', 'date')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, field_name)
);

-- Package cancellation policies (normalized)
CREATE TABLE public.package_cancellation_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  days_before_departure INTEGER NOT NULL,
  cancellation_fee_percentage DECIMAL(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package images (optimized)
CREATE TABLE public.package_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  file_size INTEGER, -- in bytes
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOKING TABLES (Optimized)
-- =============================================

-- Bookings table (simplified)
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  travel_agent_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Booking details
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED')),
  booking_reference TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
  
  -- Pricing
  total_price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  adult_count INTEGER NOT NULL DEFAULT 0,
  child_count INTEGER NOT NULL DEFAULT 0,
  
  -- Dates
  departure_date DATE,
  return_date DATE,
  
  -- Additional info
  special_requests TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking travelers (normalized)
CREATE TABLE public.booking_travelers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  passport_number TEXT,
  passport_expiry DATE,
  dietary_requirements TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table (optimized)
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  
  -- Review metadata
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(package_id, user_id)
);

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Tour Operators indexes
CREATE INDEX idx_tour_operators_user_id ON public.tour_operators(user_id);
CREATE INDEX idx_tour_operators_verified ON public.tour_operators(is_verified);
CREATE INDEX idx_tour_operators_rating ON public.tour_operators(rating);

-- Packages indexes (optimized for common queries)
CREATE INDEX idx_packages_tour_operator_id ON public.packages(tour_operator_id);
CREATE INDEX idx_packages_status ON public.packages(status);
CREATE INDEX idx_packages_type ON public.packages(type);
CREATE INDEX idx_packages_featured ON public.packages(is_featured);
CREATE INDEX idx_packages_rating ON public.packages(rating);
CREATE INDEX idx_packages_created_at ON public.packages(created_at);
CREATE INDEX idx_packages_slug ON public.packages(slug);
CREATE INDEX idx_packages_price_range ON public.packages(adult_price, child_price);
CREATE INDEX idx_packages_duration ON public.packages(duration_days);
CREATE INDEX idx_packages_group_size ON public.packages(min_group_size, max_group_size);
CREATE INDEX idx_packages_difficulty ON public.packages(difficulty);
CREATE INDEX idx_packages_tags ON public.packages USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX idx_packages_search ON public.packages(status, type, adult_price, rating);
CREATE INDEX idx_packages_featured_search ON public.packages(is_featured, status, type);

-- Package destinations indexes
CREATE INDEX idx_package_destinations_package_id ON public.package_destinations(package_id);
CREATE INDEX idx_package_destinations_destination_id ON public.package_destinations(destination_id);
CREATE INDEX idx_package_destinations_primary ON public.package_destinations(is_primary);

-- Package inclusions/exclusions indexes
CREATE INDEX idx_package_inclusions_package_id ON public.package_inclusions(package_id);
CREATE INDEX idx_package_exclusions_package_id ON public.package_exclusions(package_id);

-- Package itinerary indexes
CREATE INDEX idx_package_itinerary_package_id ON public.package_itinerary(package_id);
CREATE INDEX idx_package_itinerary_day ON public.package_itinerary(package_id, day_number);

-- Package type details indexes
CREATE INDEX idx_package_type_details_package_id ON public.package_type_details(package_id);
CREATE INDEX idx_package_type_details_field ON public.package_type_details(field_name);

-- Package cancellation policies indexes
CREATE INDEX idx_package_cancellation_policies_package_id ON public.package_cancellation_policies(package_id);

-- Package images indexes
CREATE INDEX idx_package_images_package_id ON public.package_images(package_id);
CREATE INDEX idx_package_images_primary ON public.package_images(is_primary);

-- Bookings indexes
CREATE INDEX idx_bookings_package_id ON public.bookings(package_id);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_travel_agent_id ON public.bookings(travel_agent_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX idx_bookings_dates ON public.bookings(departure_date, return_date);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at);

-- Booking travelers indexes
CREATE INDEX idx_booking_travelers_booking_id ON public.booking_travelers(booking_id);

-- Reviews indexes
CREATE INDEX idx_reviews_package_id ON public.reviews(package_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_verified ON public.reviews(is_verified);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_exclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_type_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_cancellation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

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

-- Package related tables policies (inherit from packages)
CREATE POLICY "Package destinations follow package policies" ON public.package_destinations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
    )
  );

CREATE POLICY "Package inclusions follow package policies" ON public.package_inclusions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
    )
  );

CREATE POLICY "Package exclusions follow package policies" ON public.package_exclusions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
    )
  );

CREATE POLICY "Package itinerary follow package policies" ON public.package_itinerary
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
    )
  );

CREATE POLICY "Package type details follow package policies" ON public.package_type_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
    )
  );

CREATE POLICY "Package cancellation policies follow package policies" ON public.package_cancellation_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
    )
  );

CREATE POLICY "Package images follow package policies" ON public.package_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      WHERE p.id = package_id
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

-- Booking travelers policies
CREATE POLICY "Booking travelers follow booking policies" ON public.booking_travelers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
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

-- Function to generate package slug
CREATE OR REPLACE FUNCTION generate_package_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.packages WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug = NEW.slug || '-' || extract(epoch from now())::text;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate package slug
CREATE TRIGGER generate_package_slug_trigger
  BEFORE INSERT OR UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION generate_package_slug();

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
