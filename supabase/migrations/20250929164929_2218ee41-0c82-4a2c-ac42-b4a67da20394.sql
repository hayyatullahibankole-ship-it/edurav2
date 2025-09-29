-- Fix SMS trigger to call correct schema function
CREATE OR REPLACE FUNCTION send_sms_after_result()
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
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      PERFORM public.log_security_event(
        'SMS_NOTIFY_FAILED',
        'results',
        NEW.attempt_id,
        jsonb_build_object('error', SQLERRM)
      );
    END;
  END IF;

  RETURN NEW;
END;
$$;