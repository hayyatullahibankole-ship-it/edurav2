-- Clean up LaTeX formatting in other subjects with high LaTeX count
UPDATE questions 
SET question_text = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(
                REGEXP_REPLACE(question_text, 
                  '\\$[^$]*\\$', '', 'g'), -- Remove $...$ patterns
                '\\\\[a-zA-Z]+\{[^}]*\}', '', 'g'), -- Remove LaTeX commands like \text{...}
              '\\\\[a-zA-Z]+', '', 'g'), -- Remove standalone LaTeX commands
            '\{[^}]*\}', '', 'g'), -- Remove standalone {...} groups
          '\\\\', '', 'g'), -- Remove backslashes
        '\$', '', 'g'), -- Remove remaining dollar signs
      '\s+', ' ', 'g'), -- Replace multiple spaces with single space
    '^\s+|\s+$', '', 'g'), -- Trim leading/trailing spaces
  '\s+([.:,;!?])', '\1', 'g') -- Remove spaces before punctuation
WHERE subject_id IN (
  SELECT id FROM subjects 
  WHERE name IN ('Islamic Religious Studies', 'Christian Religious Studies', 'Accounting', 'Geography', 'Literature in English', 'Chemistry', 'Physics', 'Agricultural Science', 'Commerce', 'Economics')
) 
AND (question_text LIKE '%$%' OR question_text LIKE '%\\%' OR question_text LIKE '%{%');