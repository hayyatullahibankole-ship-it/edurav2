-- Enable RLS on remaining tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.users u ON ur.user_id = u.id
    WHERE u.auth_user_id = _user_id
      AND ur.role = _role
  )
$$;

-- Helper function to check if user is admin or super admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'super_admin')
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles table
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = user_roles.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for roles table (read-only for authenticated users)
CREATE POLICY "Authenticated users can view roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = subscriptions.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for subjects (public read)
CREATE POLICY "Anyone can view active subjects"
  ON public.subjects FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for exams table
CREATE POLICY "Users can view published exams"
  ON public.exams FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all exams"
  ON public.exams FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for exam_subjects (follows exams)
CREATE POLICY "Users can view exam subjects for published exams"
  ON public.exam_subjects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = exam_subjects.exam_id 
    AND exams.is_published = true
  ));

CREATE POLICY "Admins can manage exam subjects"
  ON public.exam_subjects FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for questions table
CREATE POLICY "Users can view active questions"
  ON public.questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all questions"
  ON public.questions FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for attempts table
CREATE POLICY "Users can view own attempts"
  ON public.attempts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = attempts.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can create own attempts"
  ON public.attempts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = attempts.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own attempts"
  ON public.attempts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = attempts.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all attempts"
  ON public.attempts FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for attempt_answers table
CREATE POLICY "Users can manage own attempt answers"
  ON public.attempt_answers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.id = attempt_answers.attempt_id 
    AND u.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all attempt answers"
  ON public.attempt_answers FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for results table
CREATE POLICY "Users can view own results"
  ON public.results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.attempts a
    JOIN public.users u ON a.user_id = u.id
    WHERE a.id = results.attempt_id 
    AND u.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all results"
  ON public.results FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for resources table
CREATE POLICY "Users can view resources based on access level"
  ON public.resources FOR SELECT
  USING (
    is_active = true AND (
      access_level = 'free' OR 
      (access_level = 'premium' AND EXISTS (
        SELECT 1 FROM public.subscriptions s
        JOIN public.users u ON s.user_id = u.id
        WHERE u.auth_user_id = auth.uid() 
        AND s.status = 'ACTIVE'
        AND s.end_date > NOW()
      ))
    )
  );

CREATE POLICY "Admins can manage all resources"
  ON public.resources FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for transactions table
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = transactions.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true); -- Webhook handlers need to create transactions

-- RLS Policies for bookings table
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = bookings.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can create own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = bookings.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Tutors can view their assigned bookings"
  ON public.bookings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = bookings.tutor_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = notifications.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = notifications.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policies for audit_logs table (admin only)
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "System can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for settings table (admin only)
CREATE POLICY "Admins can manage settings"
  ON public.settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create trigger to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    first_name,
    last_name
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, 'student'
  FROM public.users u
  WHERE u.auth_user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price, duration_days, features, resource_access_level) VALUES
('Free Trial', 'Free 7-day trial with limited features', 0.00, 7, '["5 practice exams", "Basic resources", "Community support"]'::jsonb, 'basic'),
('Basic Plan', 'Essential features for exam preparation', 2000.00, 30, '["Unlimited practice exams", "All subjects", "Basic analytics", "Email support"]'::jsonb, 'premium'),
('Premium Plan', 'Advanced features with consultation', 5000.00, 30, '["Everything in Basic", "Live consultations", "Advanced analytics", "Priority support", "Downloadable resources"]'::jsonb, 'pro'),
('Annual Basic', 'Basic plan billed annually with discount', 20000.00, 365, '["Unlimited practice exams", "All subjects", "Basic analytics", "Email support"]'::jsonb, 'premium'),
('Annual Premium', 'Premium plan billed annually with discount', 50000.00, 365, '["Everything in Basic", "Live consultations", "Advanced analytics", "Priority support", "Downloadable resources"]'::jsonb, 'pro');

-- Insert default subjects
INSERT INTO public.subjects (name, code, default_question_count) VALUES
('English Language', 'ENG', 60),
('Mathematics', 'MTH', 40),
('Physics', 'PHY', 40),
('Chemistry', 'CHE', 40),
('Biology', 'BIO', 40),
('Agricultural Science', 'AGR', 40),
('Economics', 'ECO', 40),
('Geography', 'GEO', 40),
('Government', 'GOV', 40),
('Literature in English', 'LIT', 40),
('Christian Religious Studies', 'CRS', 40),
('Islamic Religious Studies', 'IRS', 40),
('History', 'HIS', 40),
('Commerce', 'COM', 40),
('Accounting', 'ACC', 40),
('Further Mathematics', 'FMT', 40);

-- Insert system settings
INSERT INTO public.settings (key, value, description) VALUES
('site_name', '"AKBOY EXAM MASTER"'::jsonb, 'Application name'),
('jamb_exam_duration', '180'::jsonb, 'JAMB exam duration in minutes'),
('waec_default_duration', '120'::jsonb, 'Default WAEC subject duration in minutes'),
('max_concurrent_sessions', '1'::jsonb, 'Maximum concurrent user sessions'),
('enable_proctoring', 'false'::jsonb, 'Enable webcam proctoring'),
('suspicious_activity_threshold', '5'::jsonb, 'Threshold for flagging suspicious activity'),
('email_notifications', 'true'::jsonb, 'Enable email notifications'),
('maintenance_mode', 'false'::jsonb, 'Enable maintenance mode');