-- Create a premium plan that gives full access to students
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
  'Student Premium Access',
  0, -- Free for students
  36500, -- 100 years (essentially permanent)
  'premium',
  'Full premium access for all students - complimentary access to all features',
  '["Unlimited exam attempts", "Access to all premium resources", "Advanced analytics", "Priority support", "Offline practice mode", "Detailed performance insights", "WhatsApp support group", "Custom study plans", "Exam strategy workshops"]'::jsonb,
  'NGN',
  true
);

-- Update all existing users to have premium access
DO $$
DECLARE
  premium_plan_id uuid;
  user_record RECORD;
BEGIN
  -- Get the premium plan ID
  SELECT id INTO premium_plan_id 
  FROM subscription_plans 
  WHERE name = 'Student Premium Access' 
  LIMIT 1;
  
  -- Update all existing active subscriptions to expired (except the new premium ones)
  UPDATE subscriptions 
  SET status = 'EXPIRED' 
  WHERE status = 'ACTIVE' 
    AND plan_id != premium_plan_id;
  
  -- Create premium subscriptions for all existing users who don't have one
  FOR user_record IN 
    SELECT u.id FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM subscriptions s 
      WHERE s.user_id = u.id 
        AND s.plan_id = premium_plan_id 
        AND s.status = 'ACTIVE'
    )
  LOOP
    INSERT INTO subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      auto_renew,
      payment_reference
    ) VALUES (
      user_record.id,
      premium_plan_id,
      'ACTIVE',
      now(),
      now() + INTERVAL '100 years', -- Essentially permanent
      false,
      'STUDENT_PREMIUM_ACCESS'
    );
  END LOOP;
END $$;

-- Update the user setup trigger to give premium access by default
CREATE OR REPLACE FUNCTION public.setup_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  premium_plan_id uuid;
BEGIN
  -- Get the premium plan ID
  SELECT id INTO premium_plan_id 
  FROM subscription_plans 
  WHERE name = 'Student Premium Access' 
  LIMIT 1;
  
  -- If no premium plan exists, create one
  IF premium_plan_id IS NULL THEN
    INSERT INTO subscription_plans (
      name, 
      price, 
      duration_days, 
      resource_access_level, 
      description,
      features,
      currency
    ) VALUES (
      'Student Premium Access',
      0,
      36500, -- 100 years
      'premium',
      'Full premium access for all students - complimentary access to all features',
      '["Unlimited exam attempts", "Access to all premium resources", "Advanced analytics", "Priority support", "Offline practice mode", "Detailed performance insights", "WhatsApp support group", "Custom study plans", "Exam strategy workshops"]'::jsonb,
      'NGN'
    ) RETURNING id INTO premium_plan_id;
  END IF;
  
  -- Create a premium subscription for the new user
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
    premium_plan_id,
    'ACTIVE',
    now(),
    now() + INTERVAL '100 years',
    false,
    'STUDENT_PREMIUM_ACCESS'
  );
  
  RETURN NEW;
END;
$function$;