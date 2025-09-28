-- LaTeX \mathbf{} formatting conversion function
CREATE OR REPLACE FUNCTION public.convert_latex_mathbf_to_markdown()
RETURNS TABLE(updated_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  update_count INTEGER := 0;
BEGIN
  -- Update question_text field - convert \mathbf{text} to **text**
  UPDATE public.questions 
  SET question_text = REGEXP_REPLACE(
    question_text, 
    '\\mathbf\{([^}]+)\}', 
    '**\1**', 
    'g'
  )
  WHERE question_text ~ '\\mathbf\{[^}]+\}';
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Update options field (JSON field)
  UPDATE public.questions 
  SET options = (
    SELECT jsonb_object_agg(
      key, 
      REGEXP_REPLACE(value::text, '\\mathbf\{([^}]+)\}', '**\1**', 'g')
    )
    FROM jsonb_each_text(options) AS kv(key, value)
  )
  WHERE options::text ~ '\\mathbf\{[^}]+\}';
  
  -- Update explanation field
  UPDATE public.questions 
  SET explanation = REGEXP_REPLACE(
    explanation, 
    '\\mathbf\{([^}]+)\}', 
    '**\1**', 
    'g'
  )
  WHERE explanation ~ '\\mathbf\{[^}]+\}' AND explanation IS NOT NULL;
  
  -- Update correct_answer field if it contains text
  UPDATE public.questions 
  SET correct_answer = (
    CASE 
      WHEN jsonb_typeof(correct_answer) = 'string' THEN
        to_jsonb(REGEXP_REPLACE(correct_answer::text, '\\mathbf\{([^}]+)\}', '**\1**', 'g'))
      ELSE correct_answer
    END
  )
  WHERE correct_answer::text ~ '\\mathbf\{[^}]+\}';
  
  RETURN QUERY SELECT update_count;
END;
$$;