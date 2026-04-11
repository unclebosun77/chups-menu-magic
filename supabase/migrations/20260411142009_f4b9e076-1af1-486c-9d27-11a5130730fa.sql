INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('restaurant-logos', 'restaurant-logos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('restaurant-gallery', 'restaurant-gallery', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "upload_restaurant_logos" ON storage.objects;
DROP POLICY IF EXISTS "upload_restaurant_gallery" ON storage.objects;
DROP POLICY IF EXISTS "upload_menu_images" ON storage.objects;
DROP POLICY IF EXISTS "update_own_uploads" ON storage.objects;
DROP POLICY IF EXISTS "public_read_logos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_gallery" ON storage.objects;
DROP POLICY IF EXISTS "public_read_menu" ON storage.objects;

CREATE POLICY "upload_restaurant_logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant-logos');
CREATE POLICY "upload_restaurant_gallery" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant-gallery');
CREATE POLICY "upload_menu_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu-images');
CREATE POLICY "update_own_uploads" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "public_read_logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'restaurant-logos');
CREATE POLICY "public_read_gallery" ON storage.objects FOR SELECT TO public USING (bucket_id = 'restaurant-gallery');
CREATE POLICY "public_read_menu" ON storage.objects FOR SELECT TO public USING (bucket_id = 'menu-images');