DROP TRIGGER IF EXISTS set_blog_slug ON public.blog_posts;
CREATE TRIGGER set_blog_slug
BEFORE INSERT ON public.blog_posts
FOR EACH ROW
WHEN (NEW.slug IS NULL OR NEW.slug = '')
EXECUTE FUNCTION public.generate_blog_slug();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_ad_slug ON public.ads;
CREATE TRIGGER set_ad_slug
BEFORE INSERT ON public.ads
FOR EACH ROW
WHEN (NEW.slug IS NULL OR NEW.slug = '')
EXECUTE FUNCTION public.generate_ad_slug();