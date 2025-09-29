-- Create system_settings table for storing configuration values
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to public settings
CREATE POLICY "Public settings are viewable by everyone" 
ON public.system_settings 
FOR SELECT 
USING (is_public = true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage all settings" 
ON public.system_settings 
FOR ALL 
USING (is_admin(auth.uid()));

-- Insert Paystack public key setting (will be updated by admin)
INSERT INTO public.system_settings (key, value, description, is_public) 
VALUES ('paystack_public_key', 'pk_test_default', 'Paystack public key for payment processing', true)
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();