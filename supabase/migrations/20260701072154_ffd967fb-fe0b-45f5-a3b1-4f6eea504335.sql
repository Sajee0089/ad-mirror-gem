
DROP TRIGGER IF EXISTS ads_set_default_location ON public.ads;
CREATE TRIGGER ads_set_default_location BEFORE INSERT OR UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.set_default_location();

DROP TRIGGER IF EXISTS ads_set_slug ON public.ads;
CREATE TRIGGER ads_set_slug BEFORE INSERT OR UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.set_ad_slug();

DROP TRIGGER IF EXISTS ads_touch_updated_at ON public.ads;
CREATE TRIGGER ads_touch_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS blog_posts_touch_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_touch_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
