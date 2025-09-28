-- Fix the specific remaining LaTeX issues using proper JSON array updates
UPDATE public.questions 
SET options = jsonb_set(
  options, 
  '{1}', 
  '"**The Holy Trinity (Father, Son, Holy Spirit)**"'
)
WHERE id = '0d3320c7-cfcf-4b76-bff7-5500872e5711';

UPDATE public.questions 
SET options = jsonb_set(
  options, 
  '{2}', 
  '"**Athens (Areopagus)**"'
)
WHERE id = '7a87c7b2-c45a-41af-979e-27c6118a3b66';

UPDATE public.questions 
SET options = jsonb_set(
  options, 
  '{2}', 
  '"**One God in three persons (Father, Son, Holy Spirit)**"'
)
WHERE id = 'a02bbcf8-21da-4549-82c3-cd5c0006ff7c';

UPDATE public.questions 
SET options = jsonb_set(
  options, 
  '{2}', 
  '"**605 B.C.**"'
)
WHERE id = '78fb8175-1c38-4725-a2f0-9c320c07e878';

UPDATE public.questions 
SET options = jsonb_set(
  options, 
  '{0}', 
  '"**Used to serve God and others (stewardship)**"'
)
WHERE id = '8cd4e267-486a-4996-b186-eb5b53125eda';

-- Fix explanations with LaTeX
UPDATE public.questions 
SET explanation = REPLACE(explanation, '$**Unknown \\text{God**$', '**Unknown God**')
WHERE explanation LIKE '%$**Unknown \\text{God**$%';

UPDATE public.questions 
SET explanation = REPLACE(explanation, '$**three \\text{in \\text{one**$', '**three in one**')
WHERE explanation LIKE '%$**three \\text{in \\text{one**$%';

UPDATE public.questions 
SET explanation = REPLACE(explanation, '$**generous \\text{stewardship**$', '**generous stewardship**')
WHERE explanation LIKE '%$**generous \\text{stewardship**$%';

-- Remove any remaining LaTeX formatting patterns
UPDATE public.questions 
SET explanation = REGEXP_REPLACE(explanation, '\\$\\*\\*([^*]+)\\\\text\\{([^}]*)\\}([^*]*)\\*\\*\\$', '**\1\2\3**', 'g')
WHERE explanation ~ '\\$\\*\\*[^*]+\\\\text\\{[^}]*\\}[^*]*\\*\\*\\$';

-- Final comprehensive cleanup
UPDATE public.questions 
SET 
  question_text = REGEXP_REPLACE(question_text, '\\\\text\\{([^}]*)\\}', '\1', 'g'),
  explanation = REGEXP_REPLACE(explanation, '\\\\text\\{([^}]*)\\}', '\1', 'g')
WHERE question_text ~ '\\\\text\\{[^}]*\\}' OR explanation ~ '\\\\text\\{[^}]*\\}';

-- Final count check
SELECT COUNT(*) as remaining_latex_issues 
FROM questions 
WHERE question_text ~ '\\\\(mathbf|text)' 
   OR options::text ~ '\\\\(mathbf|text)'
   OR explanation ~ '\\\\(mathbf|text)';