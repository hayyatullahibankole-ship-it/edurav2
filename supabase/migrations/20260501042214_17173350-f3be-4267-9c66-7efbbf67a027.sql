-- Add Campus Hub fields to blog_posts table
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS school text,
  ADD COLUMN IF NOT EXISTS institution_type text,
  ADD COLUMN IF NOT EXISTS year integer;

-- Helpful indexes for filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_school ON public.blog_posts (school);
CREATE INDEX IF NOT EXISTS idx_blog_posts_institution_type ON public.blog_posts (institution_type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_year ON public.blog_posts (year);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts (category);

-- Backfill missing slugs from titles (lowercase, non-alphanumerics -> '-')
UPDATE public.blog_posts
SET slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) || '-' || substring(id::text, 1, 6)
WHERE (slug IS NULL OR slug = '') AND title IS NOT NULL;

-- Trigger to auto-generate a slug on insert/update if missing
CREATE OR REPLACE FUNCTION public.blog_posts_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := trim(both '-' from regexp_replace(lower(coalesce(NEW.title, 'post')), '[^a-z0-9]+', '-', 'g'))
                || '-' || substring(NEW.id::text, 1, 6);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_blog_posts_set_slug ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_set_slug
BEFORE INSERT OR UPDATE OF title, slug ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.blog_posts_set_slug();