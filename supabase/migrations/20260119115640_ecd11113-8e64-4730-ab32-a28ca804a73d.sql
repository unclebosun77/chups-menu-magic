-- Add user_id to orders table for authenticated users
ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create saved_restaurants table for favorites
CREATE TABLE public.saved_restaurants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- Enable RLS on saved_restaurants
ALTER TABLE public.saved_restaurants ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_restaurants
CREATE POLICY "Users can view their own saved restaurants"
ON public.saved_restaurants
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save restaurants"
ON public.saved_restaurants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave restaurants"
ON public.saved_restaurants
FOR DELETE
USING (auth.uid() = user_id);

-- Add RLS policy for users to view their own orders (by user_id OR email)
CREATE POLICY "Users can view their own orders by user_id"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders by email"
ON public.orders
FOR SELECT
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);