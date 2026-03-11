
DROP TRIGGER IF EXISTS check_daily_ad_limit ON public.ads;
DROP FUNCTION IF EXISTS public.enforce_daily_ad_limit();
DROP FUNCTION IF EXISTS public.count_user_ads_today(uuid);
