
-- Add status and rejection_reason to ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: admins can read all, users can read own
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to count user ads today
CREATE OR REPLACE FUNCTION public.count_user_ads_today(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.ads
  WHERE user_id = _user_id
  AND created_at >= (now() AT TIME ZONE 'UTC')::date
$$;

-- Update the SELECT policy on ads to show approved to everyone, own ads to owner
DROP POLICY IF EXISTS "Ads are viewable by everyone" ON public.ads;
CREATE POLICY "Approved ads viewable by everyone" ON public.ads
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ad-images bucket
CREATE POLICY "Authenticated users can upload ad images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ad-images');

CREATE POLICY "Anyone can view ad images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-images');

CREATE POLICY "Users can delete own ad images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ad-images' AND (storage.foldername(name))[1] = auth.uid()::text);
