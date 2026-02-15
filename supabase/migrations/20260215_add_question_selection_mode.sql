-- Add question_selection_mode column to exams table
-- This column tracks whether questions are manually selected or auto-fetched from Edura

ALTER TABLE public.exams
ADD COLUMN IF NOT EXISTS question_selection_mode VARCHAR(50) DEFAULT 'custom';

-- Add comment for documentation
COMMENT ON COLUMN public.exams.question_selection_mode IS 
  'Question selection method: "edura" = automatic from database, "custom" = manually selected';

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_exams_question_selection_mode 
ON public.exams(question_selection_mode);
