-- Fix remaining LaTeX issues using proper JSON functions
-- Question 1: Fix options array
UPDATE public.questions 
SET options = jsonb_set(
    options,
    '{1}',
    '"**The Holy Trinity (Father, Son, Holy Spirit)**"'
)
WHERE id = '0d3320c7-cfcf-4b76-bff7-5500872e5711';

-- Question 2: Fix options array
UPDATE public.questions 
SET options = jsonb_set(
    options,
    '{2}',
    '"**Athens (Areopagus)**"'
)
WHERE id = '7a87c7b2-c45a-41af-979e-27c6118a3b66';

-- Question 3: Fix options array
UPDATE public.questions 
SET options = jsonb_set(
    options,
    '{2}',
    '"**One God in three persons (Father, Son, Holy Spirit)**"'
)
WHERE id = 'a02bbcf8-21da-4549-82c3-cd5c0006ff7c';

-- Question 4: Fix options array
UPDATE public.questions 
SET options = jsonb_set(
    options,
    '{2}',
    '"**605 B.C.**"'
)
WHERE id = '78fb8175-1c38-4725-a2f0-9c320c07e878';

-- Question 5: Fix options array
UPDATE public.questions 
SET options = jsonb_set(
    options,
    '{0}',
    '"**Used to serve God and others (stewardship)**"'
)
WHERE id = '8cd4e267-486a-4996-b186-eb5b53125eda';

-- Fix explanations with remaining \text patterns
UPDATE public.questions 
SET explanation = REPLACE(
    REPLACE(explanation, '\\text{', ''),
    '}', ''
)
WHERE explanation ~ '\\\\text\\{';

-- Final verification
SELECT COUNT(*) as completely_clean_questions 
FROM questions 
WHERE question_text !~ '\\\\(mathbf|text)' 
   AND options::text !~ '\\\\(mathbf|text)'
   AND (explanation IS NULL OR explanation !~ '\\\\(mathbf|text)');