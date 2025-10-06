-- Add active session token to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS active_session_token TEXT DEFAULT NULL;

-- Add index for faster session token lookups
CREATE INDEX IF NOT EXISTS idx_users_active_session_token 
ON public.users(active_session_token);

-- Create function to validate and update session token
CREATE OR REPLACE FUNCTION public.validate_and_set_session_token(
  user_auth_id UUID,
  new_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's active session token
  UPDATE public.users
  SET active_session_token = new_token,
      updated_at = now()
  WHERE auth_user_id = user_auth_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to check if session token is valid
CREATE OR REPLACE FUNCTION public.is_session_valid(
  user_auth_id UUID,
  token_to_check TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_token TEXT;
BEGIN
  SELECT active_session_token INTO stored_token
  FROM public.users
  WHERE auth_user_id = user_auth_id;
  
  RETURN (stored_token = token_to_check);
END;
$$;

-- Create function to clear session token on logout
CREATE OR REPLACE FUNCTION public.clear_session_token(user_auth_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET active_session_token = NULL,
      updated_at = now()
  WHERE auth_user_id = user_auth_id;
  
  RETURN TRUE;
END;
$$;