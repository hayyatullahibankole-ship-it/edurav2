-- Create storage bucket for school logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-logos', 'school-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for school logos
CREATE POLICY "School admins can upload their school logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'school-logos' AND
  EXISTS (
    SELECT 1 FROM schools s
    JOIN users u ON s.admin_user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND (storage.foldername(name))[1] = s.id::text
  )
);

CREATE POLICY "Anyone can view school logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'school-logos');

CREATE POLICY "School admins can update their school logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'school-logos' AND
  EXISTS (
    SELECT 1 FROM schools s
    JOIN users u ON s.admin_user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND (storage.foldername(name))[1] = s.id::text
  )
);

CREATE POLICY "School admins can delete their school logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'school-logos' AND
  EXISTS (
    SELECT 1 FROM schools s
    JOIN users u ON s.admin_user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND (storage.foldername(name))[1] = s.id::text
  )
);