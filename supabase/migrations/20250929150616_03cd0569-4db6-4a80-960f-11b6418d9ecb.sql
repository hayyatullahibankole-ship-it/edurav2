-- Fix RLS causing profile not visible and subscription showing as free

-- First let's see what policies exist
-- DROP existing policies that prevent profile access and add simpler ones

-- Drop the problematic users policy
DROP POLICY IF EXISTS "Users can view own profile with PII logging" ON public.users;

-- Create a simple policy for users to view their own profile
CREATE POLICY "Users can view own profile simple" 
ON public.users
FOR SELECT
USING (auth_user_id = auth.uid());