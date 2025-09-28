-- Create fixer for LaTeX leftovers, scoped by subject name (optional)
CREATE OR REPLACE FUNCTION public.fix_latex_questions(target_subject text DEFAULT NULL)
RETURNS TABLE(updated_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  cnt integer := 0;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.questions q
  SET question_text = trim(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(q.question_text, '\\mathbf\{([^}]+)\}', '\1', 'g'),
              '\\text\{([^}]+)\}', '\1', 'g'
            ),
            '(\$\$?)', '', 'g'
          ),
          '\s{2,}', ' ', 'g'
        )
      ),
      explanation = CASE WHEN q.explanation IS NULL THEN NULL ELSE trim(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(q.explanation, '\\mathbf\{([^}]+)\}', '\1', 'g'),
              '\\text\{([^}]+)\}', '\1', 'g'
            ),
            '(\$\$?)', '', 'g'
          ),
          '\s{2,}', ' ', 'g'
        )
      ) END
  FROM public.subjects s
  WHERE s.id = q.subject_id
    AND (target_subject IS NULL OR s.name = target_subject)
    AND (
      q.question_text ~ '(\\\\mathbf|\\\\text|\$)'
      OR q.explanation ~ '(\\\\mathbf|\\\\text|\$)'
    );

  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN QUERY SELECT cnt;
END;
$$;

-- Bulk delete incomplete questions scoped by subject name (optional)
CREATE OR REPLACE FUNCTION public.delete_incomplete_questions(target_subject text DEFAULT NULL)
RETURNS TABLE(deleted integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  ids uuid[];
  del_count integer := 0;
  ans_count integer := 0;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT array_agg(id) INTO ids FROM public.find_incomplete_questions(target_subject);

  IF ids IS NULL OR array_length(ids,1) IS NULL THEN
    RETURN QUERY SELECT 0;
    RETURN;
  END IF;

  DELETE FROM public.attempt_answers WHERE question_id = ANY(ids);
  GET DIAGNOSTICS ans_count = ROW_COUNT;

  DELETE FROM public.questions WHERE id = ANY(ids);
  GET DIAGNOSTICS del_count = ROW_COUNT;

  RETURN QUERY SELECT del_count + ans_count;
END;
$$;