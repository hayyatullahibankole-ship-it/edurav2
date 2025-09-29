-- Fix missing details column in rate_limits table and user preferences constraint issues

-- First, let's add the missing details column to rate_limits if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rate_limits' AND column_name = 'details') THEN
        ALTER TABLE public.rate_limits ADD COLUMN details jsonb DEFAULT '{}';
    END IF;
END $$;

-- Fix the create_user_preferences function to handle duplicates
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if preferences don't already exist
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert user profile
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name,
    phone,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    is_verified = EXCLUDED.is_verified
  RETURNING id INTO new_user_id;
  
  -- Get the user ID if it was an update
  IF new_user_id IS NULL THEN
    SELECT id INTO new_user_id FROM public.users WHERE auth_user_id = NEW.id;
  END IF;
  
  -- Create default user preferences only if they don't exist
  INSERT INTO public.user_preferences (user_id)
  VALUES (new_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;