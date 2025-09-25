-- =============================================
-- ACTIVITY PACKAGE ENHANCEMENT MIGRATION
-- Adds missing fields for comprehensive activity package management
-- =============================================

-- Add activity-specific fields to packages table
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS activity_category TEXT;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS operational_hours JSONB DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS meeting_point TEXT;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS transfer_options TEXT[] DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS max_capacity INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS languages_supported TEXT[] DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS accessibility_info TEXT[] DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS age_restrictions JSONB DEFAULT '{}';
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS important_info TEXT;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]';

-- Create package variants table for multiple ticket/package options
CREATE TABLE IF NOT EXISTS public.package_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  description TEXT,
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  price_adult DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_child DECIMAL(10,2) DEFAULT 0,
  price_infant DECIMAL(10,2) DEFAULT 0,
  min_guests INTEGER DEFAULT 1,
  max_guests INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_packages_activity_category ON public.packages(activity_category);
CREATE INDEX IF NOT EXISTS idx_packages_available_days ON public.packages USING GIN(available_days);
CREATE INDEX IF NOT EXISTS idx_packages_languages_supported ON public.packages USING GIN(languages_supported);
CREATE INDEX IF NOT EXISTS idx_packages_transfer_options ON public.packages USING GIN(transfer_options);

CREATE INDEX IF NOT EXISTS idx_package_variants_package_id ON public.package_variants(package_id);
CREATE INDEX IF NOT EXISTS idx_package_variants_active ON public.package_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_package_variants_order ON public.package_variants(order_index);

-- Add updated_at trigger for package_variants
CREATE TRIGGER update_package_variants_updated_at 
  BEFORE UPDATE ON public.package_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on package_variants
ALTER TABLE public.package_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for package_variants
CREATE POLICY "Anyone can view active package variants" ON public.package_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Tour operators can manage variants for their packages" ON public.package_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_op ON p.tour_operator_id = tour_op.id
      WHERE p.id = package_id AND tour_op.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all package variants" ON public.package_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Add comments for documentation
COMMENT ON COLUMN public.packages.activity_category IS 'Type of activity (e.g., Sightseeing, Aquarium, Family)';
COMMENT ON COLUMN public.packages.available_days IS 'Days of week when activity operates';
COMMENT ON COLUMN public.packages.operational_hours IS 'Operating hours and time slots';
COMMENT ON COLUMN public.packages.meeting_point IS 'Where customers meet for the activity';
COMMENT ON COLUMN public.packages.emergency_contact IS 'Emergency contact information';
COMMENT ON COLUMN public.packages.transfer_options IS 'Available transfer options';
COMMENT ON COLUMN public.packages.max_capacity IS 'Maximum capacity per slot/group';
COMMENT ON COLUMN public.packages.languages_supported IS 'Languages available for the activity';
COMMENT ON COLUMN public.packages.accessibility_info IS 'Accessibility and special needs information';
COMMENT ON COLUMN public.packages.age_restrictions IS 'Age policies and restrictions';
COMMENT ON COLUMN public.packages.important_info IS 'Important information for customers';
COMMENT ON COLUMN public.packages.faq IS 'Frequently asked questions';

COMMENT ON TABLE public.package_variants IS 'Different package/ticket options for the same activity';
COMMENT ON COLUMN public.package_variants.variant_name IS 'Name of the variant (e.g., General Admission, VIP Experience)';
COMMENT ON COLUMN public.package_variants.order_index IS 'Display order for variants';
