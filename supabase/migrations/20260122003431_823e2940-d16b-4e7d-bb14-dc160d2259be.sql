-- Add new columns to reviews table for enhanced Reviews & Feedback feature
ALTER TABLE public.reviews
ADD COLUMN photos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN dish_tag text,
ADD COLUMN restaurant_response text,
ADD COLUMN restaurant_response_at timestamp with time zone;

-- Create index for faster restaurant-location queries
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON public.reviews(restaurant_id);

-- Add RLS policy for restaurant owners to respond to reviews
CREATE POLICY "Restaurant owners can update restaurant_response" 
ON public.reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = reviews.restaurant_id 
    AND restaurants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = reviews.restaurant_id 
    AND restaurants.user_id = auth.uid()
  )
);