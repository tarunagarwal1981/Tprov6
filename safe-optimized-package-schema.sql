-- =============================================
-- OPTIMIZED PACKAGE DATABASE SCHEMA (SAFE VERSION)
-- Handles existing tables and adds/modifies columns safely
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TABLES (Safe Creation)
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.tour_operators (
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
CREATE TABLE IF NOT EXISTS public.destinations (
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
-- PACKAGE TABLE MODIFICATIONS
-- =============================================

-- First, let's modify the existing packages table to add new columns
DO $$ 
BEGIN
    -- Add new columns to packages table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'short_description') THEN
        ALTER TABLE public.packages ADD COLUMN short_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'adult_price') THEN
        ALTER TABLE public.packages ADD COLUMN adult_price DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'child_price') THEN
        ALTER TABLE public.packages ADD COLUMN child_price DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'currency') THEN
        ALTER TABLE public.packages ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'duration_days') THEN
        ALTER TABLE public.packages ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'duration_hours') THEN
        ALTER TABLE public.packages ADD COLUMN duration_hours INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'min_group_size') THEN
        ALTER TABLE public.packages ADD COLUMN min_group_size INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'max_group_size') THEN
        ALTER TABLE public.packages ADD COLUMN max_group_size INTEGER NOT NULL DEFAULT 10;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'slug') THEN
        ALTER TABLE public.packages ADD COLUMN slug TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'meta_title') THEN
        ALTER TABLE public.packages ADD COLUMN meta_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'packages' AND column_name = 'meta_description') THEN
        ALTER TABLE public.packages ADD COLUMN meta_description TEXT;
    END IF;
END $$;

-- Update the type constraint to include new package types
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'packages_type_check') THEN
        ALTER TABLE public.packages DROP CONSTRAINT packages_type_check;
    END IF;
    
    -- Add new constraint with updated package types
    ALTER TABLE public.packages ADD CONSTRAINT packages_type_check 
    CHECK (type IN ('ACTIVITY', 'TRANSFERS', 'MULTI_CITY_PACKAGE', 'MULTI_CITY_PACKAGE_WITH_HOTEL', 'FIXED_DEPARTURE_WITH_FLIGHT'));
END $$;

-- =============================================
-- NEW OPTIMIZED PACKAGE TABLES
-- =============================================

-- Package destinations (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.package_destinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, destination_id)
);

-- Package inclusions (normalized for better search)
CREATE TABLE IF NOT EXISTS public.package_inclusions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  inclusion TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package exclusions (normalized for better search)
CREATE TABLE IF NOT EXISTS public.package_exclusions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  exclusion TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package itinerary (normalized for better querying)
CREATE TABLE IF NOT EXISTS public.package_itinerary (
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
CREATE TABLE IF NOT EXISTS public.package_type_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  field_value TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'number', 'boolean', 'date')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, field_name)
);

-- Package cancellation policies (normalized)
CREATE TABLE IF NOT EXISTS public.package_cancellation_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  days_before_departure INTEGER NOT NULL,
  cancellation_fee_percentage DECIMAL(5,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package images (optimized)
CREATE TABLE IF NOT EXISTS public.package_images (
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
-- BOOKING TABLE MODIFICATIONS
-- =============================================

-- Modify existing bookings table to add new columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_reference') THEN
        ALTER TABLE public.bookings ADD COLUMN booking_reference TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_price') THEN
        ALTER TABLE public.bookings ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'currency') THEN
        ALTER TABLE public.bookings ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'adult_count') THEN
        ALTER TABLE public.bookings ADD COLUMN adult_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'child_count') THEN
        ALTER TABLE public.bookings ADD COLUMN child_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'departure_date') THEN
        ALTER TABLE public.bookings ADD COLUMN departure_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'return_date') THEN
        ALTER TABLE public.bookings ADD COLUMN return_date DATE;
    END IF;
END $$;

-- Booking travelers (normalized)
CREATE TABLE IF NOT EXISTS public.booking_travelers (
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

-- =============================================
-- PERFORMANCE INDEXES (Safe Creation)
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);

