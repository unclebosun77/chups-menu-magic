
DROP POLICY IF EXISTS "Users can view their own orders by email" ON public.orders;

CREATE POLICY "Users can view their own orders by email"
ON public.orders
FOR SELECT
TO public
USING (customer_email = (auth.jwt() ->> 'email'));
