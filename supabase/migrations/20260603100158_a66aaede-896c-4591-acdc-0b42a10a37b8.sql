DROP POLICY IF EXISTS "owners_manage_restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners can delete their restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners can insert their restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurant" ON public.restaurants;
CREATE POLICY "owners_manage_restaurants" ON public.restaurants
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "users_manage_own_profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);