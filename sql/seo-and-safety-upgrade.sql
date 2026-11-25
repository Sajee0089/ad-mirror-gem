-- Additive SQL upgrade for Ads SL (SEO, performance indexes, safety reporting, ad renewal).
-- Safe to run on your external Supabase project at any time; the app works even before running this.

-- 1. Performance & SEO indexes on public.ads
CREATE INDEX IF NOT EXISTS idx_ads_status_created_at
  ON public.ads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ads_category_location_status_created_at
  ON public.ads (category, location, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ads_slug_unique
  ON public.ads (slug)
  WHERE slug IS NOT NULL;

-- 2. Optional additive columns on public.ads for thumbnails and duplicate review flagging
ALTER TABLE public.ads
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS duplicate_flagged BOOLEAN NOT NULL DEFAULT false;

-- 3. Ad reports table for user moderation & safety
CREATE TABLE IF NOT EXISTS public.ad_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  reporter_user_id UUID,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_reports_status_created_at
  ON public.ad_reports (status, created_at DESC);

GRANT INSERT ON public.ad_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.ad_reports TO authenticated;
GRANT ALL ON public.ad_reports TO service_role;

ALTER TABLE public.ad_reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_reports' AND policyname = 'Anyone can submit ad reports'
  ) THEN
    CREATE POLICY "Anyone can submit ad reports"
      ON public.ad_reports
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (length(trim(reason)) >= 3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ad_reports' AND policyname = 'Admins can manage ad reports'
  ) THEN
    CREATE POLICY "Admins can manage ad reports"
      ON public.ad_reports
      FOR ALL
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'::public.app_role))
      WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;

-- 4. Renew ad RPC: lets the ad owner bump updated_at once every 24 hours on approved ads
CREATE OR REPLACE FUNCTION public.renew_ad(_ad_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ad RECORD;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT id, user_id, status, updated_at
    INTO v_ad
    FROM public.ads
   WHERE id = _ad_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ad not found';
  END IF;

  IF v_ad.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to renew this ad';
  END IF;

  IF v_ad.status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved ads can be renewed';
  END IF;

  IF v_ad.updated_at > (v_now - INTERVAL '24 hours') THEN
    RAISE EXCEPTION 'You can renew an ad once every 24 hours';
  END IF;

  UPDATE public.ads
     SET updated_at = v_now,
         approved_at = v_now
   WHERE id = _ad_id;

  RETURN v_now;
END;
$$;

GRANT EXECUTE ON FUNCTION public.renew_ad(UUID) TO authenticated;
