-- Add attempt_id column to mock_results used by submit_mock_exam and triggers
ALTER TABLE public.mock_results
  ADD COLUMN IF NOT EXISTS attempt_id UUID REFERENCES public.attempts(id);

-- Add index for faster lookups by attempt_id
CREATE INDEX IF NOT EXISTS idx_mock_results_attempt_id ON public.mock_results(attempt_id);