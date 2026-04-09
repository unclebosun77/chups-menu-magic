
-- Function to award points when order is completed
CREATE OR REPLACE FUNCTION public.award_order_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _points INTEGER;
  _restaurant_name TEXT;
  _new_lifetime INTEGER;
  _new_tier TEXT;
BEGIN
  -- Only fire when status changes to 'completed' and user_id is set
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.user_id IS NOT NULL THEN
    -- Calculate points: £1 = 10 points
    _points := floor(NEW.total * 10);
    
    -- Get restaurant name
    SELECT name INTO _restaurant_name FROM public.restaurants WHERE id = NEW.restaurant_id;
    
    -- Upsert rewards account
    INSERT INTO public.rewards_accounts (user_id, points_balance, lifetime_points, tier)
    VALUES (NEW.user_id, _points, _points, 'bronze')
    ON CONFLICT (user_id) DO UPDATE SET
      points_balance = rewards_accounts.points_balance + _points,
      lifetime_points = rewards_accounts.lifetime_points + _points,
      updated_at = now();
    
    -- Get updated lifetime points for tier calculation
    SELECT lifetime_points INTO _new_lifetime FROM public.rewards_accounts WHERE user_id = NEW.user_id;
    
    -- Calculate tier
    _new_tier := CASE
      WHEN _new_lifetime >= 5000 THEN 'platinum'
      WHEN _new_lifetime >= 2000 THEN 'gold'
      WHEN _new_lifetime >= 500 THEN 'silver'
      ELSE 'bronze'
    END;
    
    -- Update tier
    UPDATE public.rewards_accounts SET tier = _new_tier WHERE user_id = NEW.user_id;
    
    -- Insert transaction record
    INSERT INTO public.rewards_transactions (user_id, points, transaction_type, description, reference_id, reference_type)
    VALUES (NEW.user_id, _points, 'earned', 'Order at ' || COALESCE(_restaurant_name, 'Restaurant'), NEW.id, 'order');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add unique constraint on user_id for upsert if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rewards_accounts_user_id_key'
  ) THEN
    ALTER TABLE public.rewards_accounts ADD CONSTRAINT rewards_accounts_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_award_order_points ON public.orders;
CREATE TRIGGER trigger_award_order_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_order_points();
