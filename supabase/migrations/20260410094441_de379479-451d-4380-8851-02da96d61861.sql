-- Add vibes column
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS vibes text[] DEFAULT '{}';

-- Seed vibes for demo restaurants
UPDATE public.restaurants SET vibes = ARRAY['lively', 'group-dining', 'casual', 'trendy'] WHERE name = 'Yakoyo';
UPDATE public.restaurants SET vibes = ARRAY['romantic', 'upscale', 'date-night', 'cosy'] WHERE name = 'Cosby';
UPDATE public.restaurants SET vibes = ARRAY['chilled', 'casual', 'cosy', 'quiet'] WHERE name = 'The Prox';