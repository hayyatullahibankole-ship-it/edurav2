-- Add question_selection_mode and questions_per_subject columns to exams table
-- These columns track whether questions are manually selected or auto-fetched from Edura

ALTER TABLE public.exams
ADD COLUMN IF NOT EXISTS question_selection_mode VARCHAR(50) DEFAULT 'custom';

ALTER TABLE public.exams
ADD COLUMN IF NOT EXISTS questions_per_subject INTEGER DEFAULT 10;

-- Add comments for documentation
COMMENT ON COLUMN public.exams.question_selection_mode IS 
  'Question selection method: "edura" = automatic from database, "custom" = manually selected';

COMMENT ON COLUMN public.exams.questions_per_subject IS 
  'Number of questions per subject for Edura mode exams';

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_exams_question_selection_mode 
ON public.exams(question_selection_mode);

CREATE INDEX IF NOT EXISTS idx_exams_questions_per_subject 
ON public.exams(questions_per_subject);
