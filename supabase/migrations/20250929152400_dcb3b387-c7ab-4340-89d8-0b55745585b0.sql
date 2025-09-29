-- Create or replace function to handle new user creation with proper verification status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
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
  );
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (
    (SELECT id FROM public.users WHERE auth_user_id = NEW.id)
  );
  
  RETURN NEW;
END;
$$;

-- Create or replace function to sync email verification status
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure triggers exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_verification();

-- Update existing users who have confirmed emails but are marked as unverified
UPDATE public.users 
SET is_verified = true, updated_at = now()
WHERE auth_user_id IN (
  SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL
) AND is_verified = false;