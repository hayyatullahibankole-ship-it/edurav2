-- Replace find_incomplete_questions with subject-aware version
CREATE OR REPLACE FUNCTION public.find_incomplete_questions(target_subject text DEFAULT NULL)
RETURNS TABLE(id uuid, reason text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH base AS (
    SELECT 
      q.id,
      q.question_text,
      q.options,
      q.correct_answer,
      q.explanation
    FROM public.questions q
    LEFT JOIN public.subjects s ON s.id = q.subject_id
    WHERE q.is_active = true
      AND (target_subject IS NULL OR s.name = target_subject)
  )
  SELECT id, reason FROM (
    -- Very short or blank text
    SELECT id, 'text_too_short'::text AS reason FROM base 
    WHERE question_text IS NULL OR length(trim(question_text)) < 15
    UNION ALL
    -- Missing correct answer
    SELECT id, 'missing_correct_answer' FROM base 
    WHERE correct_answer IS NULL
    UNION ALL
    -- Too few options (supports array or object)
    SELECT id, 'too_few_options' FROM base 
    WHERE (
      options IS NULL OR (
        (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) < 2) OR
        (jsonb_typeof(options) = 'object' AND jsonb_array_length(jsonb_strip_nulls(options)) < 2)
      )
    )
    UNION ALL
    -- Incomplete sentence endings that suggest the question was cut off
    SELECT id, 'incomplete_sentence' FROM base 
    WHERE question_text ~ '(should be|is:|are:)\s*$'
       OR question_text ~ '(towards is|following is)\s*$'
       OR question_text ~ '(means of|on \?)\s*$'
    UNION ALL
    -- Obvious LaTeX leftovers
    SELECT id, 'latex_leftovers' FROM base
    WHERE question_text ~ '\\(mathbf|text|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|pi|Delta|Omega|leq|geq|neq|sum|int)'
       OR explanation ~ '\\(mathbf|text|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|pi|Delta|Omega|leq|geq|neq|sum|int)'
  ) t;
$$;