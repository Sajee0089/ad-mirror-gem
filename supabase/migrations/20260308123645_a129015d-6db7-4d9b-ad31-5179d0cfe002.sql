
-- Add views and favorites columns to ads table
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS favorite_count integer NOT NULL DEFAULT 0;

-- Create ad_views table to track unique views
CREATE TABLE public.ad_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  viewer_ip text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create ad_favorites table
CREATE TABLE public.ad_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ad_id, user_id)
);

-- Enable RLS
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_favorites ENABLE ROW LEVEL SECURITY;

-- ad_views: anyone can insert (track views), admins can read
CREATE POLICY "Anyone can insert views" ON public.ad_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read views" ON public.ad_views FOR SELECT TO anon, authenticated USING (true);

-- ad_favorites: authenticated users can manage their own
CREATE POLICY "Users can add favorites" ON public.ad_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.ad_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read favorites" ON public.ad_favorites FOR SELECT TO anon, authenticated USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(_ad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.ads SET view_count = view_count + 1 WHERE id = _ad_id;
END;
$$;

-- Function to update favorite count
CREATE OR REPLACE FUNCTION public.update_favorite_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ads SET favorite_count = favorite_count + 1 WHERE id = NEW.ad_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ads SET favorite_count = favorite_count - 1 WHERE id = OLD.ad_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_favorite_change
AFTER INSERT OR DELETE ON public.ad_favorites
FOR EACH ROW EXECUTE FUNCTION public.update_favorite_count();

-- Add contact_phone to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS contact_phone text;
