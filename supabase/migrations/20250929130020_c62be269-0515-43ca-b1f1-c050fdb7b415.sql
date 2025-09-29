-- Fix audit_logs FK errors when functions insert auth.uid() instead of users.id
-- 1) Trigger function to map auth.uid() -> users.id before insert
CREATE OR REPLACE FUNCTION public.audit_logs_fix_actor_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mapped_user_id uuid;
BEGIN
  -- If actor_user_id is NULL or equals the current auth uid, map it to the application user id
  IF NEW.actor_user_id IS NULL OR NEW.actor_user_id = auth.uid() THEN
    SELECT id INTO mapped_user_id
    FROM public.users
    WHERE auth_user_id = auth.uid();

    IF mapped_user_id IS NOT NULL THEN
      NEW.actor_user_id = mapped_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Recreate trigger to ensure it exists and uses the latest function
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_logs_fix_actor_user_id_trg'
  ) THEN
    DROP TRIGGER audit_logs_fix_actor_user_id_trg ON public.audit_logs;
  END IF;
END $$;

CREATE TRIGGER audit_logs_fix_actor_user_id_trg
BEFORE INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.audit_logs_fix_actor_user_id();