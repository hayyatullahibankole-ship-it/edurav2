-- Add missing fields to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS students_added INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Generate school codes for existing schools without one
UPDATE public.schools 
SET school_code = 'SCH' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
WHERE school_code IS NULL;

-- Drop and recreate RLS policies for schools
DROP POLICY IF EXISTS "School admins can view their own school" ON public.schools;
CREATE POLICY "School admins can view their own school"
ON public.schools FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = schools.admin_user_id
    AND u.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "School admins can update their own school" ON public.schools;
CREATE POLICY "School admins can update their own school"
ON public.schools FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = schools.admin_user_id
    AND u.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can view all schools" ON public.schools;
CREATE POLICY "Admins can view all schools"
ON public.schools FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can manage all schools" ON public.schools;
CREATE POLICY "Admins can manage all schools"
ON public.schools FOR ALL
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Drop and recreate RLS policies for school_subscriptions
DROP POLICY IF EXISTS "School admins can view their school subscriptions" ON public.school_subscriptions;
CREATE POLICY "School admins can view their school subscriptions"
ON public.school_subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.auth_user_id = auth.uid()
    AND (
      u.id = school_subscriptions.admin_user_id
      OR EXISTS (
        SELECT 1 FROM public.schools s
        WHERE s.id = school_subscriptions.school_id
        AND s.admin_user_id = u.id
      )
    )
  )
);

DROP POLICY IF EXISTS "Admins can view all school subscriptions" ON public.school_subscriptions;
CREATE POLICY "Admins can view all school subscriptions"
ON public.school_subscriptions FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
);