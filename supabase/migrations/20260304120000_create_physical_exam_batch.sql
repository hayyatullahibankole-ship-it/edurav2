-- Create dedicated batch for physical examinations
-- Physical exams scheduled for April 4-5, 2026

-- Insert a new batch specifically for physical exams if it doesn't exist
INSERT INTO public.mock_batches (title, exam_date, exam_venue, is_active)
VALUES (
  'Physical Exam Batch',
  '2026-04-04T09:00:00+00:00'::TIMESTAMP WITH TIME ZONE,
  NULL,
  true
)
ON CONFLICT DO NOTHING;

-- Update all existing physical registrations to be assigned to the physical exam batch
-- First, get the batch ID for the physical exam batch
UPDATE public.mock_registrations
SET batch_id = (
  SELECT id FROM public.mock_batches
  WHERE title = 'Physical Exam Batch'
  LIMIT 1
)
WHERE mode = 'physical';

-- Log the operation (note: update count will be available in migration logs)
