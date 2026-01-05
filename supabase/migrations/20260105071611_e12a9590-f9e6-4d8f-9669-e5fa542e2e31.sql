-- Fix for previous error: study_resources table has no is_active column.

-- Premium access helper for RLS policies
CREATE OR REPLACE FUNCTION public.has_premium_access(_auth_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Admins always have access
  IF public.is_admin(_auth_user_id) THEN
    RETURN true;
  END IF;

  -- Map auth user -> public user
  SELECT id INTO v_user_id
  FROM public.users
  WHERE auth_user_id = _auth_user_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Promo access (1 month)
  IF EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = v_user_id
      AND u.free_practice_access = true
      AND u.free_access_expiry_date IS NOT NULL
      AND u.free_access_expiry_date >= CURRENT_DATE
  ) THEN
    RETURN true;
  END IF;

  -- School subscription access
  IF EXISTS (
    SELECT 1
    FROM public.school_students stu
    JOIN public.school_subscriptions ss ON ss.school_id = stu.school_id
    WHERE stu.user_id = v_user_id
      AND stu.is_active = true
      AND ss.status = 'ACTIVE'
      AND ss.end_date > now()
  ) THEN
    RETURN true;
  END IF;

  -- Personal paid subscription access
  IF EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.subscription_plans sp ON sp.id = s.plan_id
    WHERE s.user_id = v_user_id
      AND s.status = 'ACTIVE'
      AND s.end_date > now()
      AND sp.resource_access_level::text = ANY(ARRAY['premium','enterprise'])
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Update RLS policies to respect promo access

-- resources
DROP POLICY IF EXISTS "Users can view resources based on access level" ON public.resources;
CREATE POLICY "Users can view resources based on access level"
ON public.resources
FOR SELECT
TO authenticated
USING (
  resources.is_active = true
  AND (
    resources.access_level::text = 'free'
    OR (resources.access_level::text = 'premium' AND public.has_premium_access(auth.uid()))
  )
);

-- study_lessons
DROP POLICY IF EXISTS "Admins or premium can view lessons" ON public.study_lessons;
CREATE POLICY "Admins or premium can view lessons"
ON public.study_lessons
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.users u ON u.id = ur.user_id
    WHERE u.auth_user_id = auth.uid() AND ur.role = 'admin'::app_role
  ))
  OR (study_lessons.is_active = true AND public.has_premium_access(auth.uid()))
);

-- study_resources (NO is_active column)
DROP POLICY IF EXISTS "Premium users can view resources" ON public.study_resources;
CREATE POLICY "Premium users can view resources"
ON public.study_resources
FOR SELECT
TO authenticated
USING (
  public.has_premium_access(auth.uid())
);

-- study_topics
DROP POLICY IF EXISTS "Admins or premium can view study topics" ON public.study_topics;
CREATE POLICY "Admins or premium can view study topics"
ON public.study_topics
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.users u ON u.id = ur.user_id
    WHERE u.auth_user_id = auth.uid() AND ur.role = 'admin'::app_role
  ))
  OR (study_topics.is_active = true AND public.has_premium_access(auth.uid()))
);
