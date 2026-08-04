CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name,
    phone,
    is_verified,
    academic_stage,
    institution_name,
    faculty,
    department,
    study_level
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NULLIF(NEW.raw_user_meta_data ->> 'academic_stage', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'institution_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'faculty', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'department', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'study_level', '')
  )
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    is_verified = EXCLUDED.is_verified,
    academic_stage = COALESCE(public.users.academic_stage, EXCLUDED.academic_stage),
    institution_name = COALESCE(public.users.institution_name, EXCLUDED.institution_name),
    faculty = COALESCE(public.users.faculty, EXCLUDED.faculty),
    department = COALESCE(public.users.department, EXCLUDED.department),
    study_level = COALESCE(public.users.study_level, EXCLUDED.study_level)
  RETURNING id INTO new_user_id;

  IF new_user_id IS NULL THEN
    SELECT id INTO new_user_id FROM public.users WHERE auth_user_id = NEW.id;
  END IF;

  INSERT INTO public.user_preferences (user_id)
  VALUES (new_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  IF (NEW.raw_user_meta_data->>'role') = 'school_admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'school_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;