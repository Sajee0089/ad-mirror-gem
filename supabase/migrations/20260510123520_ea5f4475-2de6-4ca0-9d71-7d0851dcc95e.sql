UPDATE public.ads
SET view_count = 200 + floor(random() * 99500)::int
WHERE status = 'approved';