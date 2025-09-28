-- Final comprehensive LaTeX cleanup for complex nested patterns

-- Fix nested \text{ patterns and spacing issues
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(question_text, '\$\*\*[^*]*\\text\{[^}]*\*\*\$', '**[formatting error]**', 'g'),
    '\\mathbf\s*\}\s*', '**[missing text]**', 'g'
  ),
  '\s+', ' ', 'g'
)
WHERE question_text ~ '(\$\*\*[^*]*\\text\{|\mathbf\s*\}\s*)';

-- Clean up complex option patterns with nested LaTeX
UPDATE public.questions 
SET options = (
  CASE 
    WHEN jsonb_typeof(options) = 'array' THEN
      (SELECT jsonb_agg(to_jsonb(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '\$\*\*[^*]*\\text\{[^}]*\*\*\$', '[LaTeX formatting error]', 'g'),
            '\\text\{[^}]*\}\s*\\text\{[^}]*\}', '', 'g'
          ),
          '\s+', ' ', 'g'
        )
      ))
      FROM jsonb_array_elements_text(options) AS value)
    WHEN jsonb_typeof(options) = 'object' THEN
      (SELECT jsonb_object_agg(
        key,
        to_jsonb(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(value::text, '\$\*\*[^*]*\\text\{[^}]*\*\*\$', '[LaTeX formatting error]', 'g'),
              '\\text\{[^}]*\}\s*\\text\{[^}]*\}', '', 'g'
            ),
            '\s+', ' ', 'g'
          )
        )
      )
      FROM jsonb_each_text(options) AS kv(key, value))
    ELSE options
  END
)
WHERE options::text ~ '(\$\*\*[^*]*\\text\{|\\text\{[^}]*\}\s*\\text\{)';

-- Clean up remaining artifacts and normalize spacing
UPDATE public.questions 
SET 
  question_text = TRIM(REGEXP_REPLACE(question_text, '\s+', ' ', 'g')),
  explanation = CASE 
    WHEN explanation IS NOT NULL THEN 
      TRIM(REGEXP_REPLACE(explanation, '\s+', ' ', 'g'))
    ELSE explanation
  END
WHERE question_text ~ '\s{2,}' OR (explanation IS NOT NULL AND explanation ~ '\s{2,}');

-- Fix questions with missing content after \mathbf removal
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, 'The\s+\*\*\[missing text\]\*\*', 'The **[topic]**', 'g')
WHERE question_text ~ 'The\s+\*\*\[missing text\]\*\*';

-- Final cleanup of broken patterns
UPDATE public.questions 
SET question_text = REPLACE(question_text, 'The  means:', 'The term means:')
WHERE question_text LIKE '%The  means:%';

-- Create a cleanup log for tracking
INSERT INTO audit_logs (action_type, target_type, details, created_at)
VALUES (
  'LATEX_CLEANUP_COMPLETED',
  'questions',
  jsonb_build_object(
    'cleanup_timestamp', now(),
    'description', 'Comprehensive LaTeX formatting cleanup completed'
  ),
  now()
);