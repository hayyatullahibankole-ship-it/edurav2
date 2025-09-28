-- Create uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 'uploads', 'uploads', true, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'video/mp4', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads');

-- Create RLS policies for uploads bucket
CREATE POLICY "Admins can upload files to uploads bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'uploads' AND is_admin(auth.uid()));

CREATE POLICY "Anyone can view files in uploads bucket" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'uploads');

CREATE POLICY "Admins can update files in uploads bucket" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'uploads' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete files in uploads bucket" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'uploads' AND is_admin(auth.uid()));