-- Fix verified user status update in admin dashboard
-- Problem: Manual admin verification wasn't persisting in public.users table
-- Solution: Ensure reliable sync between auth.users.email_confirmed_at and public.users.is_verified

-- Drop and recreate the sync_user_verification trigger with better error handling
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.sync_user_verification();

-- Create improved version that explicitly handles verification
CREATE OR REPLACE FUNCTION public.sync_user_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Update verification status when email is confirmed
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users 
    SET is_verified = true, updated_at = now()
    WHERE auth_user_id = NEW.id;
    
    -- Log this sync for debugging
    RAISE NOTICE 'Synced verification for auth_user_id: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors but don't fail the trigger
  RAISE LOG 'Error in sync_user_verification for auth_user_id %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_verification();

-- Add 'admin_verified_at' column to track manual admin verifications
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS admin_verified_at timestamptz;

-- Add index to improve query performance for verification status
CREATE INDEX IF NOT EXISTS idx_users_is_verified 
  ON public.users(is_verified) 
  WHERE is_verified = true;

-- Verify all users who have confirmed emails are marked as verified
UPDATE public.users 
SET is_verified = true, updated_at = now()
WHERE auth_user_id IN (
  SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL
) AND is_verified = false;

-- Ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify that admin read/write policies exist (these should already exist from earlier migrations)
-- This is added here for reference and safety
DO $$
BEGIN
  -- Check if the policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can view all users'
  ) THEN
    CREATE POLICY "Admins can view all users"
      ON public.users FOR SELECT
      USING (public.is_admin(auth.uid()));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Admins can update all users'
  ) THEN
    CREATE POLICY "Admins can update all users"
      ON public.users FOR UPDATE
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;

