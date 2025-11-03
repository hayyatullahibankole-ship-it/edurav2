-- Delete all data for user ibrahim.usman241004053@st.lasu.edu.ng
DO $$
DECLARE
  target_user_id uuid := 'b576fea3-7bba-4507-a111-e3f282bafa33';
  target_auth_id uuid := '0076df1f-d9b8-459a-a057-be75b9f2480e';
BEGIN
  -- Delete from audit_logs first (foreign key constraint)
  DELETE FROM public.audit_logs WHERE actor_user_id = target_user_id OR target_id = target_user_id;
  
  -- Delete from dependent tables
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.user_preferences WHERE user_id = target_user_id;
  DELETE FROM public.email_preferences WHERE user_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.referral_codes WHERE user_id = target_user_id;
  DELETE FROM public.referrals WHERE referrer_id = target_user_id OR referred_user_id = target_user_id;
  DELETE FROM public.user_streaks WHERE user_id = target_user_id;
  DELETE FROM public.subscriptions WHERE user_id = target_user_id;
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  DELETE FROM public.bookings WHERE user_id = target_user_id OR tutor_id = target_user_id;
  DELETE FROM public.lesson_completions WHERE user_id = target_user_id;
  DELETE FROM public.forum_posts WHERE user_id = target_user_id;
  DELETE FROM public.forum_replies WHERE user_id = target_user_id;
  DELETE FROM public.forum_votes WHERE user_id = target_user_id;
  
  -- Delete from schools table
  DELETE FROM public.schools WHERE admin_user_id = target_user_id;
  
  -- Delete attempts and related data
  DELETE FROM public.attempt_answers aa USING public.attempts a 
  WHERE aa.attempt_id = a.id AND a.user_id = target_user_id;
  
  DELETE FROM public.results r USING public.attempts a 
  WHERE r.attempt_id = a.id AND a.user_id = target_user_id;
  
  DELETE FROM public.attempts WHERE user_id = target_user_id;
  
  -- Delete the users record
  DELETE FROM public.users WHERE id = target_user_id;
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_auth_id;
  
  RAISE NOTICE 'Successfully deleted user ibrahim.usman241004053@st.lasu.edu.ng and all associated data';
END $$;