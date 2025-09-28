-- First, delete attempt_answers for questions that will be deleted
DELETE FROM public.attempt_answers 
WHERE question_id IN (
  SELECT id FROM public.questions 
  WHERE 
    -- Questions with LaTeX commands that weren't converted
    (question_text ~ '\\\\(mathbf|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Delta|Omega|cdot|times|div|pm|leq|geq|neq|infty|sum|int)(\{|\\s)')
    OR
    (explanation ~ '\\\\(mathbf|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Delta|Omega|cdot|times|div|pm|leq|geq|neq|infty|sum|int)(\{|\\s)')
    OR
    (options::text ~ '\\\\(mathbf|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Delta|Omega|cdot|times|div|pm|leq|geq|neq|infty|sum|int)(\{|\\s)')
    OR
    -- Questions with incomplete/missing data
    (question_text IS NULL OR question_text = '' OR LENGTH(TRIM(question_text)) < 10)
    OR
    (options IS NULL OR jsonb_array_length(COALESCE(options, '[]'::jsonb)) < 2)
    OR
    (correct_answer IS NULL)
    OR
    -- Questions with malformed options
    (options::text = '{}' OR options::text = '[]')
    OR
    -- Questions with very short or suspicious content
    (LENGTH(TRIM(question_text)) < 20 AND question_text !~ '[A-Za-z]{5,}')
    OR
    -- Questions with only numbers or symbols (likely corrupted)
    (question_text ~ '^[0-9\s\.,;:\-\+\*\/\(\)\[\]]+$')
);

-- Now delete the problematic questions
DELETE FROM public.questions 
WHERE 
  -- Questions with LaTeX commands that weren't converted
  (question_text ~ '\\\\(mathbf|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Delta|Omega|cdot|times|div|pm|leq|geq|neq|infty|sum|int)(\{|\\s)')
  OR
  (explanation ~ '\\\\(mathbf|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Delta|Omega|cdot|times|div|pm|leq|geq|neq|infty|sum|int)(\{|\\s)')
  OR
  (options::text ~ '\\\\(mathbf|frac|sqrt|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Delta|Omega|cdot|times|div|pm|leq|geq|neq|infty|sum|int)(\{|\\s)')
  OR
  -- Questions with incomplete/missing data
  (question_text IS NULL OR question_text = '' OR LENGTH(TRIM(question_text)) < 10)
  OR
  (options IS NULL OR jsonb_array_length(COALESCE(options, '[]'::jsonb)) < 2)
  OR
  (correct_answer IS NULL)
  OR
  -- Questions with malformed options
  (options::text = '{}' OR options::text = '[]')
  OR
  -- Questions with very short or suspicious content
  (LENGTH(TRIM(question_text)) < 20 AND question_text !~ '[A-Za-z]{5,}')
  OR
  -- Questions with only numbers or symbols (likely corrupted)
  (question_text ~ '^[0-9\s\.,;:\-\+\*\/\(\)\[\]]+$');