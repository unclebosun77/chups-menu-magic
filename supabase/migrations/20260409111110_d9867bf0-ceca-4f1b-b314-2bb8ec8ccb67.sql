
-- Create restaurant-gallery bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-gallery', 'restaurant-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Create restaurant-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-logos', 'restaurant-logos', true)
ON CONFLICT (id) DO NOTHING;

-- restaurant-gallery: public read
CREATE POLICY "Gallery images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-gallery');

-- restaurant-gallery: authenticated upload (user folder)
CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- restaurant-gallery: authenticated update
CREATE POLICY "Users can update their gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'restaurant-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- restaurant-gallery: authenticated delete
CREATE POLICY "Users can delete their gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'restaurant-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

-- restaurant-logos: public read
CREATE POLICY "Logo images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-logos');

-- restaurant-logos: authenticated upload
CREATE POLICY "Users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- restaurant-logos: authenticated update
CREATE POLICY "Users can update their logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'restaurant-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- restaurant-logos: authenticated delete
CREATE POLICY "Users can delete their logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'restaurant-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Also add missing policies for existing menu-images bucket
CREATE POLICY "Users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images' AND auth.uid()::text = (storage.foldername(name))[1]);
