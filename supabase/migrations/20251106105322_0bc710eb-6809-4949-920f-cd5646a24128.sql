-- Ensure public bucket for school logos and proper RLS policies
-- 1) Create bucket if missing
insert into storage.buckets (id, name, public)
values ('school-logos', 'school-logos', true)
on conflict (id) do nothing;

-- 2) Policies for storage.objects on 'school-logos'
-- Drop existing conflicting policies (safe names)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view school logos'
  ) THEN
    DROP POLICY "Public can view school logos" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'School admin can upload their logo'
  ) THEN
    DROP POLICY "School admin can upload their logo" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'School admin can update their logo'
  ) THEN
    DROP POLICY "School admin can update their logo" ON storage.objects;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'School admin can delete their logo'
  ) THEN
    DROP POLICY "School admin can delete their logo" ON storage.objects;
  END IF;
END $$;

-- Allow public read for logos
CREATE POLICY "Public can view school logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'school-logos');

-- Allow school admin to upload within their folder: <school_id>/...
CREATE POLICY "School admin can upload their logo"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'school-logos'
  AND EXISTS (
    SELECT 1
    FROM public.schools s
    JOIN public.users u ON s.admin_user_id = u.id
    WHERE s.id::text = (storage.foldername(name))[1]
      AND u.auth_user_id = auth.uid()
  )
);

-- Allow school admin to update objects in their folder
CREATE POLICY "School admin can update their logo"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'school-logos'
  AND EXISTS (
    SELECT 1
    FROM public.schools s
    JOIN public.users u ON s.admin_user_id = u.id
    WHERE s.id::text = (storage.foldername(name))[1]
      AND u.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'school-logos'
);

-- Allow school admin to delete objects in their folder
CREATE POLICY "School admin can delete their logo"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'school-logos'
  AND EXISTS (
    SELECT 1
    FROM public.schools s
    JOIN public.users u ON s.admin_user_id = u.id
    WHERE s.id::text = (storage.foldername(name))[1]
      AND u.auth_user_id = auth.uid()
  )
);
