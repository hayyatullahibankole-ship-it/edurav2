-- Add exam day verification columns to mock_registrations
ALTER TABLE public.mock_registrations 
ADD COLUMN IF NOT EXISTS verified_present BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for verification verification
CREATE INDEX IF NOT EXISTS idx_mock_registrations_verified_present 
ON public.mock_registrations(verified_present, batch_id);
