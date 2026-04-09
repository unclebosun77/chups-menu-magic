ALTER TABLE public.restaurants
ADD COLUMN crowd_level text,
ADD COLUMN crowd_updated_at timestamp with time zone;