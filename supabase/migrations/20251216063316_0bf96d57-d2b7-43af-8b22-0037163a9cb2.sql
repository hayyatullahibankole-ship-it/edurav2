-- Add flyer_url column to akboy_tutorials
ALTER TABLE public.akboy_tutorials 
ADD COLUMN IF NOT EXISTS flyer_url TEXT;

-- Create akboy_settings table for account details and other configs
CREATE TABLE IF NOT EXISTS public.akboy_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.akboy_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage akboy settings" ON public.akboy_settings
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Public can view akboy settings" ON public.akboy_settings
FOR SELECT USING (true);

-- Insert default payment account settings
INSERT INTO public.akboy_settings (key, value, description)
VALUES (
  'payment_account',
  '{"bank_name": "Opay", "account_number": "7043871023", "account_name": "AKBOY CREATIVE HUB"}'::jsonb,
  'Payment account details for tutorial registrations'
) ON CONFLICT (key) DO NOTHING;

-- Create storage bucket for tutorial uploads if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutorial-uploads', 'tutorial-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tutorial-uploads bucket
CREATE POLICY "Anyone can view tutorial uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'tutorial-uploads');

CREATE POLICY "Anyone can upload to tutorial-uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tutorial-uploads');

CREATE POLICY "Admins can delete tutorial uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'tutorial-uploads' AND is_admin(auth.uid()));