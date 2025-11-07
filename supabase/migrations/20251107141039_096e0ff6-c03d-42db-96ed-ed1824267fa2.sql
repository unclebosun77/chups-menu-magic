-- Enable Realtime for activity-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catering_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rewards_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_cards;