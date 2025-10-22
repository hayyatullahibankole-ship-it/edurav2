-- Ensure trigger function is updated (idempotent)
CREATE OR REPLACE FUNCTION public.update_syllabus_coverage_after_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
  v_topic_name TEXT;
BEGIN
  SELECT a.user_id INTO v_user_id FROM public.attempts a WHERE a.id = NEW.attempt_id;
  SELECT q.subject_id, COALESCE(q.tags->0->>'topic', 'General') INTO v_subject_id, v_topic_name FROM public.questions q WHERE q.id = NEW.question_id;

  INSERT INTO public.syllabus_coverage (
    user_id, subject_id, topic_name, total_questions, attempted_questions, correct_questions, last_practiced_at
  ) VALUES (
    v_user_id, v_subject_id, v_topic_name, 1, 1, CASE WHEN COALESCE(NEW.is_correct, false) THEN 1 ELSE 0 END, NOW()
  )
  ON CONFLICT (user_id, subject_id, topic_name)
  DO UPDATE SET
    attempted_questions = public.syllabus_coverage.attempted_questions + 1,
    correct_questions   = public.syllabus_coverage.correct_questions + CASE WHEN COALESCE(NEW.is_correct, false) THEN 1 ELSE 0 END,
    total_questions     = GREATEST(COALESCE(public.syllabus_coverage.total_questions, 0), COALESCE(public.syllabus_coverage.attempted_questions, 0) + 1),
    last_practiced_at   = NOW(),
    updated_at          = NOW();

  RETURN NEW;
END;
$$;

-- Recreate generated columns safely with IF EXISTS/ADD
ALTER TABLE public.syllabus_coverage DROP COLUMN IF EXISTS coverage_percentage;
ALTER TABLE public.syllabus_coverage DROP COLUMN IF EXISTS mastery_percentage;

ALTER TABLE public.syllabus_coverage
ADD COLUMN coverage_percentage numeric(6,2) GENERATED ALWAYS AS (
  LEAST(
    100::numeric,
    CASE WHEN COALESCE(total_questions,0) > 0 THEN ROUND((COALESCE(attempted_questions,0)::numeric / NULLIF(total_questions,0)::numeric) * 100, 2) ELSE 0 END
  )
) STORED;

ALTER TABLE public.syllabus_coverage
ADD COLUMN mastery_percentage numeric(6,2) GENERATED ALWAYS AS (
  LEAST(
    100::numeric,
    CASE WHEN COALESCE(attempted_questions,0) > 0 THEN ROUND((COALESCE(correct_questions,0)::numeric / COALESCE(attempted_questions,0)::numeric) * 100, 2) ELSE 0 END
  )
) STORED;

-- Backfill to sync totals and force recompute of generated values
UPDATE public.syllabus_coverage
SET total_questions = GREATEST(COALESCE(total_questions, 0), COALESCE(attempted_questions, 0)), updated_at = NOW();

UPDATE public.syllabus_coverage SET attempted_questions = attempted_questions;