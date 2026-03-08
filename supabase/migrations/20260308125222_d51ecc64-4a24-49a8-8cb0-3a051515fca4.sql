
CREATE TABLE public.email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON public.email_subscriptions
  FOR SELECT USING (true);
