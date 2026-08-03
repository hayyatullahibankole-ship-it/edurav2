ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS result_files jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Admin visibility / management of service requests
DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests;
CREATE POLICY "Admins can view all service requests"
ON public.service_requests FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update all service requests" ON public.service_requests;
CREATE POLICY "Admins can update all service requests"
ON public.service_requests FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Storage policies for service-results bucket
DROP POLICY IF EXISTS "Admins manage service result files" ON storage.objects;
CREATE POLICY "Admins manage service result files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'service-results' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'service-results' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read their own service result files" ON storage.objects;
CREATE POLICY "Users read their own service result files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'service-results'
  AND (storage.foldername(name))[1] = auth.uid()::text
);