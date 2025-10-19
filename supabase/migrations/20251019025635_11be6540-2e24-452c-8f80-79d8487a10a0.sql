-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to create referral code for new user
CREATE OR REPLACE FUNCTION create_referral_code_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Generate unique code
  new_code := generate_unique_referral_code();
  
  -- Insert referral code
  INSERT INTO public.referral_codes (user_id, code, is_active)
  VALUES (NEW.id, new_code, true);
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create referral codes
DROP TRIGGER IF EXISTS on_user_created_generate_referral_code ON public.users;
CREATE TRIGGER on_user_created_generate_referral_code
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_code_for_user();

-- Function to process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(
  new_user_id UUID,
  referral_code_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
  referral_code_id UUID;
  new_referral_id UUID;
BEGIN
  -- Find the referrer by code
  SELECT user_id, id INTO referrer_user_id, referral_code_id
  FROM public.referral_codes
  WHERE code = referral_code_param
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses = 0 OR uses_count < max_uses);
  
  -- If no valid referral code found, return false
  IF referrer_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Don't allow self-referral
  IF referrer_user_id = new_user_id THEN
    RETURN false;
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (
    referrer_id,
    referred_user_id,
    referral_code,
    status,
    reward_points
  ) VALUES (
    referrer_user_id,
    new_user_id,
    referral_code_param,
    'pending',
    0
  )
  RETURNING id INTO new_referral_id;
  
  -- Update referral code usage count
  UPDATE public.referral_codes
  SET uses_count = uses_count + 1
  WHERE id = referral_code_id;
  
  -- Create signup reward for referrer (50 points)
  INSERT INTO public.referral_rewards (
    user_id,
    referral_id,
    reward_type,
    reward_value,
    description,
    claimed
  ) VALUES (
    referrer_user_id,
    new_referral_id,
    'signup_bonus',
    50,
    'Friend signed up using your referral code',
    false
  );
  
  -- Create welcome reward for new user (25 points)
  INSERT INTO public.referral_rewards (
    user_id,
    referral_id,
    reward_type,
    reward_value,
    description,
    claimed
  ) VALUES (
    new_user_id,
    new_referral_id,
    'welcome_bonus',
    25,
    'Welcome bonus for joining with a referral code',
    false
  );
  
  RETURN true;
END;
$$;

-- Function to activate referral when referred user subscribes
CREATE OR REPLACE FUNCTION activate_referral_on_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  subscription_reward_id UUID;
BEGIN
  -- Only process active subscriptions
  IF NEW.status != 'ACTIVE' THEN
    RETURN NEW;
  END IF;
  
  -- Find pending referral for this user
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE referred_user_id = NEW.user_id
    AND status = 'pending'
  LIMIT 1;
  
  IF referral_record.id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Update referral status to active
  UPDATE public.referrals
  SET status = 'active',
      converted_at = now(),
      reward_points = 100,
      reward_days = 7
  WHERE id = referral_record.id;
  
  -- Add premium conversion reward for referrer (100 points + 7 days)
  INSERT INTO public.referral_rewards (
    user_id,
    referral_id,
    reward_type,
    reward_value,
    description,
    claimed
  ) VALUES (
    referral_record.referrer_id,
    referral_record.id,
    'subscription_bonus',
    100,
    'Friend subscribed! Earned premium bonus',
    false
  );
  
  -- Mark signup bonus as claimable
  UPDATE public.referral_rewards
  SET claimed = true
  WHERE referral_id = referral_record.id
    AND user_id = referral_record.referrer_id
    AND reward_type = 'signup_bonus';
  
  -- Mark welcome bonus as claimable for referred user
  UPDATE public.referral_rewards
  SET claimed = true
  WHERE referral_id = referral_record.id
    AND user_id = referral_record.referred_user_id
    AND reward_type = 'welcome_bonus';
  
  RETURN NEW;
END;
$$;

-- Trigger to activate referrals on subscription
DROP TRIGGER IF EXISTS on_subscription_activate_referral ON public.subscriptions;
CREATE TRIGGER on_subscription_activate_referral
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION activate_referral_on_subscription();

-- Backfill: Generate referral codes for existing users without codes
INSERT INTO public.referral_codes (user_id, code, is_active)
SELECT 
  u.id,
  generate_unique_referral_code(),
  true
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.referral_codes rc WHERE rc.user_id = u.id
);