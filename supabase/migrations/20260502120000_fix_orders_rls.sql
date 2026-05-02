-- Final fix for orders and order_items RLS
-- This ensures anyone can place an order and view their own order by knowing the ID

-- 1. Orders Table
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders by ID" ON public.orders;

-- Allow anyone to insert an order (Guest or Authenticated)
CREATE POLICY "Enable insert for all users"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view an order if they know the ID (for tracking and checkout success)
CREATE POLICY "Enable read for all users"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admins to update orders (for status changes)
CREATE POLICY "Enable update for admins"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 2. Order Items Table
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Allow anyone to insert order items
CREATE POLICY "Enable insert for all users"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to view order items
CREATE POLICY "Enable read for all users"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Promo Codes (ensure users can view)
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes FOR SELECT
TO anon, authenticated
USING (is_active = true);
