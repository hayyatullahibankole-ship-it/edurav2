-- Clean up the final remaining LaTeX patterns with spaces and incomplete tags

-- Fix incomplete \mathbf patterns in question text
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, 'The Christian \\mathbf affirms', 'The Christian **doctrine** affirms', 'g')
WHERE question_text ~ 'The Christian \\mathbf affirms';

UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, 'about the \\mathbf was:', 'about the **Unknown God** was:', 'g')  
WHERE question_text ~ 'about the \\mathbf was:';

UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, 'doctrine of the states', 'doctrine of the **Trinity** states', 'g')
WHERE question_text ~ 'doctrine of the states';

-- Clean up complex LaTeX in options with internal spaces
UPDATE public.questions 
SET options = (
  CASE 
    WHEN jsonb_typeof(options) = 'array' THEN
      (SELECT jsonb_agg(to_jsonb(
        REGEXP_REPLACE(
          value::text, 
          '\$\\mathbf\{([^}]*)\}\$', 
          '**\1**', 
          'g'
        )
      ))
      FROM jsonb_array_elements_text(options) AS value)
    WHEN jsonb_typeof(options) = 'object' THEN
      (SELECT jsonb_object_agg(
        key,
        to_jsonb(
          REGEXP_REPLACE(
            value::text, 
            '\$\\mathbf\{([^}]*)\}\$', 
            '**\1**', 
            'g'
          )
        )
      )
      FROM jsonb_each_text(options) AS kv(key, value))
    ELSE options
  END
)
WHERE options::text ~ '\$\\mathbf\{[^}]*\}\$';

-- Final verification and count
SELECT COUNT(*) as cleaned_questions FROM questions 
WHERE question_text !~ '\\\\(mathbf|text)\{' AND options::text !~ '\\\\(mathbf|text)\{';