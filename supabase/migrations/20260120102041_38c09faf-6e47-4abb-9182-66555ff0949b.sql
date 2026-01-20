-- Add status column to restaurants table for Draft/Live states
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Add gallery_images column to store image URLs as JSON array
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb;

-- Add tags column for dining vibes and occasions
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can view restaurant images (public bucket)
CREATE POLICY "Restaurant images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Storage policy: Restaurant owners can upload images
CREATE POLICY "Restaurant owners can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Restaurant owners can delete their images
CREATE POLICY "Restaurant owners can delete their images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);