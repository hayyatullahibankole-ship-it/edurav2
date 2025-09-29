-- Create a function to trigger SMS notifications for test results
CREATE OR REPLACE FUNCTION public.notify_test_result_sms()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_auth_id uuid;
  user_has_sms boolean := false;
  user_is_premium boolean := false;
BEGIN
  -- Get user info from the attempt
  SELECT u.auth_user_id INTO user_auth_id
  FROM public.attempts a
  JOIN public.users u ON a.user_id = u.id
  WHERE a.id = NEW.attempt_id;

  IF user_auth_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if user has SMS notifications enabled and premium subscription
  SELECT 
    COALESCE(up.sms_results, false) as has_sms,
    EXISTS(
      SELECT 1 FROM public.subscriptions s
      JOIN public.subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = (SELECT id FROM public.users WHERE auth_user_id = user_auth_id)
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level = 'premium'
    ) as is_premium
  INTO user_has_sms, user_is_premium
  FROM public.users u
  LEFT JOIN public.user_preferences up ON u.id = up.user_id
  WHERE u.auth_user_id = user_auth_id;

  -- Only send SMS if user has SMS enabled and premium subscription
  IF user_has_sms AND user_is_premium THEN
    -- Call the notify-result edge function asynchronously
    PERFORM
      net.http_post(
        url := 'https://zqapbmllkywsuywpfava.supabase.co/functions/v1/notify-result',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := jsonb_build_object(
          'attemptId', NEW.attempt_id,
          'userId', user_auth_id
        )
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for when results are inserted
DROP TRIGGER IF EXISTS trigger_test_result_sms ON public.results;
CREATE TRIGGER trigger_test_result_sms
  AFTER INSERT ON public.results
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_test_result_sms();

-- Create a function to send immediate SMS when premium users complete tests
CREATE OR REPLACE FUNCTION public.send_immediate_result_notification(attempt_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_auth_id uuid;
  result_exists boolean := false;
BEGIN
  -- Check if result exists for this attempt
  SELECT EXISTS(
    SELECT 1 FROM public.results WHERE attempt_id = attempt_uuid
  ) INTO result_exists;

  IF NOT result_exists THEN
    RETURN false;
  END IF;

  -- Get user auth ID
  SELECT u.auth_user_id INTO user_auth_id
  FROM public.attempts a
  JOIN public.users u ON a.user_id = u.id
  WHERE a.id = attempt_uuid;

  IF user_auth_id IS NULL THEN
    RETURN false;
  END IF;

  -- Call the notify-result function
  PERFORM
    net.http_post(
      url := 'https://zqapbmllkywsuywpfava.supabase.co/functions/v1/notify-result',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'attemptId', attempt_uuid,
        'userId', user_auth_id
      )
    );

  RETURN true;
END;
$$;