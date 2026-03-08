
-- 1. Create blocked_users table
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blocked_by uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Unique constraint so a user can only be blocked once
ALTER TABLE public.blocked_users ADD CONSTRAINT blocked_users_user_id_unique UNIQUE (user_id);

-- RLS: Admins can manage blocked users
CREATE POLICY "Admins can view blocked users"
  ON public.blocked_users FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can block users"
  ON public.blocked_users FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can unblock users"
  ON public.blocked_users FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Admin can delete any ad
CREATE POLICY "Admins can delete any ad"
  ON public.ads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Admin can insert ads (for manual posting, bypassing user_id = auth.uid() check)
CREATE POLICY "Admins can insert any ad"
  ON public.ads FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Update SELECT policy to filter out blocked users' ads from public view
DROP POLICY IF EXISTS "Approved ads viewable by everyone" ON public.ads;

CREATE POLICY "Approved ads viewable by everyone"
  ON public.ads FOR SELECT
  USING (
    (status = 'approved' AND NOT EXISTS (SELECT 1 FROM public.blocked_users WHERE blocked_users.user_id = ads.user_id))
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
