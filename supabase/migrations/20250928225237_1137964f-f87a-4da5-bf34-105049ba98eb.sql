-- Fix remaining LaTeX patterns that were missed
-- Pattern 1: Fix \mathbf\text patterns
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\\\mathbf\\\\text', '**', 'g')
WHERE question_text ~ '\\\\mathbf\\\\text';

-- Pattern 2: Fix standalone \mathbf patterns  
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\\\mathbf', '**', 'g')
WHERE question_text ~ '\\\\mathbf';

-- Pattern 3: Fix \text patterns
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\\\text\\s*\\{([^}]*)\\}', '\1', 'g')
WHERE question_text ~ '\\\\text\\s*\\{[^}]*\\}';

-- Pattern 4: Fix remaining \text without braces
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\\\text', '', 'g')
WHERE question_text ~ '\\\\text';

-- Pattern 5: Fix \texts patterns
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\\\texts', 'FTZs', 'g')
WHERE question_text ~ '\\\\texts';

-- Clean up options field
UPDATE public.questions 
SET options = (
  CASE 
    WHEN jsonb_typeof(options) = 'array' THEN
      (SELECT jsonb_agg(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                value::text, 
                '\\\\mathbf\\\\text', '**', 'g'
              ),
              '\\\\mathbf', '**', 'g'
            ),
            '\\\\text\\s*\\{([^}]*)\\}', '\1', 'g'
          ),
          '\\\\text', '', 'g'
        )
      )
      FROM jsonb_array_elements_text(options) AS value)
    WHEN jsonb_typeof(options) = 'object' THEN
      (SELECT jsonb_object_agg(
        key,
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                value::text, 
                '\\\\mathbf\\\\text', '**', 'g'
              ),
              '\\\\mathbf', '**', 'g'
            ),
            '\\\\text\\s*\\{([^}]*)\\}', '\1', 'g'
          ),
          '\\\\text', '', 'g'
        )
      )
      FROM jsonb_each_text(options) AS kv(key, value))
    ELSE options
  END
)
WHERE options::text ~ '\\\\(mathbf|text)';

-- Clean up explanation field
UPDATE public.questions 
SET explanation = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        explanation, 
        '\\\\mathbf\\\\text', '**', 'g'
      ),
      '\\\\mathbf', '**', 'g'
    ),
    '\\\\text\\s*\\{([^}]*)\\}', '\1', 'g'
  ),
  '\\\\text', '', 'g'
)
WHERE explanation ~ '\\\\(mathbf|text)' AND explanation IS NOT NULL;

-- Final count of cleaned questions
SELECT COUNT(*) as remaining_latex_issues 
FROM questions 
WHERE question_text ~ '\\\\(mathbf|text)' 
   OR options::text ~ '\\\\(mathbf|text)'
   OR explanation ~ '\\\\(mathbf|text)';