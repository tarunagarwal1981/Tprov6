-- =============================================
-- ENHANCED TRANSFER PACKAGE SYSTEM MIGRATION
-- Adds vehicle configurations, locations, and additional services
-- =============================================

-- Add transfer-specific fields to existing packages table
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS transfer_service_type VARCHAR(50);
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS distance_km DECIMAL(8,2);
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(50);
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS advance_booking_hours INTEGER DEFAULT 24;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS cancellation_policy_text TEXT;

-- Create vehicle configurations table
CREATE TABLE IF NOT EXISTS public.transfer_vehicle_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transfer_package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL, -- Allow custom vehicle types
  name VARCHAR(255) NOT NULL,
  min_passengers INTEGER NOT NULL CHECK (min_passengers >= 1),
  max_passengers INTEGER NOT NULL CHECK (max_passengers >= min_passengers),
  base_price DECIMAL(10,2) NOT NULL,
  per_km_rate DECIMAL(10,2),
  per_hour_rate DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  description TEXT,
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create transfer locations table (pickup/dropoff points)
CREATE TABLE IF NOT EXISTS public.transfer_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transfer_package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PICKUP', 'DROPOFF')),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  coordinates POINT,
  landmark_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create additional services table
CREATE TABLE IF NOT EXISTS public.transfer_additional_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transfer_package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_optional BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transfer_vehicle_configs_package_id ON public.transfer_vehicle_configs(transfer_package_id);
CREATE INDEX IF NOT EXISTS idx_transfer_vehicle_configs_active ON public.transfer_vehicle_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_transfer_vehicle_configs_order ON public.transfer_vehicle_configs(order_index);
CREATE INDEX IF NOT EXISTS idx_transfer_vehicle_configs_type ON public.transfer_vehicle_configs(vehicle_type);

CREATE INDEX IF NOT EXISTS idx_transfer_locations_package_id ON public.transfer_locations(transfer_package_id);
CREATE INDEX IF NOT EXISTS idx_transfer_locations_type ON public.transfer_locations(type);
CREATE INDEX IF NOT EXISTS idx_transfer_locations_active ON public.transfer_locations(is_active);

CREATE INDEX IF NOT EXISTS idx_transfer_additional_services_package_id ON public.transfer_additional_services(transfer_package_id);
CREATE INDEX IF NOT EXISTS idx_transfer_additional_services_active ON public.transfer_additional_services(is_active);

-- Add updated_at triggers
CREATE TRIGGER update_transfer_vehicle_configs_updated_at 
  BEFORE UPDATE ON public.transfer_vehicle_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfer_locations_updated_at 
  BEFORE UPDATE ON public.transfer_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfer_additional_services_updated_at 
  BEFORE UPDATE ON public.transfer_additional_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE public.transfer_vehicle_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_additional_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transfer_vehicle_configs
CREATE POLICY "Anyone can view active vehicle configs" ON public.transfer_vehicle_configs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tour operators can manage vehicle configs for their packages" ON public.transfer_vehicle_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_op ON p.tour_operator_id = tour_op.id
      WHERE p.id = transfer_package_id AND tour_op.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all vehicle configs" ON public.transfer_vehicle_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- RLS Policies for transfer_locations
CREATE POLICY "Anyone can view active transfer locations" ON public.transfer_locations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tour operators can manage locations for their packages" ON public.transfer_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_op ON p.tour_operator_id = tour_op.id
      WHERE p.id = transfer_package_id AND tour_op.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all transfer locations" ON public.transfer_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- RLS Policies for transfer_additional_services
CREATE POLICY "Anyone can view active additional services" ON public.transfer_additional_services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tour operators can manage services for their packages" ON public.transfer_additional_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_op ON p.tour_operator_id = tour_op.id
      WHERE p.id = transfer_package_id AND tour_op.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all additional services" ON public.transfer_additional_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE public.transfer_vehicle_configs IS 'Vehicle configurations for transfer packages';
COMMENT ON COLUMN public.transfer_vehicle_configs.vehicle_type IS 'Type of vehicle (e.g., Sedan, SUV, Luxury Sedan, Custom Type)';
COMMENT ON COLUMN public.transfer_vehicle_configs.name IS 'Custom name for the vehicle service';
COMMENT ON COLUMN public.transfer_vehicle_configs.features IS 'Array of vehicle features (AC, WiFi, Music System, etc.)';
COMMENT ON COLUMN public.transfer_vehicle_configs.order_index IS 'Display order for vehicle options';

COMMENT ON TABLE public.transfer_locations IS 'Pickup and dropoff points for transfer packages';
COMMENT ON COLUMN public.transfer_locations.type IS 'Location type: PICKUP or DROPOFF';
COMMENT ON COLUMN public.transfer_locations.coordinates IS 'GPS coordinates for the location';

COMMENT ON TABLE public.transfer_additional_services IS 'Additional services available for transfer packages';
COMMENT ON COLUMN public.transfer_additional_services.is_optional IS 'Whether the service is optional or included';

-- Migrate existing transfer packages to new structure
INSERT INTO public.transfer_vehicle_configs (
  transfer_package_id, 
  vehicle_type, 
  name, 
  min_passengers, 
  max_passengers, 
  base_price,
  order_index
)
SELECT 
  id,
  'SEDAN', -- Default vehicle type
  COALESCE(title, 'Standard Transfer') || ' - Sedan',
  1,
  4,
  COALESCE((pricing->>'adultPrice')::DECIMAL, 0),
  0
FROM public.packages 
WHERE type = 'TRANSFERS' 
AND pricing IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.transfer_vehicle_configs 
  WHERE transfer_package_id = packages.id
);
