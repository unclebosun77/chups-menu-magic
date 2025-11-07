-- Create rewards_accounts table
CREATE TABLE public.rewards_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards_transactions table
CREATE TABLE public.rewards_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gift_cards table
CREATE TABLE public.gift_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  initial_amount NUMERIC NOT NULL,
  current_balance NUMERIC NOT NULL,
  purchaser_user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Create gift_card_transactions table
CREATE TABLE public.gift_card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID NOT NULL,
  user_id UUID,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rewards_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_card_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rewards_accounts
CREATE POLICY "Users can view their own rewards account"
ON public.rewards_accounts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards account"
ON public.rewards_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards account"
ON public.rewards_accounts
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for rewards_transactions
CREATE POLICY "Users can view their own rewards transactions"
ON public.rewards_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards transactions"
ON public.rewards_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for gift_cards
CREATE POLICY "Users can view gift cards they purchased"
ON public.gift_cards
FOR SELECT
USING (auth.uid() = purchaser_user_id);

CREATE POLICY "Users can insert gift cards"
ON public.gift_cards
FOR INSERT
WITH CHECK (auth.uid() = purchaser_user_id);

CREATE POLICY "Users can view gift cards by code"
ON public.gift_cards
FOR SELECT
USING (true);

-- RLS Policies for gift_card_transactions
CREATE POLICY "Users can view their gift card transactions"
ON public.gift_card_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert gift card transactions"
ON public.gift_card_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rewards_accounts_updated_at
BEFORE UPDATE ON public.rewards_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gift_cards_updated_at
BEFORE UPDATE ON public.gift_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique gift card code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 16-character alphanumeric code
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 16));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE gift_cards.code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$;