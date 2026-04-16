
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS price_range text DEFAULT NULL;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS website text DEFAULT NULL;
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS mood text[] DEFAULT '{}'::text[];
