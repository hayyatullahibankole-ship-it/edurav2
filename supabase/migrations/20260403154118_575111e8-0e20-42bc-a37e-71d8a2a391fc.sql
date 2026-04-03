-- Disable the per-row syllabus coverage trigger that fires on every answer insert
-- This is the main cause of statement timeouts during submission under load
DROP TRIGGER IF EXISTS update_coverage_on_answer ON public.attempt_answers;

-- Add index for faster upsert conflict resolution on attempt_answers
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt_question 
  ON public.attempt_answers(attempt_id, question_id);

-- Add index for results lookup by attempt_id
CREATE INDEX IF NOT EXISTS idx_results_attempt_id 
  ON public.results(attempt_id);