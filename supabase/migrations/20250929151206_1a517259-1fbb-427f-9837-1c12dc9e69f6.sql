-- Correct storage RLS policies for profile avatar uploads in 'uploads' bucket

-- Remove previously added avatar-specific policies (if any)
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Public read access for files in the 'uploads' bucket (bucket is public)
CREATE POLICY "Public uploads access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- Users can upload avatar files named with their auth uid prefix under avatars/
CREATE POLICY "Users can upload avatar files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND auth.uid() IS NOT NULL
  AND name LIKE ('avatars/' || auth.uid()::text || '%')
);

-- Users can update their own avatar files
CREATE POLICY "Users can update avatar files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND auth.uid() IS NOT NULL
  AND name LIKE ('avatars/' || auth.uid()::text || '%')
);

-- Users can delete their own avatar files
CREATE POLICY "Users can delete avatar files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads'
  AND auth.uid() IS NOT NULL
  AND name LIKE ('avatars/' || auth.uid()::text || '%')
);