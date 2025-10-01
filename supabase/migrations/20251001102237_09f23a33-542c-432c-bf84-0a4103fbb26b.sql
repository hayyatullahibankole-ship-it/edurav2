-- Create function to delete user by application user id (for users without auth_user_id)
CREATE OR REPLACE FUNCTION public.delete_user_completely_by_app_id(user_app_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := user_app_id;
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Remove dependent records in safe order
  DELETE FROM public.attempt_answers aa
  USING public.attempts a
  WHERE aa.attempt_id = a.id AND a.user_id = uid;

  DELETE FROM public.results r
  USING public.attempts a
  WHERE r.attempt_id = a.id AND a.user_id = uid;

  DELETE FROM public.attempts WHERE user_id = uid;

  DELETE FROM public.subscriptions WHERE user_id = uid;
  DELETE FROM public.transactions WHERE user_id = uid;
  DELETE FROM public.notifications WHERE user_id = uid;
  DELETE FROM public.bookings WHERE user_id = uid OR tutor_id = uid;
  DELETE FROM public.user_roles WHERE user_id = uid;
  DELETE FROM public.user_preferences WHERE user_id = uid;
  DELETE FROM public.audit_logs WHERE actor_user_id = uid OR target_id = uid;

  -- Finally delete the user row
  DELETE FROM public.users WHERE id = uid;

  PERFORM log_security_event('ADMIN_DELETE_USER', 'users', uid, jsonb_build_object('by','app_id'));
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  PERFORM log_security_event('ADMIN_DELETE_USER_FAILED','users', uid, jsonb_build_object('error', SQLERRM));
  RETURN FALSE;
END;
$$;