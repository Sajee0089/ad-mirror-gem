
-- Ensure triggers exist for slug generation
CREATE OR REPLACE TRIGGER set_ad_slug
  BEFORE INSERT ON public.ads
  FOR EACH ROW
  WHEN (NEW.slug IS NULL)
  EXECUTE FUNCTION public.generate_ad_slug();

CREATE OR REPLACE TRIGGER set_blog_slug
  BEFORE INSERT ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_blog_slug();

-- Ensure updated_at trigger exists for blog_posts
CREATE OR REPLACE TRIGGER set_blog_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
