ALTER TABLE public.ads ADD COLUMN cashback boolean NOT NULL DEFAULT false;
ALTER TABLE public.ads ADD COLUMN approved_at timestamp with time zone DEFAULT NULL;