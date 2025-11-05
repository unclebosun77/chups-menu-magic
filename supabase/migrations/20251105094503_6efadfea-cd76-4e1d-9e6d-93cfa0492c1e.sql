-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true);

-- Allow restaurant owners to upload images for their menu items
CREATE POLICY "Restaurant owners can upload menu images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'menu-images' AND
  auth.uid() IN (
    SELECT user_id FROM restaurants WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Allow restaurant owners to update their menu images
CREATE POLICY "Restaurant owners can update menu images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'menu-images' AND
  auth.uid() IN (
    SELECT user_id FROM restaurants WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Allow restaurant owners to delete their menu images
CREATE POLICY "Restaurant owners can delete menu images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'menu-images' AND
  auth.uid() IN (
    SELECT user_id FROM restaurants WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Allow anyone to view menu images
CREATE POLICY "Anyone can view menu images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'menu-images');