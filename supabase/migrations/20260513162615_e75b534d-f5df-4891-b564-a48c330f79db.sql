ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_ads_scheduled ON public.ads (status, scheduled_at);