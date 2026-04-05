
CREATE OR REPLACE FUNCTION public.increment_view_count_by(_ad_id uuid, _count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.ads SET view_count = view_count + _count WHERE id = _ad_id;
END;
$$;
