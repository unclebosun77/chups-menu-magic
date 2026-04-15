
-- Drop conflicting existing policies on orders
DROP POLICY IF EXISTS "Users can insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can read their orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update order status" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can read their restaurant orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurant orders" ON orders;

-- Allow authenticated users to place orders
CREATE POLICY "authenticated_insert_orders"
ON orders FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow anonymous users to place orders (QR scan without login)
CREATE POLICY "anon_insert_orders"
ON orders FOR INSERT TO anon
WITH CHECK (true);

-- Allow users to read their own orders
CREATE POLICY "users_read_own_orders"
ON orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Allow restaurant owners to read ALL orders for their restaurant
CREATE POLICY "owners_read_restaurant_orders"
ON orders FOR SELECT TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE user_id = auth.uid()
  )
);

-- Allow restaurant owners to UPDATE order status
CREATE POLICY "owners_update_order_status"
ON orders FOR UPDATE TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE user_id = auth.uid()
  )
);

-- Fix menu_items so everyone can read them
DROP POLICY IF EXISTS "Anyone can read available menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated users can read menu items" ON menu_items;

CREATE POLICY "public_read_menu_items" ON menu_items FOR SELECT TO public USING (true);

-- Drop and recreate owners manage policy to avoid conflict
DROP POLICY IF EXISTS "Restaurant owners can manage their menu items" ON menu_items;

CREATE POLICY "owners_manage_menu_items" ON menu_items FOR ALL TO authenticated
USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()))
WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
