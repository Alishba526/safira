ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS utm_source TEXT DEFAULT 'direct';
CREATE INDEX IF NOT EXISTS idx_orders_utm_source ON public.orders(utm_source);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);