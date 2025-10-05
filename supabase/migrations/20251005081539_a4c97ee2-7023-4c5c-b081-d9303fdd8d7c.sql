-- Tighten RLS to prevent changing answers after submission
-- Update policy on public.attempt_answers to disallow UPDATEs once an attempt is SUBMITTED

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update own attempt answers during active attempts" ON public.attempt_answers;

-- Recreate UPDATE policy without allowing SUBMITTED status
CREATE POLICY "Users can update answers only before submission"
ON public.attempt_answers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.attempts a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_answers.attempt_id
      AND u.auth_user_id = auth.uid()
      AND a.status = ANY (ARRAY['STARTED'::attempt_status, 'IN_PROGRESS'::attempt_status])
  )
);

-- Keep INSERT policy as-is to avoid breaking submission flows that insert answers before finalizing
-- No change to SELECT policies
