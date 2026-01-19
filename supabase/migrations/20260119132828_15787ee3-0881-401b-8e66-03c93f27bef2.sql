-- Allow restaurant owners to update order status
CREATE POLICY "Restaurant owners can update their orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = orders.restaurant_id 
    AND restaurants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants 
    WHERE restaurants.id = orders.restaurant_id 
    AND restaurants.user_id = auth.uid()
  )
);