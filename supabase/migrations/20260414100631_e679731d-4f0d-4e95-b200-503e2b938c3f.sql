
-- Clear all restaurant-related data in dependency order
DELETE FROM public.reviews;
DELETE FROM public.orders;
DELETE FROM public.bookings;
DELETE FROM public.saved_restaurants;
DELETE FROM public.menu_items;
DELETE FROM public.onboarding_drafts;
DELETE FROM public.restaurants;
