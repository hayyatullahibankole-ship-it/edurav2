-- Add media_urls column to study_lessons table for storing images and videos
ALTER TABLE public.study_lessons 
ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.study_lessons.media_urls IS 'Array of media objects with url, type (image/video), and caption';