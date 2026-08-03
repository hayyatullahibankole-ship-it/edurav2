GRANT UPDATE ON public.service_requests TO authenticated;

CREATE POLICY "Users submit details on own paid requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'awaiting_details')
WITH CHECK (auth.uid() = user_id AND status IN ('awaiting_details', 'pending'));