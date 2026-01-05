-- Add free access fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS free_practice_access boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS free_access_expiry_date date;

-- Create promo coupons table
CREATE TABLE public.promo_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  usage_limit INTEGER NOT NULL DEFAULT 20,
  used_count INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Create coupon redemptions table to track who redeemed what
CREATE TABLE public.coupon_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.promo_coupons(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS
ALTER TABLE public.promo_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for promo_coupons
CREATE POLICY "Anyone can view active coupons" 
ON public.promo_coupons 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage coupons" 
ON public.promo_coupons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS policies for coupon_redemptions
CREATE POLICY "Users can view their own redemptions" 
ON public.coupon_redemptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can redeem coupons" 
ON public.coupon_redemptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions" 
ON public.coupon_redemptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to redeem a coupon
CREATE OR REPLACE FUNCTION public.redeem_promo_coupon(coupon_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coupon RECORD;
  v_user_id UUID;
  v_existing_redemption RECORD;
  v_expiry_date DATE;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'You must be logged in to redeem a code.');
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
$$;