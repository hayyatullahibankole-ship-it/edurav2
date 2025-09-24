-- Ensure all new users get a default free subscription
-- First, let's create a trigger to automatically create a free subscription for new users

-- Create a function to handle new user subscription setup
CREATE OR REPLACE FUNCTION public.setup_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the free plan ID (create one if it doesn't exist)
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE resource_access_level = 'basic' AND price = 0 
  LIMIT 1;
  
  -- If no free plan exists, create one
  IF free_plan_id IS NULL THEN
    INSERT INTO subscription_plans (
      name, 
      price, 
      duration_days, 
      resource_access_level, 
      description,
      features
    ) VALUES (
      'Free Plan',
      0,
      365, -- 1 year validity for free plan
      'basic',
      'Basic access to free resources and limited exam attempts',
      '["Access to free resources", "Basic exam attempts", "Standard support"]'::jsonb
    ) RETURNING id INTO free_plan_id;
  END IF;
  
  -- Create a free subscription for the new user
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew
  ) VALUES (
    NEW.id,
    free_plan_id,
    'ACTIVE',
    now(),
    now() + INTERVAL '365 days',
    false
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to setup subscription for new users
DROP TRIGGER IF EXISTS setup_user_subscription_trigger ON public.users;
CREATE TRIGGER setup_user_subscription_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_user_subscription();

-- Update existing subscription plans to have 3-month duration for premium plans
UPDATE subscription_plans 
SET duration_days = 90
WHERE resource_access_level != 'basic' AND price > 0;

-- Create a function to automatically expire subscriptions
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_subscription RECORD;
  free_plan_id uuid;
BEGIN
  -- Get free plan ID
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE resource_access_level = 'basic' AND price = 0 
  LIMIT 1;
  
  -- Update expired premium subscriptions to expired status
  UPDATE subscriptions 
  SET status = 'EXPIRED'
  WHERE status = 'ACTIVE' 
    AND end_date < now()
    AND plan_id != free_plan_id;
    
  -- For each expired premium subscription, create a new free subscription
  FOR expired_subscription IN 
    SELECT DISTINCT user_id 
    FROM subscriptions 
    WHERE status = 'EXPIRED' 
      AND plan_id != free_plan_id
      AND user_id NOT IN (
        SELECT user_id 
        FROM subscriptions 
        WHERE status = 'ACTIVE' AND plan_id = free_plan_id
      )
  LOOP
    INSERT INTO subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      auto_renew
    ) VALUES (
      expired_subscription.user_id,
      free_plan_id,
      'ACTIVE',
      now(),
      now() + INTERVAL '365 days',
      false
    );
  END LOOP;
END;
$$;

-- Insert default free plan if it doesn't exist
INSERT INTO subscription_plans (
  name, 
  price, 
  duration_days, 
  resource_access_level, 
  description,
  features,
  currency
) 
SELECT 
  'Free Plan',
  0,
  365,
  'basic',
  'Basic access to free resources and limited exam attempts',
  '["Access to free resources", "Basic exam attempts", "Standard support"]'::jsonb,
  'NGN'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans 
  WHERE resource_access_level = 'basic' AND price = 0
);

-- Create sample premium plans if they don't exist
INSERT INTO subscription_plans (
  name, 
  price, 
  duration_days, 
  resource_access_level, 
  description,
  features,
  currency
) 
SELECT 
  'Premium Plan',
  5000,
  90, -- 3 months
  'premium',
  'Premium access to all resources and unlimited exam attempts',
  '["Access to all resources", "Unlimited exam attempts", "Priority support", "Advanced analytics"]'::jsonb,
  'NGN'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans 
  WHERE name = 'Premium Plan'
);

-- Ensure all existing users have a subscription (free by default)
DO $$
DECLARE
  user_record RECORD;
  free_plan_id uuid;
BEGIN
  -- Get free plan ID
  SELECT id INTO free_plan_id 
  FROM subscription_plans 
  WHERE resource_access_level = 'basic' AND price = 0 
  LIMIT 1;
  
  -- Create free subscriptions for users who don't have any active subscription
  FOR user_record IN 
    SELECT id FROM users 
    WHERE id NOT IN (
      SELECT user_id FROM subscriptions WHERE status = 'ACTIVE'
    )
  LOOP
    INSERT INTO subscriptions (
      user_id,
      plan_id,
      status,
      start_date,
      end_date,
      auto_renew
    ) VALUES (
      user_record.id,
      free_plan_id,
      'ACTIVE',
      now(),
      now() + INTERVAL '365 days',
      false
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;