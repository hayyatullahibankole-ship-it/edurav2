-- Create resources bucket for file storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'text/plain',
    'text/html'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Create uploads bucket (legacy support)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads', 
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'text/plain',
    'text/html'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resources bucket
CREATE POLICY "Anyone can view resources" ON storage.objects
FOR SELECT USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload to resources bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'resources' AND 
  (EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  ))
);

CREATE POLICY "Admins can update resources" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'resources' AND
  (EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  ))
);

CREATE POLICY "Admins can delete resources" ON storage.objects
FOR DELETE USING (
  bucket_id = 'resources' AND
  (EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  ))
);

-- Storage policies for uploads bucket (legacy support)
CREATE POLICY "Anyone can view uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

CREATE POLICY "Admins can upload to uploads bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND 
  (EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  ))
);

CREATE POLICY "Admins can update uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'uploads' AND
  (EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  ))
);

CREATE POLICY "Admins can delete uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND
  (EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.user_roles ur ON u.id = ur.user_id 
    WHERE u.auth_user_id = auth.uid() 
    AND ur.role IN ('admin', 'super_admin')
  ))
);