-- Final cleanup with corrected regex patterns

-- Fix century notations like $15\text{th to proper format
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\$([0-9]+)\\text\{th', '\1th', 'g')
WHERE question_text ~ '\$[0-9]+\\text\{th';

UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\$([0-9]+)\\text\{st', '\1st', 'g')
WHERE question_text ~ '\$[0-9]+\\text\{st';

UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\$([0-9]+)\\text\{nd', '\1nd', 'g')
WHERE question_text ~ '\$[0-9]+\\text\{nd';

-- Clean up options with century notations
UPDATE public.questions 
SET options = (
  CASE 
    WHEN jsonb_typeof(options) = 'array' THEN
      (SELECT jsonb_agg(to_jsonb(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(value::text, '\$([0-9]+)\\text\{th', '\1th', 'g'),
            '\$([0-9]+)\\text\{st', '\1st', 'g'
          ),
          '\$([0-9]+)\\text\{nd', '\1nd', 'g'
        )
      ))
      FROM jsonb_array_elements_text(options) AS value)
    WHEN jsonb_typeof(options) = 'object' THEN
      (SELECT jsonb_object_agg(
        key,
        to_jsonb(
          REGEXP_REPLACE(
            REGEXP_REPLACE(
              REGEXP_REPLACE(value::text, '\$([0-9]+)\\text\{th', '\1th', 'g'),
              '\$([0-9]+)\\text\{st', '\1st', 'g'
            ),
            '\$([0-9]+)\\text\{nd', '\1nd', 'g'
          )
        )
      )
      FROM jsonb_each_text(options) AS kv(key, value))
    ELSE options
  END
)
WHERE options::text ~ '\$[0-9]+\\text\{(th|st|nd)';

-- Simple cleanup of dollar signs around single words (without backslashes)
UPDATE public.questions 
SET question_text = REGEXP_REPLACE(question_text, '\$([A-Za-z]+)\$', '\1', 'g')
WHERE question_text ~ '\$[A-Za-z]+\$';

UPDATE public.questions 
SET options = (
  CASE 
    WHEN jsonb_typeof(options) = 'array' THEN
      (SELECT jsonb_agg(to_jsonb(
        REGEXP_REPLACE(value::text, '\$([A-Za-z]+)\$', '\1', 'g')
      ))
      FROM jsonb_array_elements_text(options) AS value)
    WHEN jsonb_typeof(options) = 'object' THEN
      (SELECT jsonb_object_agg(
        key,
        to_jsonb(
          REGEXP_REPLACE(value::text, '\$([A-Za-z]+)\$', '\1', 'g')
        )
      )
      FROM jsonb_each_text(options) AS kv(key, value))
    ELSE options
  END
)
WHERE options::text ~ '\$[A-Za-z]+\$';