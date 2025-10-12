-- Consolidate SELECT policies so admins OR premium users can view
-- Study Topics
DROP POLICY IF EXISTS "Admins can view all study topics" ON study_topics;
DROP POLICY IF EXISTS "Premium users can view study topics" ON study_topics;

CREATE POLICY "Admins or premium can view study topics"
ON study_topics FOR SELECT
USING (
  -- Admins
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND ur.role = 'admin'
  )
  OR
  -- Premium users
  (
    is_active = true AND EXISTS (
      SELECT 1
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN users u ON s.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level IN ('premium','enterprise')
    )
  )
);

-- Study Lessons
DROP POLICY IF EXISTS "Admins can view all lessons" ON study_lessons;
DROP POLICY IF EXISTS "Premium users can view lessons" ON study_lessons;

CREATE POLICY "Admins or premium can view lessons"
ON study_lessons FOR SELECT
USING (
  -- Admins
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON ur.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND ur.role = 'admin'
  )
  OR
  -- Premium users
  (
    is_active = true AND EXISTS (
      SELECT 1
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN users u ON s.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level IN ('premium','enterprise')
    )
  )
);
