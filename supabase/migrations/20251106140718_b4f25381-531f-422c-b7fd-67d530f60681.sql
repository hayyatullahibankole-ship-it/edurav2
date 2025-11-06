-- Fix security warning: Update function with proper search path
DROP FUNCTION IF EXISTS auto_confirm_school_admins() CASCADE;

CREATE OR REPLACE FUNCTION auto_confirm_school_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if the user metadata indicates this is a school admin
  IF (NEW.raw_user_meta_data->>'role' = 'school_admin') THEN
    -- Auto-confirm the email
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_auto_confirm_school_admins ON auth.users;
CREATE TRIGGER trigger_auto_confirm_school_admins
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_school_admins();