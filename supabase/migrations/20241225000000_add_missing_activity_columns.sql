-- =============================================
-- ADD MISSING ACTIVITY PACKAGE COLUMNS
-- Adds timing, duration_hours, difficulty, and terms_and_conditions
-- =============================================

-- Add missing activity-specific fields to packages table
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS timing TEXT;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS duration_hours INTEGER;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.packages.timing IS 'Activity timing information (e.g., Morning 6:00 AM - 10:00 AM)';
COMMENT ON COLUMN public.packages.duration_hours IS 'Duration of the activity in hours';
COMMENT ON COLUMN public.packages.difficulty IS 'Activity difficulty level (e.g., Easy, Moderate, Hard)';
COMMENT ON COLUMN public.packages.terms_and_conditions IS 'Terms and conditions for the activity';
