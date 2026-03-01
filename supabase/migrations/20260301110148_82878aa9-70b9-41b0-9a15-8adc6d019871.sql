
-- AKBOY Mock Exam System Tables

-- Mock exam batches (admin creates batches)
CREATE TABLE public.mock_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  exam_date TIMESTAMP WITH TIME ZONE,
  exam_venue TEXT,
  is_active BOOLEAN DEFAULT true,
  results_released BOOLEAN DEFAULT false,
  results_release_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mock exam settings (admin-editable)
CREATE TABLE public.mock_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.mock_settings (key, value, description) VALUES
  ('registration_fee', '"1000"', 'Registration fee in Naira'),
  ('payment_account', '{"bank": "Access Bank", "account_number": "0123456789", "account_name": "AKBOY Creative Hub"}'::jsonb, 'Bank account for payment'),
  ('exam_duration_minutes', '120', 'Exam duration in minutes'),
  ('exam_instructions', '"Follow all exam rules. No cheating."', 'General exam instructions'),
  ('results_release_message', '"Results will be released on the announced date. Check the Result Portal."', 'Message shown after exam submission');

-- Mock registrations (individual students & school students)
CREATE TABLE public.mock_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR NOT NULL UNIQUE,
  full_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  email VARCHAR,
  mode VARCHAR NOT NULL CHECK (mode IN ('virtual', 'physical')),
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  batch_id UUID REFERENCES public.mock_batches(id),
  school_id UUID REFERENCES public.schools(id),
  school_student_id UUID REFERENCES public.school_students(id),
  user_id UUID REFERENCES public.users(id),
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'waived')),
  payment_receipt_url TEXT,
  exam_status VARCHAR DEFAULT 'registered' CHECK (exam_status IN ('registered', 'started', 'submitted')),
  exam_started_at TIMESTAMP WITH TIME ZONE,
  exam_submitted_at TIMESTAMP WITH TIME ZONE,
  attempt_id UUID REFERENCES public.attempts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mock results (computed by backend, released by admin)
CREATE TABLE public.mock_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.mock_registrations(id),
  registration_number VARCHAR NOT NULL,
  total_score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 400,
  subject_scores JSONB NOT NULL DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  is_released BOOLEAN DEFAULT false,
  batch_id UUID REFERENCES public.mock_batches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_mock_registrations_reg_number ON public.mock_registrations(registration_number);
CREATE INDEX idx_mock_registrations_school ON public.mock_registrations(school_id);
CREATE INDEX idx_mock_registrations_batch ON public.mock_registrations(batch_id);
CREATE INDEX idx_mock_results_reg_number ON public.mock_results(registration_number);
CREATE INDEX idx_mock_results_batch ON public.mock_results(batch_id);

-- Enable RLS
ALTER TABLE public.mock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mock_batches
CREATE POLICY "Anyone can view active batches" ON public.mock_batches
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage batches" ON public.mock_batches
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for mock_settings
CREATE POLICY "Anyone can view mock settings" ON public.mock_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage mock settings" ON public.mock_settings
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for mock_registrations
CREATE POLICY "Anyone can insert mock registrations" ON public.mock_registrations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own registration by user_id" ON public.mock_registrations
  FOR SELECT USING (
    user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = mock_registrations.user_id AND u.auth_user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage all mock registrations" ON public.mock_registrations
  FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "School admins can view their school registrations" ON public.mock_registrations
  FOR SELECT USING (
    school_id IS NOT NULL AND is_school_admin(auth.uid(), school_id)
  );
CREATE POLICY "School admins can insert registrations for their school" ON public.mock_registrations
  FOR INSERT WITH CHECK (
    school_id IS NOT NULL AND is_school_admin(auth.uid(), school_id)
  );

-- RLS Policies for mock_results
CREATE POLICY "Admins can manage all mock results" ON public.mock_results
  FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "School admins can view their school results" ON public.mock_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.mock_registrations mr
      WHERE mr.id = mock_results.registration_id
      AND mr.school_id IS NOT NULL
      AND is_school_admin(auth.uid(), mr.school_id)
    )
  );

-- Function to generate mock registration number
CREATE OR REPLACE FUNCTION generate_mock_reg_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reg_num TEXT;
  year_part TEXT;
  seq_num INT;
BEGIN
  year_part := to_char(now(), 'YY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 7) AS INT)), 0) + 1
  INTO seq_num
  FROM public.mock_registrations
  WHERE registration_number LIKE 'AKBM' || year_part || '%';
  
  reg_num := 'AKBM' || year_part || LPAD(seq_num::TEXT, 5, '0');
  RETURN reg_num;
END;
$$;

-- Function to check mock result by registration number (public, no auth needed)
CREATE OR REPLACE FUNCTION check_mock_result(p_registration_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_data JSONB;
  reg_record RECORD;
  res_record RECORD;
BEGIN
  -- Find registration
  SELECT * INTO reg_record FROM public.mock_registrations
  WHERE registration_number = p_registration_number;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found', 'message', 'No registration found with this number');
  END IF;
  
  -- Find result
  SELECT * INTO res_record FROM public.mock_results
  WHERE registration_id = reg_record.id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'pending', 'message', 'Your result is being processed');
  END IF;
  
  IF NOT res_record.is_released THEN
    RETURN jsonb_build_object(
      'status', 'not_released',
      'message', 'Results have not been released yet. Please check back later.'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'available',
    'full_name', reg_record.full_name,
    'registration_number', reg_record.registration_number,
    'subjects', reg_record.subjects,
    'total_score', res_record.total_score,
    'max_score', res_record.max_score,
    'subject_scores', res_record.subject_scores,
    'strengths', res_record.strengths,
    'weaknesses', res_record.weaknesses
  );
END;
$$;

-- Function to validate mock exam login
CREATE OR REPLACE FUNCTION validate_mock_exam_login(p_registration_number TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reg_record RECORD;
  batch_record RECORD;
BEGIN
  SELECT * INTO reg_record FROM public.mock_registrations
  WHERE registration_number = p_registration_number;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Registration number not found');
  END IF;
  
  IF reg_record.exam_status = 'submitted' THEN
    RETURN jsonb_build_object('valid', false, 'message', 'You have already taken this exam');
  END IF;
  
  IF reg_record.exam_status = 'started' THEN
    RETURN jsonb_build_object(
      'valid', true,
      'resume', true,
      'registration_id', reg_record.id,
      'full_name', reg_record.full_name,
      'subjects', reg_record.subjects,
      'attempt_id', reg_record.attempt_id,
      'mode', reg_record.mode
    );
  END IF;
  
  -- Check batch if exists
  IF reg_record.batch_id IS NOT NULL THEN
    SELECT * INTO batch_record FROM public.mock_batches WHERE id = reg_record.batch_id;
    IF FOUND AND NOT batch_record.is_active THEN
      RETURN jsonb_build_object('valid', false, 'message', 'This exam batch is not active');
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'resume', false,
    'registration_id', reg_record.id,
    'full_name', reg_record.full_name,
    'subjects', reg_record.subjects,
    'mode', reg_record.mode,
    'batch_id', reg_record.batch_id
  );
END;
$$;
