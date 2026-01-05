CREATE OR REPLACE FUNCTION public.redeem_promo_coupon(coupon_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_coupon RECORD;
  v_auth_uid UUID;
  v_user_id UUID;
  v_existing_redemption RECORD;
  v_expiry_date DATE;
BEGIN
  -- Get current auth user
  v_auth_uid := auth.uid();
  
  IF v_auth_uid IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'You must be logged in to redeem a code.');
  END IF;

  -- Get the public.users.id from auth_user_id
  SELECT id INTO v_user_id FROM users WHERE auth_user_id = v_auth_uid;

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User profile not found. Please contact support.');
  END IF;
  
  -- Check if user already has active free access
  SELECT free_practice_access, free_access_expiry_date INTO v_existing_redemption
  FROM users WHERE id = v_user_id;
  
  IF v_existing_redemption.free_practice_access = true 
     AND v_existing_redemption.free_access_expiry_date >= CURRENT_DATE THEN
    RETURN json_build_object('success', false, 'error', 'You already have active complimentary access.');
  END IF;
  
  -- Find the coupon
  SELECT * INTO v_coupon FROM promo_coupons 
  WHERE UPPER(code) = UPPER(coupon_code);
  
  IF v_coupon IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid access code. Please check and try again.');
  END IF;
  
  -- Check if coupon is active
  IF v_coupon.is_active = false THEN
    RETURN json_build_object('success', false, 'error', 'This access code is no longer active.');
  END IF;
  
  -- Check if coupon is expired
  IF v_coupon.expiry_date < CURRENT_DATE THEN
    RETURN json_build_object('success', false, 'error', 'This access code has expired.');
  END IF;
  
  -- Check usage limit
  IF v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN json_build_object('success', false, 'error', 'This access code has reached its usage limit.');
  END IF;
  
  -- Check if user already redeemed this coupon
  SELECT * INTO v_existing_redemption FROM coupon_redemptions 
  WHERE coupon_id = v_coupon.id AND user_id = v_user_id;
  
  IF v_existing_redemption IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'You have already used this access code.');
  END IF;
  
  -- Calculate expiry date (30 days from now)
  v_expiry_date := CURRENT_DATE + INTERVAL '30 days';
  
  -- Update user with free access
  UPDATE users 
  SET free_practice_access = true,
      free_access_expiry_date = v_expiry_date
  WHERE id = v_user_id;
  
  -- Increment coupon usage
  UPDATE promo_coupons 
  SET used_count = used_count + 1 
  WHERE id = v_coupon.id;
  
  -- Record the redemption
  INSERT INTO coupon_redemptions (coupon_id, user_id) 
  VALUES (v_coupon.id, v_user_id);
  
  RETURN json_build_object(
    'success', true, 
    'expiry_date', v_expiry_date,
    'message', 'Congratulations! You now have 1 month of complimentary access.'
  );
END;
$function$;