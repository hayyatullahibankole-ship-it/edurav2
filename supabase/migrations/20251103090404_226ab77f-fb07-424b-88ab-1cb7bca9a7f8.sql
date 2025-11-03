-- Fix handle_new_school trigger to use correct user ID
CREATE OR REPLACE FUNCTION public.handle_new_school()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert school_admin role using the correct user_id (not auth_user_id)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.admin_user_id, 'school_admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Now create the school for ibrahim.usman241004053@st.lasu.edu.ng
INSERT INTO public.schools (
  name,
  slug,
  email,
  phone,
  address,
  state,
  school_code,
  type,
  admin_user_id,
  max_students,
  students_added,
  is_active,
  email_verified
) VALUES (
  'Akboy Hub',
  'akboy-hub',
  'ibrahim.usman241004053@st.lasu.edu.ng',
  '08011288901',
  'Lagos',
  'Lagos',
  'SCH-' || substring(md5(random()::text) from 1 for 8),
  'secondary',
  '4783c569-e6b6-4bfb-abff-c90123c2d334',
  50,
  0,
  false,
  true
)
ON CONFLICT DO NOTHING;