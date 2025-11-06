-- Fix school_subscriptions.admin_user_id foreign key constraint
-- The column currently references auth.users but should reference public.users

-- Step 1: Set all invalid admin_user_id values to NULL
-- These are IDs that don't exist in public.users table
UPDATE public.school_subscriptions
SET admin_user_id = NULL
WHERE admin_user_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = school_subscriptions.admin_user_id
);

-- Step 2: Drop the existing incorrect foreign key constraint
ALTER TABLE public.school_subscriptions 
DROP CONSTRAINT IF EXISTS school_subscriptions_admin_user_id_fkey;

-- Step 3: Add the correct foreign key constraint referencing public.users
ALTER TABLE public.school_subscriptions 
ADD CONSTRAINT school_subscriptions_admin_user_id_fkey 
FOREIGN KEY (admin_user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Step 4: Update NULL values to match the school's admin_user_id where possible
UPDATE public.school_subscriptions ss
SET admin_user_id = s.admin_user_id
FROM public.schools s
WHERE ss.school_id = s.id
AND ss.admin_user_id IS NULL
AND s.admin_user_id IS NOT NULL;