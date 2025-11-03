-- Function to create a test school account
CREATE OR REPLACE FUNCTION create_test_school_account(
  p_email TEXT DEFAULT 'testschool@edura.com',
  p_password TEXT DEFAULT 'TestSchool123!',
  p_school_name TEXT DEFAULT 'Edura Test Academy',
  p_admin_name TEXT DEFAULT 'School Administrator'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user_id UUID;
  v_user_id UUID;
  v_school_id UUID;
  v_result jsonb;
BEGIN
  -- Check if admin making this call
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can create test school accounts';
  END IF;

  -- Create auth user (this will trigger handle_new_user which creates the users record)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'first_name', split_part(p_admin_name, ' ', 1),
      'last_name', split_part(p_admin_name, ' ', 2)
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO v_auth_user_id;

  -- Get the created user_id from users table
  SELECT id INTO v_user_id 
  FROM users 
  WHERE auth_user_id = v_auth_user_id;

  -- Create school record
  INSERT INTO schools (
    name,
    email,
    phone,
    type,
    address,
    state,
    admin_user_id,
    is_active,
    email_verified,
    students_added
  ) VALUES (
    p_school_name,
    p_email,
    '+2348012345678',
    'secondary',
    '123 Education Avenue, Test City',
    'Lagos',
    v_user_id,
    true,
    true,
    0
  )
  RETURNING id INTO v_school_id;

  -- Create active free subscription
  INSERT INTO school_subscriptions (
    school_id,
    student_seats,
    price_per_student,
    total_amount,
    status,
    admin_user_id,
    start_date,
    end_date,
    auto_renew
  ) VALUES (
    v_school_id,
    100,
    0,
    0,
    'ACTIVE',
    v_auth_user_id,
    NOW(),
    NOW() + INTERVAL '1 year',
    false
  );

  -- Build result
  v_result := jsonb_build_object(
    'success', true,
    'auth_user_id', v_auth_user_id,
    'user_id', v_user_id,
    'school_id', v_school_id,
    'email', p_email,
    'password', p_password,
    'school_name', p_school_name,
    'admin_name', p_admin_name
  );

  RETURN v_result;
END;
$$;