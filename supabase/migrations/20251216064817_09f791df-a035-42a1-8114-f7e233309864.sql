-- Allow anyone to insert registrations (public form)
CREATE POLICY "Anyone can insert tutorial registrations"
ON public.akboy_tutorial_registrations
FOR INSERT
WITH CHECK (true);

-- Also ensure the storage bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorial-uploads', 'tutorial-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to tutorial-uploads bucket
DROP POLICY IF EXISTS "Anyone can upload to tutorial-uploads" ON storage.objects;
CREATE POLICY "Anyone can upload to tutorial-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tutorial-uploads');

-- Allow public viewing
DROP POLICY IF EXISTS "Anyone can view tutorial-uploads" ON storage.objects;
CREATE POLICY "Anyone can view tutorial-uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'tutorial-uploads');