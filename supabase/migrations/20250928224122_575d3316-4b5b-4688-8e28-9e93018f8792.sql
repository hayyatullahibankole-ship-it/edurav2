-- Targeted final cleanup to remove leftover artifacts

-- Remove stray "\\mathbf }" tokens in question_text and explanation
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\mathbf\s*\}', '', 'g')
WHERE question_text ~ '\\mathbf\s*\}';

UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\mathbf\s*\}', '', 'g')
WHERE explanation IS NOT NULL AND explanation ~ '\\mathbf\s*\}';

-- Clean options (array): remove stray tokens, unwrap broken text, strip math $ around markdown
UPDATE public.questions 
SET options = (
  SELECT jsonb_agg(to_jsonb(
    TRIM(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '\\mathbf\s*\}', '', 'g'),
            '\\text\{', '', 'g'
          ),
          '\}', '', 'g'
        ),
        '\$\*\*', '**', 'g'
      ),
      '\*\*\$', '**', 'g'
    ))
  ))
  FROM jsonb_array_elements_text(options) AS value
)
WHERE jsonb_typeof(options) = 'array' AND options::text ~ '(\\mathbf\s*\}|\\text\{|\}\$|\$\*\*)';

-- Clean options (object): same transformations
UPDATE public.questions 
SET options = (
  SELECT jsonb_object_agg(
    key,
    to_jsonb(TRIM(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '\\mathbf\s*\}', '', 'g'),
            '\\text\{', '', 'g'
          ),
          '\}', '', 'g'
        ),
        '\$\*\*', '**', 'g'
      ),
      '\*\*\$', '**', 'g'
    )))
  )
  FROM jsonb_each_text(options) AS kv(key, value)
)
WHERE jsonb_typeof(options) = 'object' AND options::text ~ '(\\mathbf\s*\}|\\text\{|\}\$|\$\*\*)';

-- Normalize repeated spaces again
UPDATE public.questions 
SET question_text = TRIM(REGEXP_REPLACE(question_text, '\s+', ' ', 'g')),
    explanation = CASE WHEN explanation IS NOT NULL THEN TRIM(REGEXP_REPLACE(explanation, '\s+', ' ', 'g')) ELSE explanation END
WHERE question_text ~ '\s{2,}' OR (explanation IS NOT NULL AND explanation ~ '\s{2,}');