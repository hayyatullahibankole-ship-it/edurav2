-- First, create a basic/free plan if it doesn't exist
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
  365, -- 1 year renewable
  'basic',
  'Basic access for students - free tier with limited features',
  '["Basic practice tests", "Limited resources", "Community support"]'::jsonb,
  'NGN',
  true
) ON CONFLICT DO NOTHING;

-- Get plan IDs
DO $$
DECLARE
  premium_plan_id uuid;
  basic_plan_id uuid;
  target_user_id uuid;
BEGIN
  -- Get plan IDs
  SELECT id INTO premium_plan_id FROM subscription_plans WHERE name = 'Student Premium Access' LIMIT 1;
  SELECT id INTO basic_plan_id FROM subscription_plans WHERE name = 'Basic Access' LIMIT 1;
  
  -- Get the specific user ID for akeemsulekz@gmail.com
  SELECT u.id INTO target_user_id 
  FROM users u 
  WHERE u.email = 'akeemsulekz@gmail.com' 
  LIMIT 1;
  
  -- Update all existing subscriptions to basic (except for the target user)
  UPDATE subscriptions 
  SET plan_id = basic_plan_id,
      status = 'ACTIVE',
      end_date = now() + INTERVAL '1 year'
  WHERE user_id != target_user_id OR target_user_id IS NULL;
  
  -- Ensure the target user has premium access
  IF target_user_id IS NOT NULL THEN
    -- Delete any existing subscription for target user
    DELETE FROM subscriptions WHERE user_id = target_user_id;
    
    -- Create premium subscription for target user
    INSERT INTO subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      auto_renew,
      payment_reference
    ) VALUES (
      target_user_id,
      premium_plan_id,
      'ACTIVE',
      now(),
      now() + INTERVAL '100 years',
      false,
      'SPECIAL_PREMIUM_ACCESS'
    );
  END IF;
END $$;

-- Update the user setup trigger to give basic access by default
CREATE OR REPLACE FUNCTION public.setup_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  basic_plan_id uuid;
BEGIN
  -- Get the basic plan ID
  SELECT id INTO basic_plan_id 
  FROM subscription_plans 
  WHERE name = 'Basic Access' 
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
      currency
    ) VALUES (
      'Basic Access',
      0,
      365,
      'basic',
      'Basic access for students - free tier with limited features',
      '["Basic practice tests", "Limited resources", "Community support"]'::jsonb,
      'NGN'
    ) RETURNING id INTO basic_plan_id;
  END IF;
  
  -- Create a basic subscription for the new user
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew,
    payment_reference
  ) VALUES (
    NEW.id,
    basic_plan_id,
    'ACTIVE',
    now(),
    now() + INTERVAL '1 year',
    false,
    'BASIC_ACCESS'
  );
  
  RETURN NEW;
END;
$function$;