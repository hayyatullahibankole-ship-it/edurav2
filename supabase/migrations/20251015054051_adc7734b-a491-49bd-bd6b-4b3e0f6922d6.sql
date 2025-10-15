-- Create enum for course categories
DO $$ BEGIN
  CREATE TYPE public.course_category AS ENUM ('science', 'art', 'management');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add column to challenges for course categorization
ALTER TABLE public.challenges
ADD COLUMN IF NOT EXISTS course_category public.course_category NOT NULL DEFAULT 'science';

-- Optional: comment for clarity
COMMENT ON COLUMN public.challenges.course_category IS 'High-level course grouping for Challenge Arena: science, art, management';