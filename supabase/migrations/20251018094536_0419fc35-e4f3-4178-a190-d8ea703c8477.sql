-- Add push notification fields to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT false;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_push_token ON public.user_preferences(push_token) WHERE push_token IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.user_preferences.push_token IS 'Device push notification token (FCM/APNs)';
COMMENT ON COLUMN public.user_preferences.push_notifications_enabled IS 'Whether user has enabled push notifications';