-- Ensure unique constraint on user_id for ON CONFLICT to work
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rewards_accounts_user_id_key'
  ) THEN
    ALTER TABLE public.rewards_accounts ADD CONSTRAINT rewards_accounts_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.award_order_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  earned_points INTEGER;
  current_lifetime INTEGER;
  new_tier TEXT;
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' AND NEW.user_id IS NOT NULL THEN
    earned_points := FLOOR(CAST(NEW.total AS NUMERIC) * 10);
    IF earned_points <= 0 THEN RETURN NEW; END IF;

    INSERT INTO public.rewards_accounts (user_id, points_balance, lifetime_points, tier)
    VALUES (NEW.user_id, earned_points, earned_points, 'bronze')
    ON CONFLICT (user_id) DO UPDATE
      SET points_balance = rewards_accounts.points_balance + earned_points,
          lifetime_points = rewards_accounts.lifetime_points + earned_points,
          updated_at = now();

    SELECT lifetime_points INTO current_lifetime
    FROM public.rewards_accounts WHERE user_id = NEW.user_id;

    new_tier := CASE
      WHEN current_lifetime >= 5000 THEN 'platinum'
      WHEN current_lifetime >= 2000 THEN 'gold'
      WHEN current_lifetime >= 500 THEN 'silver'
      ELSE 'bronze'
    END;

    UPDATE public.rewards_accounts SET tier = new_tier WHERE user_id = NEW.user_id;

    INSERT INTO public.rewards_transactions (user_id, points, transaction_type, description, reference_id, reference_type)
    VALUES (NEW.user_id, earned_points, 'earned', 'Order completed', NEW.id, 'order');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_order_points ON public.orders;

CREATE TRIGGER trigger_award_order_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_order_points();