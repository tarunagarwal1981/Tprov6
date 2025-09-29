-- =============================================
-- PACKAGE IMAGES TABLE MIGRATION
-- Creates table for storing package image metadata
-- =============================================

-- Create package_images table
CREATE TABLE IF NOT EXISTS public.package_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_package_images_package_id ON public.package_images(package_id);
CREATE INDEX IF NOT EXISTS idx_package_images_is_primary ON public.package_images(package_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_package_images_order ON public.package_images(package_id, order_index);

-- Enable RLS
ALTER TABLE public.package_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all package images" ON public.package_images
  FOR SELECT USING (true);

CREATE POLICY "Tour operators can insert their package images" ON public.package_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_ops ON p.tour_operator_id = tour_ops.id
      WHERE p.id = package_id AND tour_ops.user_id = auth.uid()
    )
  );

CREATE POLICY "Tour operators can update their package images" ON public.package_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_ops ON p.tour_operator_id = tour_ops.id
      WHERE p.id = package_id AND tour_ops.user_id = auth.uid()
    )
  );

CREATE POLICY "Tour operators can delete their package images" ON public.package_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.packages p
      JOIN public.tour_operators tour_ops ON p.tour_operator_id = tour_ops.id
      WHERE p.id = package_id AND tour_ops.user_id = auth.uid()
    )
  );

-- Create storage bucket for package images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('package-images', 'package-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for package images (drop existing ones first)
DROP POLICY IF EXISTS "Anyone can view package images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload package images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update package images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete package images" ON storage.objects;

CREATE POLICY "Anyone can view package images" ON storage.objects
  FOR SELECT USING (bucket_id = 'package-images');

CREATE POLICY "Authenticated users can upload package images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'package-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update package images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'package-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete package images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'package-images' 
    AND auth.role() = 'authenticated'
  );