-- Tour Operators indexes
CREATE INDEX IF NOT EXISTS idx_tour_operators_user_id ON public.tour_operators(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_operators_verified ON public.tour_operators(is_verified);
CREATE INDEX IF NOT EXISTS idx_tour_operators_rating ON public.tour_operators(rating);

-- Packages indexes (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_packages_tour_operator_id ON public.packages(tour_operator_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_type ON public.packages(type);
CREATE INDEX IF NOT EXISTS idx_packages_featured ON public.packages(is_featured);
CREATE INDEX IF NOT EXISTS idx_packages_rating ON public.packages(rating);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON public.packages(created_at);
CREATE INDEX IF NOT EXISTS idx_packages_slug ON public.packages(slug);
CREATE INDEX IF NOT EXISTS idx_packages_price_range ON public.packages(adult_price, child_price);
CREATE INDEX IF NOT EXISTS idx_packages_duration ON public.packages(duration_days);
CREATE INDEX IF NOT EXISTS idx_packages_group_size ON public.packages(min_group_size, max_group_size);
CREATE INDEX IF NOT EXISTS idx_packages_difficulty ON public.packages(difficulty);
CREATE INDEX IF NOT EXISTS idx_packages_tags ON public.packages USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_packages_search ON public.packages(status, type, adult_price, rating);
CREATE INDEX IF NOT EXISTS idx_packages_featured_search ON public.packages(is_featured, status, type);

-- Package destinations indexes
CREATE INDEX IF NOT EXISTS idx_package_destinations_package_id ON public.package_destinations(package_id);
CREATE INDEX IF NOT EXISTS idx_package_destinations_destination_id ON public.package_destinations(destination_id);
CREATE INDEX IF NOT EXISTS idx_package_destinations_primary ON public.package_destinations(is_primary);

-- Package inclusions/exclusions indexes
CREATE INDEX IF NOT EXISTS idx_package_inclusions_package_id ON public.package_inclusions(package_id);
CREATE INDEX IF NOT EXISTS idx_package_exclusions_package_id ON public.package_exclusions(package_id);

-- Package itinerary indexes
CREATE INDEX IF NOT EXISTS idx_package_itinerary_package_id ON public.package_itinerary(package_id);
CREATE INDEX IF NOT EXISTS idx_package_itinerary_day ON public.package_itinerary(package_id, day_number);

-- Package type details indexes
CREATE INDEX IF NOT EXISTS idx_package_type_details_package_id ON public.package_type_details(package_id);
CREATE INDEX IF NOT EXISTS idx_package_type_details_field ON public.package_type_details(field_name);

-- Package cancellation policies indexes
CREATE INDEX IF NOT EXISTS idx_package_cancellation_policies_package_id ON public.package_cancellation_policies(package_id);

-- Package images indexes
CREATE INDEX IF NOT EXISTS idx_package_images_package_id ON public.package_images(package_id);
CREATE INDEX IF NOT EXISTS idx_package_images_primary ON public.package_images(is_primary);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON public.bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_agent_id ON public.bookings(travel_agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(departure_date, return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);

-- Booking travelers indexes
CREATE INDEX IF NOT EXISTS idx_booking_travelers_booking_id ON public.booking_travelers(booking_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_package_id ON public.reviews(package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON public.reviews(is_verified);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Safe Creation)
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

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
    -- Users policies
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
    DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
    
    -- Tour Operators policies
    DROP POLICY IF EXISTS "Tour operators can view their own profile" ON public.tour_operators;
    DROP POLICY IF EXISTS "Tour operators can update their own profile" ON public.tour_operators;
    DROP POLICY IF EXISTS "Anyone can view verified tour operators" ON public.tour_operators;
    DROP POLICY IF EXISTS "Tour operators can create their profile" ON public.tour_operators;
    
    -- Packages policies
    DROP POLICY IF EXISTS "Anyone can view active packages" ON public.packages;
    DROP POLICY IF EXISTS "Tour operators can manage their own packages" ON public.packages;
    DROP POLICY IF EXISTS "Admins can manage all packages" ON public.packages;
    
    -- Package related tables policies
    DROP POLICY IF EXISTS "Package destinations follow package policies" ON public.package_destinations;
    DROP POLICY IF EXISTS "Package inclusions follow package policies" ON public.package_inclusions;
    DROP POLICY IF EXISTS "Package exclusions follow package policies" ON public.package_exclusions;
    DROP POLICY IF EXISTS "Package itinerary follow package policies" ON public.package_itinerary;
    DROP POLICY IF EXISTS "Package type details follow package policies" ON public.package_type_details;
    DROP POLICY IF EXISTS "Package cancellation policies follow package policies" ON public.package_cancellation_policies;
    DROP POLICY IF EXISTS "Package images follow package policies" ON public.package_images;
    
    -- Bookings policies
    DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Travel agents can view their bookings" ON public.bookings;
    DROP POLICY IF EXISTS "Tour operators can view bookings for their packages" ON public.bookings;
    
    -- Booking travelers policies
    DROP POLICY IF EXISTS "Booking travelers follow booking policies" ON public.booking_travelers;
    
    -- Reviews policies
    DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
END $$;

-- Recreate all policies
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
      JOIN public.tour_operators tour_op ON p.tour_operator_id = tour_op.id
      WHERE p.id = package_id AND tour_op.user_id = auth.uid()
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
-- FUNCTIONS AND TRIGGERS (Safe Creation)
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables (drop first if exists)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_tour_operators_updated_at ON public.tour_operators;
DROP TRIGGER IF EXISTS update_packages_updated_at ON public.packages;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;

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

-- Trigger to create user profile on signup (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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

-- Trigger to generate package slug (drop first if exists)
DROP TRIGGER IF EXISTS generate_package_slug_trigger ON public.packages;
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

-- Trigger to update package rating (drop first if exists)
DROP TRIGGER IF EXISTS update_package_rating_trigger ON public.reviews;
CREATE TRIGGER update_package_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_package_rating();

-- =============================================
-- DATA MIGRATION FROM EXISTING JSONB FIELDS
-- =============================================

-- Migrate existing data from JSONB fields to new normalized columns
-- Update packages with data from existing JSONB fields
UPDATE public.packages 
SET 
    adult_price = COALESCE((pricing->>'basePrice')::DECIMAL(10,2), adult_price),
    child_price = COALESCE((pricing->>'childPrice')::DECIMAL(10,2), child_price),
    currency = COALESCE(pricing->>'currency', currency),
    duration_days = COALESCE((duration->>'days')::INTEGER, duration_days),
    duration_hours = COALESCE((duration->>'hours')::INTEGER, duration_hours),
    min_group_size = COALESCE((group_size->>'min')::INTEGER, min_group_size),
    max_group_size = COALESCE((group_size->>'max')::INTEGER, max_group_size)
WHERE pricing IS NOT NULL OR duration IS NOT NULL OR group_size IS NOT NULL;

-- Migrate inclusions from JSONB to normalized table
INSERT INTO public.package_inclusions (package_id, inclusion, order_index)
SELECT 
    p.id as package_id,
    inc.inclusion,
    inc.i as order_index
FROM public.packages p
CROSS JOIN LATERAL unnest(p.inclusions) WITH ORDINALITY AS inc(inclusion, i)
WHERE p.inclusions IS NOT NULL AND array_length(p.inclusions, 1) > 0
ON CONFLICT DO NOTHING;

-- Migrate exclusions from JSONB to normalized table
INSERT INTO public.package_exclusions (package_id, exclusion, order_index)
SELECT 
    p.id as package_id,
    exc.exclusion,
    exc.i as order_index
FROM public.packages p
CROSS JOIN LATERAL unnest(p.exclusions) WITH ORDINALITY AS exc(exclusion, i)
WHERE p.exclusions IS NOT NULL AND array_length(p.exclusions, 1) > 0
ON CONFLICT DO NOTHING;

-- Migrate itinerary from JSONB to normalized table
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
FROM public.packages p
CROSS JOIN LATERAL jsonb_array_elements(p.itinerary) WITH ORDINALITY AS it(itinerary_item, i)
WHERE p.itinerary IS NOT NULL AND jsonb_array_length(p.itinerary) > 0
ON CONFLICT DO NOTHING;

-- Migrate type-specific fields to normalized table
INSERT INTO public.package_type_details (package_id, field_name, field_value, field_type)
SELECT 
    p.id as package_id,
    'startTime' as field_name,
    p.pricing->>'startTime' as field_value,
    'text' as field_type
FROM public.packages p
WHERE p.pricing->>'startTime' IS NOT NULL
ON CONFLICT (package_id, field_name) DO NOTHING;

INSERT INTO public.package_type_details (package_id, field_name, field_value, field_type)
SELECT 
    p.id as package_id,
    'endTime' as field_name,
    p.pricing->>'endTime' as field_value,
    'text' as field_type
FROM public.packages p
WHERE p.pricing->>'endTime' IS NOT NULL
ON CONFLICT (package_id, field_name) DO NOTHING;

INSERT INTO public.package_type_details (package_id, field_name, field_value, field_type)
SELECT 
    p.id as package_id,
    'fromLocation' as field_name,
    p.pricing->>'fromLocation' as field_value,
    'text' as field_type
FROM public.packages p
WHERE p.pricing->>'fromLocation' IS NOT NULL
ON CONFLICT (package_id, field_name) DO NOTHING;

INSERT INTO public.package_type_details (package_id, field_name, field_value, field_type)
SELECT 
    p.id as package_id,
    'toLocation' as field_name,
    p.pricing->>'toLocation' as field_value,
    'text' as field_type
FROM public.packages p
WHERE p.pricing->>'toLocation' IS NOT NULL
ON CONFLICT (package_id, field_name) DO NOTHING;

-- Migrate cancellation policies from JSONB to normalized table
INSERT INTO public.package_cancellation_policies (package_id, days_before_departure, cancellation_fee_percentage, description)
SELECT 
    p.id as package_id,
    COALESCE((policy->>'daysBeforeDeparture')::INTEGER, 0) as days_before_departure,
    COALESCE((policy->>'feePercentage')::DECIMAL(5,2), 0) as cancellation_fee_percentage,
    policy->>'description' as description
FROM public.packages p
CROSS JOIN LATERAL jsonb_array_elements(p.cancellation_policy) AS policy
WHERE p.cancellation_policy IS NOT NULL AND jsonb_array_length(p.cancellation_policy) > 0
ON CONFLICT DO NOTHING;

-- =============================================
-- UPDATE TABLE STATISTICS
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
  'Packages with new columns' as table_name,
  COUNT(*) as record_count
FROM public.packages
WHERE adult_price IS NOT NULL OR child_price IS NOT NULL OR duration_days IS NOT NULL

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
  'Package cancellation policies migrated' as table_name,
  COUNT(*) as record_count
FROM public.package_cancellation_policies;
