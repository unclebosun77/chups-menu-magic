
-- 1. Fix gift_cards: remove the wide-open SELECT policy, keep purchaser-scoped one
DROP POLICY IF EXISTS "Users can view gift cards by code" ON public.gift_cards;

-- 2. Fix rewards_accounts: remove client-side UPDATE (only triggers should mutate)
DROP POLICY IF EXISTS "Users can update their own rewards account" ON public.rewards_accounts;
-- Also remove client-side INSERT (the award_order_points trigger handles creation)
DROP POLICY IF EXISTS "Users can insert their own rewards account" ON public.rewards_accounts;

-- 3. Fix handle_new_user to always default to 'customer', ignore client metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Always assign 'customer' role; restaurant role granted via admin workflow
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer'::app_role);
  
  RETURN NEW;
END;
$$;

-- 4. Fix generate_gift_card_code search_path
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 16));
    SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE gift_cards.code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$;

-- 5. Fix award_order_points search_path (already has SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.award_order_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _points INTEGER;
  _restaurant_name TEXT;
  _new_lifetime INTEGER;
  _new_tier TEXT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.user_id IS NOT NULL THEN
    _points := floor(NEW.total * 10);
    SELECT name INTO _restaurant_name FROM public.restaurants WHERE id = NEW.restaurant_id;
    
    INSERT INTO public.rewards_accounts (user_id, points_balance, lifetime_points, tier)
    VALUES (NEW.user_id, _points, _points, 'bronze')
    ON CONFLICT (user_id) DO UPDATE SET
      points_balance = rewards_accounts.points_balance + _points,
      lifetime_points = rewards_accounts.lifetime_points + _points,
      updated_at = now();
    
    SELECT lifetime_points INTO _new_lifetime FROM public.rewards_accounts WHERE user_id = NEW.user_id;
    
    _new_tier := CASE
      WHEN _new_lifetime >= 5000 THEN 'platinum'
      WHEN _new_lifetime >= 2000 THEN 'gold'
      WHEN _new_lifetime >= 500 THEN 'silver'
      ELSE 'bronze'
    END;
    
    UPDATE public.rewards_accounts SET tier = _new_tier WHERE user_id = NEW.user_id;
    
    INSERT INTO public.rewards_transactions (user_id, points, transaction_type, description, reference_id, reference_type)
    VALUES (NEW.user_id, _points, 'earned', 'Order at ' || COALESCE(_restaurant_name, 'Restaurant'), NEW.id, 'order');
  END IF;
  RETURN NEW;
END;
$$;
