
CREATE OR REPLACE FUNCTION public.increment_favorite_count_by(_ad_id uuid, _count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.ads SET favorite_count = favorite_count + _count WHERE id = _ad_id;
END;
$$;
