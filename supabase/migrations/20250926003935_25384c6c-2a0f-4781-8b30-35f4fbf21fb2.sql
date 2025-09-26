-- More comprehensive cleanup of history questions formatting
UPDATE questions 
SET question_text = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(question_text, 
              '\\$[^$]*\\$', '', 'g'), -- Remove any remaining $...$ patterns
            '\\\\mathbf\{([^}]*)\}', '\1', 'g'), -- Convert \mathbf{text} to text
          '\\\\text\{([^}]*)\}', '\1', 'g'), -- Convert \text{text} to text
        '\}+', '', 'g'), -- Remove standalone closing braces
      '\s+', ' ', 'g'), -- Replace multiple spaces with single space
    '^\s+|\s+$', '', 'g'), -- Trim leading/trailing spaces
  '\s+([.:,;!?])', '\1', 'g') -- Remove spaces before punctuation
WHERE subject_id IN (
  SELECT id FROM subjects WHERE name ILIKE '%history%'
) 
AND (question_text LIKE '%}%' OR question_text LIKE '%$%' OR question_text LIKE '%\\%');