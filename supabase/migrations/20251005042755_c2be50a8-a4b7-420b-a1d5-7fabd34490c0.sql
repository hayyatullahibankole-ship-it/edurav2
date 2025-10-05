-- Create RPC to get random questions per subject securely
CREATE OR REPLACE FUNCTION public.get_random_questions_for_subjects(
  subject_ids uuid[],
  per_subject_count integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  question_text text,
  type question_type,
  options jsonb,
  difficulty_level integer,
  media_urls jsonb,
  points numeric,
  time_limit_seconds integer,
  subject_id uuid,
  tags jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH s AS (
    SELECT unnest(subject_ids) AS sid
  )
  SELECT q.id, q.question_text, q.type, q.options, q.difficulty_level,
         q.media_urls, q.points, q.time_limit_seconds, q.subject_id, q.tags
  FROM s
  JOIN LATERAL (
    SELECT q.*
    FROM public.questions q
    WHERE q.subject_id = s.sid AND q.is_active = true
    ORDER BY random()
    LIMIT per_subject_count
  ) q ON TRUE;
END;
$$;

-- Create RPC to get random questions based on an exam's blueprint (exam_subjects)
CREATE OR REPLACE FUNCTION public.get_random_questions_for_exam(
  target_exam_id uuid
)
RETURNS TABLE(
  id uuid,
  question_text text,
  type question_type,
  options jsonb,
  difficulty_level integer,
  media_urls jsonb,
  points numeric,
  time_limit_seconds integer,
  subject_id uuid,
  tags jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question_text, q.type, q.options, q.difficulty_level,
         q.media_urls, q.points, q.time_limit_seconds, q.subject_id, q.tags
  FROM public.exam_subjects es
  JOIN LATERAL (
    SELECT q.*
    FROM public.questions q
    WHERE q.subject_id = es.subject_id AND q.is_active = true
    ORDER BY random()
    LIMIT COALESCE(es.question_count, 0)
  ) q ON TRUE
  WHERE es.exam_id = target_exam_id;
END;
$$;

-- Create secure RPC for answer review: returns question + correct answer index + user's stored answer
CREATE OR REPLACE FUNCTION public.get_review_questions_for_attempt(
  attempt_uuid uuid
)
RETURNS TABLE(
  id uuid,
  question_text text,
  options jsonb,
  correct_answer_index integer,
  explanation text,
  subject_id uuid,
  subject_name text,
  user_answer_index integer,
  is_correct boolean,
  time_spent_seconds integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_owns_attempt boolean;
  is_admin_user boolean;
  attempt_status attempt_status;
BEGIN
  -- Check ownership or admin and ensure attempt is submitted
  SELECT EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid AND u.auth_user_id = auth.uid()
  ) INTO user_owns_attempt;

  SELECT is_admin(auth.uid()) INTO is_admin_user;
  SELECT status INTO attempt_status FROM public.attempts WHERE id = attempt_uuid;

  IF NOT (user_owns_attempt OR is_admin_user) THEN
    RAISE EXCEPTION 'Access denied to attempt data';
  END IF;

  IF attempt_status != 'SUBMITTED' THEN
    RAISE EXCEPTION 'Review is only available for submitted attempts';
  END IF;

  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.options,
    -- Normalize correct answer to 0-based integer index
    CASE
      WHEN jsonb_typeof(q.correct_answer) = 'number' THEN (q.correct_answer::text)::integer
      WHEN q.correct_answer::text ~ '^"[A-D]"$' THEN ascii(upper(trim(both '"' from q.correct_answer::text))) - 65
      WHEN q.correct_answer::text ~ '^"[0-3]"$' THEN (trim(both '"' from q.correct_answer::text))::integer
      ELSE 0
    END AS correct_answer_index,
    COALESCE(q.explanation, '') AS explanation,
    q.subject_id,
    COALESCE(s.name, 'Unknown') AS subject_name,
    -- User answer normalized to integer if present
    CASE 
      WHEN aa.answer IS NULL THEN NULL
      WHEN jsonb_typeof(aa.answer) = 'number' THEN (aa.answer::text)::integer
      ELSE NULL
    END AS user_answer_index,
    COALESCE(aa.is_correct, false) AS is_correct,
    COALESCE(aa.time_spent_seconds, 0) AS time_spent_seconds
  FROM public.attempt_answers aa
  JOIN public.questions q ON q.id = aa.question_id
  LEFT JOIN public.subjects s ON s.id = q.subject_id
  WHERE aa.attempt_id = attempt_uuid;
END;
$$;