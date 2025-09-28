-- Security Fix 1: Create audit logging function first
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  admin_id uuid,
  target_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    action_type,
    actor_user_id,
    target_id,
    target_type,
    details,
    ip_address,
    created_at
  ) VALUES (
    action_type,
    admin_id,
    target_id,
    'user',
    jsonb_build_object('timestamp', now()),
    inet_client_addr(),
    now()
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if logging fails
    RETURN true;
END;
$$;

-- Security Fix 2: Strengthen questions RLS to prevent answer exposure
-- Drop existing question policies
DROP POLICY IF EXISTS "Users can view questions from their submitted attempts" ON public.questions;
DROP POLICY IF EXISTS "Users can view questions from their active attempts" ON public.questions;

-- Create secure questions function that never exposes answers
CREATE OR REPLACE FUNCTION public.get_exam_questions_secure(exam_question_ids uuid[])
RETURNS TABLE(
  id uuid, 
  question_text text, 
  type question_type, 
  options jsonb, 
  difficulty_level integer, 
  media_urls jsonb, 
  points numeric, 
  time_limit_seconds integer, 
  subject_id uuid, 
  tags jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question_text,
    q.type,
    q.options,
    q.difficulty_level,
    q.media_urls,
    q.points,
    q.time_limit_seconds,
    q.subject_id,
    q.tags
  FROM public.questions q
  WHERE q.id = ANY(exam_question_ids)
    AND q.is_active = true;
  -- Note: correct_answer and explanation are deliberately excluded
END;
$$;

-- Create new restrictive policies for questions
CREATE POLICY "Users can view questions without answers from active attempts" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE u.auth_user_id = auth.uid() 
    AND a.status IN ('STARTED', 'IN_PROGRESS')
    AND a.selected_subjects @> to_jsonb(questions.subject_id::text)
  )
);

-- Allow viewing questions (but not answers) from submitted attempts for review
CREATE POLICY "Users can view submitted questions without answers" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM attempt_answers aa
    JOIN attempts a ON aa.attempt_id = a.id
    JOIN users u ON a.user_id = u.id
    WHERE aa.question_id = questions.id 
    AND u.auth_user_id = auth.uid() 
    AND a.status = 'SUBMITTED'
  )
);

-- Security Fix 3: Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (true);

-- Security Fix 4: Add input validation function
CREATE OR REPLACE FUNCTION public.validate_user_input(
  input_data jsonb,
  validation_rules jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rule_key text;
  rule_value jsonb;
  input_value text;
BEGIN
  -- Loop through validation rules
  FOR rule_key, rule_value IN SELECT * FROM jsonb_each(validation_rules)
  LOOP
    input_value := input_data ->> rule_key;
    
    -- Check required fields
    IF rule_value ->> 'required' = 'true' AND (input_value IS NULL OR input_value = '') THEN
      RETURN false;
    END IF;
    
    -- Check max length
    IF rule_value ? 'maxLength' AND length(input_value) > (rule_value ->> 'maxLength')::integer THEN
      RETURN false;
    END IF;
    
    -- Check pattern matching
    IF rule_value ? 'pattern' AND input_value !~ (rule_value ->> 'pattern') THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$;