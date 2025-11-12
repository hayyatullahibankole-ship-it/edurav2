-- Create team_applications table
CREATE TABLE public.team_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  preferred_role TEXT NOT NULL CHECK (preferred_role IN ('Marketing & Promotions Lead', 'Content Creator / Designer', 'School Relations Officer', 'Technical & Support Officer')),
  skills_experience TEXT NOT NULL,
  availability TEXT[] NOT NULL,
  why_join TEXT NOT NULL,
  terms_agreed BOOLEAN NOT NULL DEFAULT false,
  optional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit applications (no auth required)
CREATE POLICY "Anyone can submit team applications" 
ON public.team_applications 
FOR INSERT 
WITH CHECK (true);

-- Authenticated users with admin role can view all applications
CREATE POLICY "Authenticated users can view team applications" 
ON public.team_applications 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Authenticated users can update applications
CREATE POLICY "Authenticated users can update team applications" 
ON public.team_applications 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_applications_updated_at
BEFORE UPDATE ON public.team_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_team_applications_status ON public.team_applications(status);
CREATE INDEX idx_team_applications_created_at ON public.team_applications(created_at DESC);