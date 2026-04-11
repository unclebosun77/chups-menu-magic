
-- Allow restaurant owners to read bookings for their restaurant
CREATE POLICY "Restaurant owners can read their bookings"
ON bookings FOR SELECT TO authenticated
USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));

-- Allow restaurant owners to update booking status
CREATE POLICY "Restaurant owners can update booking status"
ON bookings FOR UPDATE TO authenticated
USING (restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid()));
