-- Add INSERT policy for school admins to create subscriptions
CREATE POLICY "School admins can create own school subscription"
  ON public.school_subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE s.id = school_subscriptions.school_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- Add UPDATE policy for school admins to manage their subscription
CREATE POLICY "School admins can update own school subscription"
  ON public.school_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE s.id = school_subscriptions.school_id
      AND u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schools s
      JOIN public.users u ON s.admin_user_id = u.id
      WHERE s.id = school_subscriptions.school_id
      AND u.auth_user_id = auth.uid()
    )
  );

-- Make plan_id nullable for pending subscriptions
ALTER TABLE public.school_subscriptions ALTER COLUMN plan_id DROP NOT NULL;

-- Add columns for pricing information
ALTER TABLE public.school_subscriptions 
  ADD COLUMN IF NOT EXISTS price_per_student INTEGER,
  ADD COLUMN IF NOT EXISTS total_amount INTEGER,
  ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES auth.users(id);