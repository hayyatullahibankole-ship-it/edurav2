-- Fix function search path security issue
CREATE OR REPLACE FUNCTION get_subject_question_counts()
RETURNS TABLE(subject_id uuid, question_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.subject_id,
    COUNT(*) as question_count
  FROM questions q
  WHERE q.is_active = true
  GROUP BY q.subject_id;
$$;