-- Video Lessons Support
ALTER TABLE public.study_lessons 
ADD COLUMN video_url TEXT,
ADD COLUMN video_platform VARCHAR(50) DEFAULT 'youtube',
ADD COLUMN video_duration_minutes INTEGER;

CREATE INDEX idx_study_lessons_video ON public.study_lessons(video_url) WHERE video_url IS NOT NULL;

-- Video Progress Tracking
CREATE TABLE public.video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.study_lessons(id) ON DELETE CASCADE,
  watched_duration_seconds INTEGER DEFAULT 0,
  total_duration_seconds INTEGER NOT NULL,
  completed_percentage NUMERIC DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video progress"
  ON public.video_progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = video_progress.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own video progress"
  ON public.video_progress FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = video_progress.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Study Planner/Calendar
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id),
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  reminder_sent BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study sessions"
  ON public.study_sessions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = study_sessions.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE INDEX idx_study_sessions_user_date ON public.study_sessions(user_id, session_date);

-- Study Goals
CREATE TABLE public.study_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study goals"
  ON public.study_goals FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = study_goals.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Referral Program
CREATE TABLE public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = referral_codes.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view active codes for signup"
  ON public.referral_codes FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE INDEX idx_referral_codes_code ON public.referral_codes(code) WHERE is_active = TRUE;

-- Referrals Tracking
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  reward_points INTEGER DEFAULT 0,
  reward_days INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE (users.id = referrals.referrer_id OR users.id = referrals.referred_user_id)
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "System can manage referrals"
  ON public.referrals FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_user_id);

-- Referral Rewards
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE SET NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_value INTEGER NOT NULL,
  description TEXT,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = referral_rewards.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
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
    -- Generate 8-character alphanumeric code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to create referral code for new users
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (NEW.id, generate_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_referral_code
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_referral_code();

-- Alternative Payment Methods
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment methods"
  ON public.payment_methods FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods FOR ALL
  USING (is_admin(auth.uid()));

-- Insert default payment methods
INSERT INTO public.payment_methods (name, code, description, sort_order) VALUES
('Paystack (Card)', 'paystack_card', 'Pay with your debit/credit card via Paystack', 1),
('Bank Transfer', 'bank_transfer', 'Transfer directly to our bank account', 2),
('USSD', 'ussd', 'Pay using your bank USSD code', 3),
('Wallet Balance', 'wallet', 'Pay using your Edura wallet balance', 4);

-- Wallet System
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance NUMERIC DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'NGN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.user_wallets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = user_wallets.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Wallet Transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  amount NUMERIC NOT NULL,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  reference TEXT UNIQUE,
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions"
  ON public.wallet_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_wallets w
    JOIN public.users u ON w.user_id = u.id
    WHERE w.id = wallet_transactions.wallet_id 
    AND u.auth_user_id = auth.uid()
  ));

CREATE INDEX idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id, created_at DESC);