ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS user_files jsonb NOT NULL DEFAULT '[]'::jsonb;

DROP POLICY IF EXISTS "Users submit details on own paid requests" ON public.service_requests;
CREATE POLICY "Users submit details on own paid requests"
ON public.service_requests FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND status = ANY (ARRAY['awaiting_details'::text, 'needs_resubmission'::text]))
WITH CHECK (auth.uid() = user_id AND status = ANY (ARRAY['awaiting_details'::text, 'needs_resubmission'::text, 'pending'::text]));

CREATE POLICY "Users upload own service documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'service-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users read own service documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'service-uploads' AND ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Users update own service documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'service-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'service-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own service documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'service-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);