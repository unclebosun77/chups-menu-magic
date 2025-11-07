-- Create catering_orders table
CREATE TABLE public.catering_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  event_location TEXT NOT NULL,
  event_type TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  menu_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.catering_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own catering orders"
ON public.catering_orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own catering orders"
ON public.catering_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catering orders"
ON public.catering_orders
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catering orders"
ON public.catering_orders
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_catering_orders_updated_at
BEFORE UPDATE ON public.catering_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();