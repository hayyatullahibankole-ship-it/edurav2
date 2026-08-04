CREATE POLICY "Campus users read own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'campus-files' AND (auth.uid()::text = (storage.foldername(name))[1] OR (storage.foldername(name))[1] = 'library'));

CREATE POLICY "Campus users upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'campus-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Campus users update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'campus-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Campus users delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'campus-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Campus admins manage all files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'campus-files' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')))
  WITH CHECK (bucket_id = 'campus-files' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));