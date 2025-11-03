-- Allow school admins to view their students' attempts and results

-- Policy for school admins to view their students' attempts
CREATE POLICY "School admins can view their students' attempts"
ON public.attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.school_students ss
    JOIN public.schools sch ON ss.school_id = sch.id
    JOIN public.users u ON sch.admin_user_id = u.id
    WHERE ss.user_id = attempts.user_id
      AND u.auth_user_id = auth.uid()
  )
);

-- Policy for school admins to view their students' results
CREATE POLICY "School admins can view their students' results"
ON public.results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.attempts a
    JOIN public.school_students ss ON a.user_id = ss.user_id
    JOIN public.schools sch ON ss.school_id = sch.id
    JOIN public.users u ON sch.admin_user_id = u.id
    WHERE a.id = results.attempt_id
      AND u.auth_user_id = auth.uid()
  )
);

-- Policy for school admins to view their students' attempt answers
CREATE POLICY "School admins can view their students' attempt answers"
ON public.attempt_answers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.attempts a
    JOIN public.school_students ss ON a.user_id = ss.user_id
    JOIN public.schools sch ON ss.school_id = sch.id
    JOIN public.users u ON sch.admin_user_id = u.id
    WHERE a.id = attempt_answers.attempt_id
      AND u.auth_user_id = auth.uid()
  )
);