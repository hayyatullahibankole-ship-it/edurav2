
-- Fix study_topics RLS policies to properly check admin status
DROP POLICY IF EXISTS "Admins can view all study topics" ON study_topics;
DROP POLICY IF EXISTS "Admins can insert study topics" ON study_topics;
DROP POLICY IF EXISTS "Admins can update study topics" ON study_topics;
DROP POLICY IF EXISTS "Admins can delete study topics" ON study_topics;

-- Create corrected policies that check user_roles properly
CREATE POLICY "Admins can view all study topics"
ON study_topics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can insert study topics"
ON study_topics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update study topics"
ON study_topics FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete study topics"
ON study_topics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- Fix study_lessons RLS policies too
DROP POLICY IF EXISTS "Admins can view all lessons" ON study_lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON study_lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON study_lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON study_lessons;

CREATE POLICY "Admins can view all lessons"
ON study_lessons FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can insert lessons"
ON study_lessons FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can update lessons"
ON study_lessons FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins can delete lessons"
ON study_lessons FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
    AND ur.role = 'admin'
  )
);
