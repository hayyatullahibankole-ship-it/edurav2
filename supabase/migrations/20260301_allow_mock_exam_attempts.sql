-- Allow mock exams to create attempts without user authentication
-- Mock exams will have NULL user_id and be tracked by registration_number in proctoring_data

-- Add RLS policy for unauthenticated mock exam attempt creation
CREATE POLICY "Mock exams can be submitted unauthenticated"
  ON public.attempts FOR INSERT
  WITH CHECK (
    user_id IS NULL AND 
    (proctoring_data->>'is_mock')::boolean = true
  );

-- Add index for mock exam lookups (where user_id is null)
CREATE INDEX IF NOT EXISTS idx_attempts_mock_registration 
ON public.attempts USING GIN (proctoring_data) 
WHERE user_id IS NULL;
