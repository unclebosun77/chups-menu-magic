
-- Drop existing order policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can read their restaurant orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update their restaurant orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders by email" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders by user_id" ON orders;

-- Orders: authenticated users can insert
CREATE POLICY "Users can insert orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Orders: anonymous/guest users can insert (QR table ordering)
CREATE POLICY "Anyone can insert orders"
ON orders FOR INSERT
TO anon
WITH CHECK (true);

-- Orders: users can read their own
CREATE POLICY "Users can read own orders"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Orders: restaurant owners can read all orders for their restaurant
CREATE POLICY "Restaurant owners can read their orders"
ON orders FOR SELECT
TO authenticated
USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Orders: restaurant owners can update order status
CREATE POLICY "Restaurant owners can update order status"
ON orders FOR UPDATE
TO authenticated
USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Menu items: drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Restaurant owners can manage their menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;

-- Menu items: restaurant owners full management
CREATE POLICY "Restaurant owners can manage their menu items"
ON menu_items FOR ALL
TO authenticated
USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()))
WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Menu items: anonymous users can read available items
CREATE POLICY "Anyone can read available menu items"
ON menu_items FOR SELECT
TO anon
USING (available = true);

-- Menu items: authenticated users can read all items
CREATE POLICY "Authenticated users can read menu items"
ON menu_items FOR SELECT
TO authenticated
USING (true);
