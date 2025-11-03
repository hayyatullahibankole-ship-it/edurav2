-- Create a function to get effective subscription for a user (considering school membership)
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
SET search_path = public
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
    'premium' as resource_access_level,
    'School Premium Access' as plan_name,
    0 as price,
    'school' as source
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

  -- Otherwise, check for personal subscription
  SELECT 
    s.id,
    s.status::text,
    s.plan_id,
    s.start_date,
    s.end_date,
    sp.resource_access_level,
    sp.name as plan_name,
    sp.price,
    'personal' as source
  INTO personal_sub
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = target_user_id
    AND s.status = 'ACTIVE'
    AND s.end_date > now()
  ORDER BY 
    CASE sp.resource_access_level
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

-- Create a trigger to automatically manage student subscriptions when school subscription changes
CREATE OR REPLACE FUNCTION public.sync_school_student_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a school subscription becomes active or is created
  IF NEW.status = 'ACTIVE' AND NEW.end_date > now() THEN
    -- Log that students now have access through school
    INSERT INTO audit_logs (
      action_type,
      actor_user_id,
      target_type,
      details
    ) VALUES (
      'SCHOOL_SUBSCRIPTION_ACTIVATED',
      NEW.admin_user_id,
      'school_subscription',
      jsonb_build_object(
        'school_id', NEW.school_id,
        'subscription_id', NEW.id,
        'student_seats', NEW.student_seats,
        'end_date', NEW.end_date
      )
    );
  END IF;

  -- When a school subscription expires or is cancelled
  IF (OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE') 
     OR (OLD.end_date > now() AND NEW.end_date <= now()) THEN
    -- Log that students lost access
    INSERT INTO audit_logs (
      action_type,
      actor_user_id,
      target_type,
      details
    ) VALUES (
      'SCHOOL_SUBSCRIPTION_EXPIRED',
      NEW.admin_user_id,
      'school_subscription',
      jsonb_build_object(
        'school_id', NEW.school_id,
        'subscription_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on school_subscriptions
DROP TRIGGER IF EXISTS sync_student_access_on_school_sub_change ON public.school_subscriptions;
CREATE TRIGGER sync_student_access_on_school_sub_change
  AFTER INSERT OR UPDATE ON public.school_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_school_student_access();

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_effective_subscription(uuid) TO authenticated;