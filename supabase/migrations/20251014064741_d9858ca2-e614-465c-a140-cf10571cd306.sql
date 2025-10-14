-- Create a function to send welcome email when user signs up
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to send welcome email (using hardcoded Supabase URL)
  PERFORM
    net.http_post(
      url := 'https://zqapbmllkywsuywpfava.supabase.co/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
      ),
      body := jsonb_build_object(
        'userId', NEW.id,
        'email', NEW.email,
        'firstName', NEW.raw_user_meta_data->>'first_name',
        'lastName', NEW.raw_user_meta_data->>'last_name'
      )
    );
  
  RETURN NEW;
END;
$$;

-- Create trigger to send welcome email after user signup
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome_email ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();
