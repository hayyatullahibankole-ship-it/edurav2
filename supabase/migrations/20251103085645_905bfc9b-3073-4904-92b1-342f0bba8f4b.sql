-- Add RLS policy for school admins to insert school subscriptions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'school_subscriptions' 
    AND policyname = 'School admins can create subscriptions for their school'
  ) THEN
    CREATE POLICY "School admins can create subscriptions for their school"
    ON public.school_subscriptions
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.schools s
        JOIN public.users u ON s.admin_user_id = u.id
        WHERE s.id = school_subscriptions.school_id
          AND u.auth_user_id = auth.uid()
      )
    );
  END IF;
END $$;