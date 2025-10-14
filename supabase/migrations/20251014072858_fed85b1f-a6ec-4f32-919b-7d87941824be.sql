-- =========================================
-- PART 1: Performance Optimization for Results Portal
-- =========================================

-- Add indexes to speed up results queries
CREATE INDEX IF NOT EXISTS idx_results_attempt_id ON public.results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_status ON public.attempts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_submitted_at ON public.attempts(submitted_at) WHERE status = 'SUBMITTED';
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON public.attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_correctness ON public.attempt_answers(attempt_id, is_correct) WHERE is_correct IS NOT NULL;

-- =========================================
-- PART 2: School Subscription System
-- =========================================

-- Create school/organization table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  logo_url TEXT,
  website TEXT,
  registration_number VARCHAR(100),
  description TEXT,
  admin_user_id UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT schools_slug_check CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Link users to schools (students)
CREATE TABLE IF NOT EXISTS public.school_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  student_id VARCHAR(50),
  class_level VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, user_id)
);

-- School staff/teachers
CREATE TABLE IF NOT EXISTS public.school_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(50) DEFAULT 'teacher',
  permissions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, user_id)
);

-- School subscriptions (separate from individual subscriptions)
CREATE TABLE IF NOT EXISTS public.school_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status subscription_status DEFAULT 'TRIAL',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  payment_reference TEXT,
  student_seats INTEGER DEFAULT 100,
  used_seats INTEGER DEFAULT 0,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS Policies for Schools
-- =========================================

-- Schools: Admins can manage all, school admins can manage own school
CREATE POLICY "Admins can manage all schools"
  ON public.schools FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "School admins can view own school"
  ON public.schools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = schools.admin_user_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "School admins can update own school"
  ON public.schools FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = schools.admin_user_id 
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active schools for registration"
  ON public.schools FOR SELECT
  USING (is_active = true);

-- School Students Policies
CREATE POLICY "Admins can manage all school students"
  ON public.school_students FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "School admins can manage their students"
  ON public.school_students FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE s.id = school_students.school_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own school enrollment"
  ON public.school_students FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = school_students.user_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- School Staff Policies
CREATE POLICY "Admins can manage all school staff"
  ON public.school_staff FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "School admins can manage their staff"
  ON public.school_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE s.id = school_staff.school_id
      AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view own school association"
  ON public.school_staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = school_staff.user_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- School Subscriptions Policies
CREATE POLICY "Admins can manage all school subscriptions"
  ON public.school_subscriptions FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "School admins can view own school subscription"
  ON public.school_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE s.id = school_subscriptions.school_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- =========================================
-- Helper Functions for School Management
-- =========================================

-- Function to check if user is school admin
CREATE OR REPLACE FUNCTION public.is_school_admin(user_auth_id UUID, target_school_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.schools s
    JOIN public.users u ON s.admin_user_id = u.id
    WHERE s.id = target_school_id
    AND u.auth_user_id = user_auth_id
  );
$$;

-- Function to get school subscription status
CREATE OR REPLACE FUNCTION public.get_school_subscription_status(target_school_id UUID)
RETURNS TABLE(
  is_active BOOLEAN,
  plan_name VARCHAR,
  student_seats INTEGER,
  used_seats INTEGER,
  end_date TIMESTAMPTZ
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (ss.status = 'ACTIVE' AND ss.end_date > NOW()) as is_active,
    sp.name as plan_name,
    ss.student_seats,
    ss.used_seats,
    ss.end_date
  FROM public.school_subscriptions ss
  JOIN public.subscription_plans sp ON ss.plan_id = sp.id
  WHERE ss.school_id = target_school_id
  AND ss.status = 'ACTIVE'
  ORDER BY ss.created_at DESC
  LIMIT 1;
$$;

-- Function to add student to school
CREATE OR REPLACE FUNCTION public.add_student_to_school(
  p_school_id UUID,
  p_user_email VARCHAR,
  p_student_id VARCHAR DEFAULT NULL,
  p_class_level VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_school_student_id UUID;
  v_subscription_active BOOLEAN;
  v_seats_available INTEGER;
BEGIN
  -- Check if requester is school admin or global admin
  IF NOT (is_school_admin(auth.uid(), p_school_id) OR is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized to add students to this school';
  END IF;

  -- Check school subscription
  SELECT 
    (status = 'ACTIVE' AND end_date > NOW()),
    (student_seats - used_seats)
  INTO v_subscription_active, v_seats_available
  FROM public.school_subscriptions
  WHERE school_id = p_school_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT v_subscription_active THEN
    RAISE EXCEPTION 'School subscription is not active';
  END IF;

  IF v_seats_available <= 0 THEN
    RAISE EXCEPTION 'No available student seats. Please upgrade your subscription.';
  END IF;

  -- Get or create user
  SELECT id INTO v_user_id
  FROM public.users
  WHERE email = p_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_user_email;
  END IF;

  -- Add student to school
  INSERT INTO public.school_students (
    school_id,
    user_id,
    student_id,
    class_level
  ) VALUES (
    p_school_id,
    v_user_id,
    p_student_id,
    p_class_level
  )
  ON CONFLICT (school_id, user_id) 
  DO UPDATE SET 
    is_active = true,
    student_id = COALESCE(EXCLUDED.student_id, school_students.student_id),
    class_level = COALESCE(EXCLUDED.class_level, school_students.class_level)
  RETURNING id INTO v_school_student_id;

  -- Update used seats
  UPDATE public.school_subscriptions
  SET used_seats = (
    SELECT COUNT(*) 
    FROM public.school_students 
    WHERE school_id = p_school_id AND is_active = true
  )
  WHERE school_id = p_school_id;

  RETURN v_school_student_id;
END;
$$;

-- Trigger to update school updated_at
CREATE OR REPLACE FUNCTION public.update_school_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_school_timestamp();

CREATE TRIGGER school_subscriptions_updated_at
  BEFORE UPDATE ON public.school_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_school_timestamp();

-- Log school creation
CREATE OR REPLACE FUNCTION public.log_school_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM log_security_event(
    'SCHOOL_CREATED',
    'schools',
    NEW.id,
    jsonb_build_object(
      'school_name', NEW.name,
      'admin_user_id', NEW.admin_user_id
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_school_created
  AFTER INSERT ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.log_school_creation();