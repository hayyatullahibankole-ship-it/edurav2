-- Robust LaTeX cleanup for questions across text, options (array/object), and explanation

-- 1) Strip common broken artifacts first
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\text\}', '', 'g')
WHERE question_text ~ '\\text\}';

UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\mathbf\}', '', 'g')
WHERE question_text ~ '\\mathbf\}';

-- 2) Normalize \text{ } spaces and unwrap \text{...}
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\text\{\s*\}', ' ', 'g')
WHERE question_text ~ '\\text\{\s*\}';

UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\text\{([^}]*)\}', '\1', 'g')
WHERE question_text ~ '\\text\{[^}]*\}';

-- 3) Convert \mathbf{...} to **...**
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\\mathbf\{([^}]*)\}', '**\1**', 'g')
WHERE question_text ~ '\\mathbf\{[^}]*\}';

-- 4) Apply same to explanation
UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\text\}', '', 'g')
WHERE explanation IS NOT NULL AND explanation ~ '\\text\}';

UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\mathbf\}', '', 'g')
WHERE explanation IS NOT NULL AND explanation ~ '\\mathbf\}';

UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\text\{\s*\}', ' ', 'g')
WHERE explanation IS NOT NULL AND explanation ~ '\\text\{\s*\}';

UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\text\{([^}]*)\}', '\1', 'g')
WHERE explanation IS NOT NULL AND explanation ~ '\\text\{[^}]*\}';

UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\mathbf\{([^}]*)\}', '**\1**', 'g')
WHERE explanation IS NOT NULL AND explanation ~ '\\mathbf\{[^}]*\}';

-- 5) Handle options when it's a JSON array of strings
UPDATE public.questions 
SET options = (
  SELECT jsonb_agg(to_jsonb(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(value::text, '\\text\}', '', 'g'),
        '\\text\{\s*\}', ' ', 'g'
      ),
      '\\text\{([^}]*)\}', '\1', 'g'
    )
  ))
  FROM jsonb_array_elements_text(options) AS value
)
WHERE jsonb_typeof(options) = 'array' AND options::text ~ '\\text';

UPDATE public.questions 
SET options = (
  SELECT jsonb_agg(to_jsonb(
    REGEXP_REPLACE(value::text, '\\mathbf\{([^}]*)\}', '**\1**', 'g')
  ))
  FROM jsonb_array_elements_text(options) AS value
)
WHERE jsonb_typeof(options) = 'array' AND options::text ~ '\\mathbf';

-- 6) Handle options when it's a JSON object of string values
UPDATE public.questions 
SET options = (
  SELECT jsonb_object_agg(
    key,
    to_jsonb(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(value::text, '\\text\}', '', 'g'),
          '\\text\{\s*\}', ' ', 'g'
        ),
        '\\text\{([^}]*)\}', '\1', 'g'
      )
    )
  )
  FROM jsonb_each_text(options) AS kv(key, value)
)
WHERE jsonb_typeof(options) = 'object' AND options::text ~ '\\text';

UPDATE public.questions 
SET options = (
  SELECT jsonb_object_agg(
    key,
    to_jsonb(
      REGEXP_REPLACE(value::text, '\\mathbf\{([^}]*)\}', '**\1**', 'g')
    )
  )
  FROM jsonb_each_text(options) AS kv(key, value)
)
WHERE jsonb_typeof(options) = 'object' AND options::text ~ '\\mathbf';

-- 7) Correct answer if stored as string JSON
UPDATE public.questions 
SET correct_answer = to_jsonb(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(COALESCE(correct_answer::text, ''), '\\text\}', '', 'g'),
      '\\text\{\s*\}', ' ', 'g'
    ),
    '\\text\{([^}]*)\}', '\1', 'g'
  )
)
WHERE jsonb_typeof(correct_answer) = 'string' AND correct_answer::text ~ '\\text';

UPDATE public.questions 
SET correct_answer = to_jsonb(
  REGEXP_REPLACE(COALESCE(correct_answer::text, ''), '\\mathbf\{([^}]*)\}', '**\1**', 'g')
)
WHERE jsonb_typeof(correct_answer) = 'string' AND correct_answer::text ~ '\\mathbf';