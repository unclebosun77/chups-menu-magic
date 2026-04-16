
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "upload_restaurant_gallery" ON storage.objects;
DROP POLICY IF EXISTS "public_read_gallery" ON storage.objects;

CREATE POLICY "gallery_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant-gallery');
CREATE POLICY "gallery_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'restaurant-gallery');
CREATE POLICY "gallery_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'restaurant-gallery');
CREATE POLICY "gallery_select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'restaurant-gallery');
