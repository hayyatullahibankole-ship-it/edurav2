-- Add missing UPDATE policy for school subscriptions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'school_subscriptions' 
    AND policyname = 'School admins can update own subscriptions'
  ) THEN
    CREATE POLICY "School admins can update own subscriptions"
    ON public.school_subscriptions
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1
        FROM public.schools s
        JOIN public.users u ON s.admin_user_id = u.id
        WHERE s.id = school_subscriptions.school_id
          AND u.auth_user_id = auth.uid()
      )
    )
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