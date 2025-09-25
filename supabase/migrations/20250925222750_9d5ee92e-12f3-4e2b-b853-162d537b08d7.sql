-- Create function to get question counts per subject for authenticated users
CREATE OR REPLACE FUNCTION get_subject_question_counts()
RETURNS TABLE(subject_id uuid, question_count bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    q.subject_id,
    COUNT(*) as question_count
  FROM questions q
  WHERE q.is_active = true
  GROUP BY q.subject_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_subject_question_counts() TO authenticated;