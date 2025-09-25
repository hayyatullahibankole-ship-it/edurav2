-- Fix the search path security warning by updating the function
CREATE OR REPLACE FUNCTION delete_user_completely(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
    attempt_ids UUID[];
BEGIN
    -- Get the user record
    SELECT * INTO user_record FROM users WHERE auth_user_id = user_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
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
    DELETE FROM subscriptions WHERE user_id = user_record.id;
    DELETE FROM transactions WHERE user_id = user_record.id;
    DELETE FROM notifications WHERE user_id = user_record.id;
    DELETE FROM bookings WHERE user_id = user_record.id;
    
    -- Finally delete the user profile
    DELETE FROM users WHERE id = user_record.id;
    
    -- Delete from auth.users (this will cascade)
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RETURN TRUE;
END;
$$;