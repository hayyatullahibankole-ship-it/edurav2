-- Fix the get_user_effective_subscription function to handle type casting properly
CREATE OR REPLACE FUNCTION public.get_user_effective_subscription(target_user_id uuid)
RETURNS TABLE(
  id uuid, 
  status text, 
  plan_id uuid, 
  start_date timestamp with time zone, 
  end_date timestamp with time zone, 
  resource_access_level text, 
  plan_name text, 
  price numeric, 
  source text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  school_sub record;
  personal_sub record;
BEGIN
  -- First check if user is a school student with an active school subscription
  SELECT 
    ss.id,
    ss.status::text,
    ss.plan_id,
    ss.start_date,
    ss.end_date,
    'premium'::text as resource_access_level,
    'School Premium Access'::text as plan_name,
    0::numeric as price,
    'school'::text as source
  INTO school_sub
  FROM public.school_students stu
  JOIN public.schools sch ON sch.id = stu.school_id
  JOIN public.school_subscriptions ss ON ss.school_id = sch.id
  WHERE stu.user_id = target_user_id
    AND stu.is_active = true
    AND ss.status = 'ACTIVE'
    AND ss.end_date > now()
  ORDER BY ss.end_date DESC
  LIMIT 1;

  -- If school subscription found and active, return it
  IF school_sub.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      school_sub.id,
      school_sub.status,
      school_sub.plan_id,
      school_sub.start_date,
      school_sub.end_date,
      school_sub.resource_access_level,
      school_sub.plan_name,
      school_sub.price,
      school_sub.source;
    RETURN;
  END IF;

  -- Otherwise, check for personal subscription - prioritize highest access level and price
  SELECT 
    s.id,
    s.status::text,
    s.plan_id,
    s.start_date,
    s.end_date,
    sp.resource_access_level::text,
    sp.name::text as plan_name,
    sp.price,
    'personal'::text as source
  INTO personal_sub
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = target_user_id
    AND s.status = 'ACTIVE'
    AND s.end_date > now()
  ORDER BY 
    CASE sp.resource_access_level::text
      WHEN 'enterprise' THEN 3
      WHEN 'premium' THEN 2
      ELSE 1
    END DESC,
    sp.price DESC,
    s.end_date DESC
  LIMIT 1;

  -- Return personal subscription or nothing
  IF personal_sub.id IS NOT NULL THEN
    RETURN QUERY SELECT 
      personal_sub.id,
      personal_sub.status,
      personal_sub.plan_id,
      personal_sub.start_date,
      personal_sub.end_date,
      personal_sub.resource_access_level,
      personal_sub.plan_name,
      personal_sub.price,
      personal_sub.source;
  END IF;

  RETURN;
END;
$$;