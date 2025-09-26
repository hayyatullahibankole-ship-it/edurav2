-- Clean up history questions by removing LaTeX formatting
UPDATE questions 
SET question_text = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(question_text, '$\text{', ''),
              '}$', ''
            ),
            '$\mathbf{\text{', ''
          ),
          '$\mathbf{', ''
        ),
        '\text{ } \text{', ' '
      ),
      '\text{ }', ' '
    ),
    '}}$}$', ''
  ),
  '}}$', ''
)
WHERE subject_id IN (
  SELECT id FROM subjects WHERE name ILIKE '%history%'
) 
AND question_text LIKE '%$%';