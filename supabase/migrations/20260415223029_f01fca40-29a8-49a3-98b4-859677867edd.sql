
-- Add cover_image_url to restaurants
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Storage policies for restaurant-gallery bucket
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'restaurant-gallery');

CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'restaurant-gallery');

CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'restaurant-gallery');

CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'restaurant-gallery');
