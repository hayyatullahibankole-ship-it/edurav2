-- Prevent students from reattempting school exams
-- This migration adds a unique constraint for school exams to ensure
-- each student can only attempt a school exam once

-- Create a partial unique index for school exams
-- This ensures (user_id, exam_id) uniqueness only for school exams
CREATE UNIQUE INDEX idx_unique_school_exam_attempt 
ON public.attempts(user_id, exam_id) 
WHERE exam_id IN (SELECT id FROM public.exams WHERE school_id IS NOT NULL);

-- Add comment to document the index
COMMENT ON INDEX idx_unique_school_exam_attempt 
IS 'Ensures each student can only attempt a school exam once. Does not apply to other exam types.';

