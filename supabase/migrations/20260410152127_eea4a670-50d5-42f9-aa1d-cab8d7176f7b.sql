CREATE TABLE IF NOT EXISTS public.onboarding_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  draft jsonb NOT NULL DEFAULT '{}',
  current_step integer DEFAULT 1,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.onboarding_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own draft" ON public.onboarding_drafts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);