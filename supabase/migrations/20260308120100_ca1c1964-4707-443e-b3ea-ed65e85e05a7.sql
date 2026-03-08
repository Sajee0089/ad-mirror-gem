-- 1. Enforce daily ad limit at database level
CREATE OR REPLACE FUNCTION public.enforce_daily_ad_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT public.count_user_ads_today(NEW.user_id)) >= 5 THEN
    RAISE EXCEPTION 'Daily ad limit reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER check_daily_ad_limit
  BEFORE INSERT ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.enforce_daily_ad_limit();

-- 2. Fix storage upload path restriction
DROP POLICY IF EXISTS "Authenticated users can upload ad images" ON storage.objects;

CREATE POLICY "Users can upload only to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ad-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Secure RPC function to only allow querying own count
CREATE OR REPLACE FUNCTION public.count_user_ads_today(_user_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.ads
  WHERE user_id = _user_id
    AND user_id = auth.uid()
    AND created_at >= (now() AT TIME ZONE 'UTC')::date
$$;