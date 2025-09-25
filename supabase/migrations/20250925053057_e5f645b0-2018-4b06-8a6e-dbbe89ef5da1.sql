-- Allow users to insert results for their own attempts
DROP POLICY IF EXISTS "Users can insert results for own attempts" ON public.results;
CREATE POLICY "Users can insert results for own attempts"
ON public.results
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = results.attempt_id
      AND u.auth_user_id = auth.uid()
  )
);

-- Allow users to update their own results  
DROP POLICY IF EXISTS "Users can update own results" ON public.results;
CREATE POLICY "Users can update own results"
ON public.results
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = results.attempt_id
      AND u.auth_user_id = auth.uid()
  )
);