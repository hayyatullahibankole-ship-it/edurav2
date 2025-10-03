-- Fix user deletion to handle orphaned records (users without valid auth entries)

-- Update the main delete function to handle missing auth users
CREATE OR REPLACE FUNCTION delete_user_completely(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
    attempt_ids UUID[];
    auth_user_exists BOOLEAN;
BEGIN
    -- Get the user record
    SELECT * INTO user_record FROM users WHERE auth_user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if auth user exists
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_uuid) INTO auth_user_exists;
    
    -- Get all attempt IDs for this user
    SELECT ARRAY(SELECT id FROM attempts WHERE user_id = user_record.id) INTO attempt_ids;
    
    -- Delete in correct order to avoid foreign key violations
    IF array_length(attempt_ids, 1) > 0 THEN
        -- Delete attempt answers
        DELETE FROM attempt_answers WHERE attempt_id = ANY(attempt_ids);
        
        -- Delete results
        DELETE FROM results WHERE attempt_id = ANY(attempt_ids);
        
        -- Delete attempts
        DELETE FROM attempts WHERE user_id = user_record.id;
    END IF;
    
    -- Delete other user-related records
    DELETE FROM user_roles WHERE user_id = user_record.id;
    DELETE FROM user_preferences WHERE user_id = user_record.id;
    DELETE FROM subscriptions WHERE user_id = user_record.id;
    DELETE FROM transactions WHERE user_id = user_record.id;
    DELETE FROM notifications WHERE user_id = user_record.id;
    DELETE FROM bookings WHERE user_id = user_record.id OR tutor_id = user_record.id;
    DELETE FROM audit_logs WHERE actor_user_id = user_record.id OR target_id = user_record.id;
    
    -- Finally delete the user profile
    DELETE FROM users WHERE id = user_record.id;
    
    -- Only delete from auth.users if the auth user exists
    IF auth_user_exists THEN
        DELETE FROM auth.users WHERE id = user_uuid;
    END IF;
    
    -- Log the deletion
    PERFORM log_security_event(
        'ADMIN_DELETE_USER',
        'users',
        user_record.id,
        jsonb_build_object(
            'auth_user_existed', auth_user_exists,
            'by', 'auth_id'
        )
    );
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log the error
    PERFORM log_security_event(
        'ADMIN_DELETE_USER_FAILED',
        'users',
        user_record.id,
        jsonb_build_object(
            'error', SQLERRM,
            'auth_user_id', user_uuid
        )
    );
    RETURN FALSE;
END;
$$;