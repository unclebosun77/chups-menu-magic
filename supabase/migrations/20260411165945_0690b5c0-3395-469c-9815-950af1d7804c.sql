
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  -- Safely read role from signup metadata; only allow known values
  IF NEW.raw_user_meta_data ->> 'role' = 'restaurant' THEN
    _role := 'restaurant'::app_role;
  ELSE
    _role := 'customer'::app_role;
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  RETURN NEW;
END;
$$;
