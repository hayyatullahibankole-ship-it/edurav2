-- Performance indexes for high-traffic queries

-- Resources: used by PastQuestions/Books/Syllabus tabs
CREATE INDEX IF NOT EXISTS idx_resources_active_subject_created
ON public.resources (subject_id, created_at DESC)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_resources_active_access_created
ON public.resources (access_level, created_at DESC)
WHERE is_active = true;

-- Subjects: frequent filter + sort
CREATE INDEX IF NOT EXISTS idx_subjects_active_name
ON public.subjects (is_active, name);

-- Notifications: bell dropdown queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON public.notifications (user_id, is_read, created_at DESC);