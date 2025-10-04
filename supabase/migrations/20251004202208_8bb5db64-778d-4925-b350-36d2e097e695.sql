-- ==========================================
-- CLEAN CBT MODULE: Standardize Answer Format
-- ==========================================

-- Step 1: Create simple validation function (integer comparison only)
CREATE OR REPLACE FUNCTION public.validate_answer_simple(
  question_id_param uuid,
  submitted_index integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  correct_index integer;
BEGIN
  -- Get correct answer as integer
  SELECT 
    CASE 
      WHEN jsonb_typeof(correct_answer) = 'number' THEN (correct_answer::text)::integer
      ELSE NULL
    END INTO correct_index
  FROM public.questions
  WHERE id = question_id_param AND is_active = true;
  
  -- Simple comparison
  RETURN (submitted_index = correct_index);
END;
$$;

-- Step 2: Create helper function to normalize existing questions
CREATE OR REPLACE FUNCTION public.normalize_question_answers()
RETURNS TABLE(question_id uuid, old_format text, new_format integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH normalized AS (
    SELECT 
      q.id as question_id,
      q.correct_answer::text as old_format,
      CASE
        -- Already an integer
        WHEN jsonb_typeof(q.correct_answer) = 'number' THEN 
          (q.correct_answer::text)::integer
        -- Letter format: A, B, C, D
        WHEN q.correct_answer::text ~ '^"[A-D]"$' THEN 
          ascii(upper(trim(both '"' from q.correct_answer::text))) - 65
        -- Letter with punctuation: "A)", "B."
        WHEN q.correct_answer::text ~ '^"[A-D][).:-]' THEN
          ascii(upper(substring(trim(both '"' from q.correct_answer::text), 1, 1))) - 65
        -- String number: "0", "1", "2", "3"
        WHEN q.correct_answer::text ~ '^"[0-3]"$' THEN
          (trim(both '"' from q.correct_answer::text))::integer
        ELSE NULL
      END as new_format,
      CASE
        WHEN jsonb_typeof(q.correct_answer) = 'number' THEN 'already_normalized'
        ELSE 'needs_update'
      END as status
    FROM public.questions q
    WHERE q.is_active = true
  )
  SELECT * FROM normalized;
END;
$$;

-- Step 3: Actually update questions to use integer format
CREATE OR REPLACE FUNCTION public.apply_answer_normalization()
RETURNS TABLE(updated_count integer, failed_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  update_count integer := 0;
  fail_count integer := 0;
BEGIN
  -- Only allow admins to run this
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Update all questions with normalized integer indices
  UPDATE public.questions q
  SET correct_answer = to_jsonb(
    CASE
      WHEN jsonb_typeof(q.correct_answer) = 'number' THEN 
        (q.correct_answer::text)::integer
      WHEN q.correct_answer::text ~ '^"[A-D]"$' THEN 
        ascii(upper(trim(both '"' from q.correct_answer::text))) - 65
      WHEN q.correct_answer::text ~ '^"[A-D][).:-]' THEN
        ascii(upper(substring(trim(both '"' from q.correct_answer::text), 1, 1))) - 65
      WHEN q.correct_answer::text ~ '^"[0-3]"$' THEN
        (trim(both '"' from q.correct_answer::text))::integer
      ELSE 0
    END
  )
  WHERE is_active = true
    AND jsonb_typeof(q.correct_answer) != 'number';
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Count questions that couldn't be normalized
  SELECT COUNT(*) INTO fail_count
  FROM public.questions
  WHERE is_active = true 
    AND correct_answer IS NULL;
  
  RETURN QUERY SELECT update_count, fail_count;
END;
$$;

-- Step 4: Add comment for documentation
COMMENT ON FUNCTION public.validate_answer_simple IS 
'Simple integer-based answer validation. Expects submitted_index (0-3) and compares with questions.correct_answer (stored as integer 0-3).';

COMMENT ON FUNCTION public.apply_answer_normalization IS
'Admin-only function to convert all existing correct_answer values to standardized 0-based integer format.';