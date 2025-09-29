-- Create user preferences table to store account settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification settings
  email_test_reminders boolean NOT NULL DEFAULT true,
  email_results boolean NOT NULL DEFAULT true,
  email_study_tips boolean NOT NULL DEFAULT true,
  email_subscription_updates boolean NOT NULL DEFAULT true,
  sms_test_reminders boolean NOT NULL DEFAULT false,
  sms_results boolean NOT NULL DEFAULT false,
  push_notifications boolean NOT NULL DEFAULT true,
  
  -- Privacy settings
  profile_visibility text NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
  show_test_scores boolean NOT NULL DEFAULT true,
  show_study_progress boolean NOT NULL DEFAULT true,
  data_collection_analytics boolean NOT NULL DEFAULT true,
  data_collection_personalization boolean NOT NULL DEFAULT true,
  
  -- Study preferences
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ha', 'ig', 'yo')),
  timezone text NOT NULL DEFAULT 'Africa/Lagos',
  default_exam_type text NOT NULL DEFAULT 'jamb' CHECK (default_exam_type IN ('jamb', 'waec', 'neco', 'post-utme')),
  test_duration_preference text NOT NULL DEFAULT 'standard' CHECK (test_duration_preference IN ('quick', 'standard', 'full')),
  difficulty_preference text NOT NULL DEFAULT 'adaptive' CHECK (difficulty_preference IN ('beginner', 'intermediate', 'advanced', 'adaptive')),
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS on user preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = user_preferences.user_id 
    AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = user_preferences.user_id 
    AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE users.id = user_preferences.user_id 
    AND users.auth_user_id = auth.uid()
));

CREATE POLICY "Admins can manage all preferences" 
ON public.user_preferences 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default preferences for existing users
INSERT INTO public.user_preferences (user_id)
SELECT u.id
FROM public.users u
LEFT JOIN public.user_preferences up ON up.user_id = u.id
WHERE up.id IS NULL;

-- Create a trigger to automatically create preferences for new users
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_user_preferences
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_preferences();