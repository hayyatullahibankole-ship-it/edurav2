DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ebook-files') THEN
    UPDATE storage.buckets SET public = true WHERE id = 'ebook-files';
  END IF;
END $$;

DROP POLICY IF EXISTS "ebook files readable by granted users" ON storage.objects;
CREATE POLICY "ebook files readable by anon and authenticated users"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'ebook-files');
