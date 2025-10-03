-- Critical Security Fix #1: Deny public access to users table
CREATE POLICY "Deny public access to users"
ON public.users
FOR ALL
TO anon
USING (false);

-- Critical Security Fix #2: Drop and recreate admin_proctoring_data as a secure function
DROP VIEW IF EXISTS public.admin_proctoring_data;

CREATE OR REPLACE FUNCTION public.get_admin_proctoring_data()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email character varying,
  first_name character varying,
  last_name character varying,
  exam_id uuid,
  status attempt_status,
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  device_fingerprint text,
  ip_address inet,
  user_agent text,
  suspicious_activity_count integer,
  proctoring_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can access this data
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    u.email,
    u.first_name,
    u.last_name,
    a.exam_id,
    a.status,
    a.started_at,
    a.submitted_at,
    a.device_fingerprint,
    a.ip_address,
    a.user_agent,
    a.suspicious_activity_count,
    a.proctoring_data
  FROM attempts a
  JOIN users u ON u.id = a.user_id;
END;
$$;

-- Critical Security Fix #3: Drop and recreate student_exam_progress as a secure function
DROP VIEW IF EXISTS public.student_exam_progress;

CREATE OR REPLACE FUNCTION public.get_student_exam_progress()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  exam_id uuid,
  status attempt_status,
  selected_subjects jsonb,
  started_at timestamp with time zone,
  submitted_at timestamp with time zone,
  time_remaining_seconds integer,
  created_at timestamp with time zone,
  security_score integer,
  proctoring_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Students can only see their own data, admins can see all
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.exam_id,
    a.status,
    a.selected_subjects,
    a.started_at,
    a.submitted_at,
    a.time_remaining_seconds,
    a.created_at,
    CASE 
      WHEN is_admin(auth.uid()) THEN a.suspicious_activity_count
      WHEN a.suspicious_activity_count > 5 THEN 1  -- High risk
      WHEN a.suspicious_activity_count > 2 THEN 2  -- Medium risk  
      ELSE 3  -- Low risk
    END as security_score,
    CASE
      WHEN is_admin(auth.uid()) THEN a.proctoring_data
      ELSE a.proctoring_data - 'device_fingerprint' - 'ip_address' - 'user_agent'
    END as proctoring_data
  FROM attempts a
  JOIN users u ON u.id = a.user_id
  WHERE u.auth_user_id = auth.uid() OR is_admin(auth.uid());
END;
$$;

-- Critical Security Fix #4: Drop and recreate student_bookings as a secure function
DROP VIEW IF EXISTS public.student_bookings;

CREATE OR REPLACE FUNCTION public.get_student_bookings()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  tutor_id uuid,
  subject_id uuid,
  start_time timestamp with time zone,
  duration_minutes integer,
  status booking_status,
  is_paid boolean,
  price numeric,
  created_at timestamp with time zone,
  meeting_link text,
  title character varying,
  description text,
  notes text,
  payment_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.user_id,
    b.tutor_id,
    b.subject_id,
    b.start_time,
    b.duration_minutes,
    b.status,
    b.is_paid,
    b.price,
    b.created_at,
    b.meeting_link,
    b.title,
    b.description,
    b.notes,
    CASE 
      WHEN is_admin(auth.uid()) THEN b.payment_reference
      WHEN b.is_paid THEN 'PAID-****' || RIGHT(COALESCE(b.payment_reference, '0000'), 4)
      ELSE b.status::text
    END as payment_status
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  WHERE u.auth_user_id = auth.uid() 
    OR is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM users tu 
      WHERE tu.id = b.tutor_id AND tu.auth_user_id = auth.uid()
    );
END;
$$;

-- Critical Security Fix #5: Restrict transaction inserts to service role only
DROP POLICY IF EXISTS "System can create transactions" ON public.transactions;

CREATE POLICY "Only service role can create transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
  current_setting('role', true) = 'service_role'
  OR 
  ((current_setting('request.jwt.claims', true))::jsonb ->> 'role') = 'service_role'
);

-- Log security fixes applied
SELECT log_security_event(
  'CRITICAL_SECURITY_FIXES_APPLIED',
  'security',
  NULL,
  jsonb_build_object(
    'fixes', ARRAY[
      'users_table_public_access_denied',
      'admin_proctoring_data_secured_as_function',
      'student_exam_progress_secured_as_function',
      'student_bookings_secured_as_function',
      'transaction_inserts_restricted_to_service_role'
    ],
    'timestamp', now()
  )
);