-- Enable RLS and add policies for schools and school_subscriptions
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy helpers: create if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'Admins can manage schools'
  ) THEN
    CREATE POLICY "Admins can manage schools"
    ON public.schools
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'School admins can view own school'
  ) THEN
    CREATE POLICY "School admins can view own school"
    ON public.schools
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = schools.admin_user_id AND u.auth_user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'School admins can insert own school'
  ) THEN
    CREATE POLICY "School admins can insert own school"
    ON public.schools
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = admin_user_id AND u.auth_user_id = auth.uid()
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'schools' AND policyname = 'School admins can update own school'
  ) THEN
    CREATE POLICY "School admins can update own school"
    ON public.schools
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = schools.admin_user_id AND u.auth_user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = schools.admin_user_id AND u.auth_user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- school_subscriptions: allow admins manage and school admins view
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'school_subscriptions' AND policyname = 'Admins can manage school subscriptions'
  ) THEN
    CREATE POLICY "Admins can manage school subscriptions"
    ON public.school_subscriptions
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'school_subscriptions' AND policyname = 'School admins can view own subscriptions'
  ) THEN
    CREATE POLICY "School admins can view own subscriptions"
    ON public.school_subscriptions
    FOR SELECT
    USING (
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