-- Add RLS policy to allow users to view questions from their active attempts
CREATE POLICY "Users can view questions from their active attempts" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND a.status IN ('STARTED'::attempt_status, 'IN_PROGRESS'::attempt_status)
    AND a.selected_subjects @> to_jsonb(questions.subject_id::text)
  )
);