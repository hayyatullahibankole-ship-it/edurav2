-- Fix RLS policy issue for attempts table during submission
-- The issue is that when students submit, they need to update attempt status
-- But the current policy might be blocking this

-- Drop the problematic policy and recreate it to allow status updates during submission
DROP POLICY IF EXISTS "Users can update own attempts" ON attempts;

-- Create a more permissive policy for updates that allows status changes
CREATE POLICY "Users can update own attempts status"
ON attempts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = attempts.user_id 
    AND users.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = attempts.user_id 
    AND users.auth_user_id = auth.uid()
  )
);

-- Fix attempt_answers RLS to allow inserts during submission
-- Current policy should work, but let's make sure it's not blocking
DROP POLICY IF EXISTS "Users can insert own attempt answers" ON attempt_answers;

CREATE POLICY "Users can insert own attempt answers during submission"
ON attempt_answers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM attempts a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = attempt_answers.attempt_id 
    AND u.auth_user_id = auth.uid()
    AND a.status IN ('STARTED', 'IN_PROGRESS', 'SUBMITTED')
  )
);

-- Add trigger to automatically send SMS after result is inserted
CREATE OR REPLACE FUNCTION send_sms_after_result()
RETURNS TRIGGER AS $$
DECLARE
  user_auth_id uuid;
  user_has_sms boolean := false;
  user_is_premium boolean := false;
BEGIN
  -- Get user info from the attempt
  SELECT u.auth_user_id INTO user_auth_id
  FROM attempts a
  JOIN users u ON a.user_id = u.id
  WHERE a.id = NEW.attempt_id;

  IF user_auth_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if user has SMS notifications enabled and premium subscription
  SELECT 
    COALESCE(up.sms_results, false) as has_sms,
    EXISTS(
      SELECT 1 FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      WHERE s.user_id = (SELECT id FROM users WHERE auth_user_id = user_auth_id)
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level = 'premium'
    ) as is_premium
  INTO user_has_sms, user_is_premium
  FROM users u
  LEFT JOIN user_preferences up ON u.id = up.user_id
  WHERE u.auth_user_id = user_auth_id;

  -- Only send SMS if user has SMS enabled and premium subscription
  IF user_has_sms AND user_is_premium THEN
    -- Call the notify-result edge function
    PERFORM
      net.http_post(
        url := 'https://zqapbmllkywsuywpfava.supabase.co/functions/v1/notify-result',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'attemptId', NEW.attempt_id,
          'userId', user_auth_id
        )
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on results table
DROP TRIGGER IF EXISTS send_sms_on_result_insert ON results;
CREATE TRIGGER send_sms_on_result_insert
  AFTER INSERT ON results
  FOR EACH ROW
  EXECUTE FUNCTION send_sms_after_result();