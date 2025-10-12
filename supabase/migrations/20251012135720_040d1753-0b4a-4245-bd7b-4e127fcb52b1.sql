-- Drop and recreate RLS policies for study_topics to ensure admins can always see all topics
DROP POLICY IF EXISTS "Admins can manage study topics" ON study_topics;
DROP POLICY IF EXISTS "Admins can view all study topics" ON study_topics;

-- Create explicit policies for admins
CREATE POLICY "Admins can view all study topics"
  ON study_topics
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert study topics"
  ON study_topics
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update study topics"
  ON study_topics
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete study topics"
  ON study_topics
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Do the same for study_lessons
DROP POLICY IF EXISTS "Admins can manage lessons" ON study_lessons;
DROP POLICY IF EXISTS "Admins can view all lessons" ON study_lessons;

CREATE POLICY "Admins can view all lessons"
  ON study_lessons
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert lessons"
  ON study_lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update lessons"
  ON study_lessons
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete lessons"
  ON study_lessons
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));