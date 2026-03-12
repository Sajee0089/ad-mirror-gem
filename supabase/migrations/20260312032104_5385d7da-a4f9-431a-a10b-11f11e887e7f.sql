
-- Add slug column to ads table
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS ads_slug_unique ON public.ads(slug) WHERE slug IS NOT NULL;

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_ad_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(regexp_replace(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- If empty, use 'ad'
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'ad';
  END IF;
  
  -- Append short unique suffix
  final_slug := base_slug || '-' || substr(NEW.id::text, 1, 8);
  
  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_ad_slug ON public.ads;
CREATE TRIGGER trigger_generate_ad_slug
  BEFORE INSERT ON public.ads
  FOR EACH ROW
  WHEN (NEW.slug IS NULL)
  EXECUTE FUNCTION public.generate_ad_slug();

-- Generate slugs for existing ads that don't have one
UPDATE public.ads 
SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;
