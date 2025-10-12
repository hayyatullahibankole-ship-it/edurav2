-- Add onboarding completion tracking to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone DEFAULT NULL;