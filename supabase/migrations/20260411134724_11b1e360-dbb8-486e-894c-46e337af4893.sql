
-- Drop existing order policies that overlap
DROP POLICY IF EXISTS "Restaurant owners can view their orders" ON orders;
DROP POLICY IF EXISTS "Restaurant owners can update their orders" ON orders;

-- Recreate with authenticated role explicitly
CREATE POLICY "Restaurant owners can read their restaurant orders"
ON orders FOR SELECT
TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Restaurant owners can update their restaurant orders"
ON orders FOR UPDATE
TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants
    WHERE user_id = auth.uid()
  )
);

-- Drop existing menu_items owner policies
DROP POLICY IF EXISTS "Restaurant owners can view all their menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can update their menu items" ON menu_items;
DROP POLICY IF EXISTS "Restaurant owners can delete their menu items" ON menu_items;

-- Single ALL policy for restaurant owners
CREATE POLICY "Restaurant owners can manage their menu items"
ON menu_items FOR ALL
TO authenticated
USING (
  restaurant_id IN (
    SELECT id FROM restaurants
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants
    WHERE user_id = auth.uid()
  )
);
