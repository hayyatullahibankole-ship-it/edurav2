-- Fix the existing school admin user (ibrahim.usman241004053@st.lasu.edu.ng)
DO $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Get the user ID
  SELECT id INTO existing_user_id
  FROM public.users
  WHERE email = 'ibrahim.usman241004053@st.lasu.edu.ng';
  
  -- Add school_admin role if user exists
  IF existing_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (existing_user_id, 'school_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;