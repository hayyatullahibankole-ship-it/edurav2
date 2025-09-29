-- Fix user profile creation issue and ensure subscription setup works properly

-- First, create missing user profiles for existing authenticated users
-- This will help users who are stuck in loading state
INSERT INTO public.users (
  auth_user_id,
  email,
  first_name,
  last_name,
  phone,
  created_at,
  updated_at
) 
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'phone', ''),
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.users pu ON pu.auth_user_id = au.id
WHERE pu.id IS NULL
  AND au.deleted_at IS NULL;

-- Ensure all users have proper roles
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT u.id, 'student'::app_role, now()
FROM public.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.id IS NULL;

-- Create or update the trigger function to ensure user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert user profile with all available metadata
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name,
    phone,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.created_at,
    now()
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role, assigned_at)
  SELECT u.id, 'student'::app_role, now()
  FROM public.users u
  WHERE u.auth_user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger to ensure it's working
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create an improved subscription setup function that handles edge cases
CREATE OR REPLACE FUNCTION public.setup_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  basic_plan_id uuid;
BEGIN
  -- Get the basic plan ID (free tier)
  SELECT id INTO basic_plan_id 
  FROM subscription_plans 
  WHERE resource_access_level = 'basic' 
    AND price = 0
    AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- If no basic plan exists, create one
  IF basic_plan_id IS NULL THEN
    INSERT INTO subscription_plans (
      name, 
      price, 
      duration_days, 
      resource_access_level, 
      description,
      features,
      currency,
      is_active
    ) VALUES (
      'Basic Access',
      0,
      365,
      'basic',
      'Free access for students with limited features',
      '["Basic practice tests", "Limited resources", "Community support"]'::jsonb,
      'NGN',
      true
    ) RETURNING id INTO basic_plan_id;
  END IF;
  
  -- Create a basic subscription for the new user (avoid duplicates)
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew,
    payment_reference,
    created_at,
    updated_at
  ) 
  SELECT 
    NEW.id,
    basic_plan_id,
    'ACTIVE'::subscription_status,
    now(),
    now() + INTERVAL '1 year',
    false,
    'BASIC_ACCESS_' || NEW.id::text,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = NEW.id AND status = 'ACTIVE'
  );
  
  RETURN NEW;
END;
$$;

-- Ensure the subscription setup trigger exists
DROP TRIGGER IF EXISTS trigger_setup_user_subscription ON users;
CREATE TRIGGER trigger_setup_user_subscription
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION public.setup_user_subscription();

-- Fix any existing users who don't have subscriptions
INSERT INTO subscriptions (
  user_id,
  plan_id,
  status,
  start_date,
  end_date,
  auto_renew,
  payment_reference,
  created_at,
  updated_at
)
SELECT 
  u.id,
  (SELECT id FROM subscription_plans WHERE resource_access_level = 'basic' AND price = 0 AND is_active = true LIMIT 1),
  'ACTIVE'::subscription_status,
  now(),
  now() + INTERVAL '1 year',
  false,
  'BASIC_ACCESS_' || u.id::text,
  now(),
  now()
FROM public.users u
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'ACTIVE'
WHERE s.id IS NULL;