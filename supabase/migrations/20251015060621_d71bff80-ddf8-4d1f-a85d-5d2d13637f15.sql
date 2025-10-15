-- Add course_category to subjects table
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS course_category course_category DEFAULT 'science';

-- Update existing subjects to have proper course categories based on their names
-- You'll need to manually categorize subjects appropriately
-- This is just a starting point - admins can update these via the admin panel

UPDATE public.subjects
SET course_category = 'science'
WHERE LOWER(name) IN ('mathematics', 'physics', 'chemistry', 'biology', 'further mathematics', 'agricultural science');

UPDATE public.subjects  
SET course_category = 'art'
WHERE LOWER(name) IN ('literature', 'history', 'government', 'christian religious studies', 'islamic studies', 'geography', 'fine arts', 'music');

UPDATE public.subjects
SET course_category = 'management'
WHERE LOWER(name) IN ('economics', 'commerce', 'accounting', 'business studies', 'financial accounting');