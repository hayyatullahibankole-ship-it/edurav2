-- Add RLS policy to allow users to view questions they have attempted in submitted exams
CREATE POLICY "Users can view questions from their submitted attempts" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.attempt_answers aa
    JOIN public.attempts a ON aa.attempt_id = a.id
    JOIN public.users u ON a.user_id = u.id
    WHERE aa.question_id = questions.id 
      AND u.auth_user_id = auth.uid()
      AND a.status = 'SUBMITTED'
  )
);