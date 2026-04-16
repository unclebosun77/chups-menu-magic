
DROP POLICY IF EXISTS "Restaurant owners can update their orders" ON public.orders;
DROP POLICY IF EXISTS "Restaurant owners can update order status" ON public.orders;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurant orders" ON public.orders;
DROP POLICY IF EXISTS "owners_update_order_status" ON public.orders;
DROP POLICY IF EXISTS "authenticated_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "users_read_own_orders" ON public.orders;
DROP POLICY IF EXISTS "owners_read_restaurant_orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Restaurant owners can read their orders" ON public.orders;
DROP POLICY IF EXISTS "Restaurant owners can read their restaurant orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders by email" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders by user_id" ON public.orders;

CREATE POLICY "orders_insert_authenticated"
ON public.orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "orders_insert_anon"
ON public.orders FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "orders_select_own"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "orders_select_restaurant"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE public.restaurants.id = public.orders.restaurant_id
    AND public.restaurants.user_id = auth.uid()
  )
);

CREATE POLICY "orders_update_restaurant"
ON public.orders FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE public.restaurants.id = public.orders.restaurant_id
    AND public.restaurants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE public.restaurants.id = public.orders.restaurant_id
    AND public.restaurants.user_id = auth.uid()
  )
);
