-- Update student_exam_progress view to include proctoring_data (exam configuration)
-- This is safe because proctoring_data contains exam settings, not security monitoring data
-- Security monitoring data like device_fingerprint, ip_address are in separate columns

DROP VIEW IF EXISTS student_exam_progress;

CREATE VIEW student_exam_progress AS
SELECT 
  a.id,
  a.user_id,
  a.exam_id,
  a.status,
  a.selected_subjects,
  a.started_at,
  a.submitted_at,
  a.time_remaining_seconds,
  a.created_at,
  -- Include proctoring_data as it contains exam configuration (not security data)
  a.proctoring_data,
  -- Hide sensitive tracking data from students
  CASE 
    WHEN is_admin(auth.uid()) THEN a.suspicious_activity_count
    WHEN a.suspicious_activity_count > 5 THEN 1  -- High risk
    WHEN a.suspicious_activity_count > 2 THEN 2  -- Medium risk  
    ELSE 3  -- Low risk
  END as security_score
FROM attempts a
WHERE 
  -- Students can only see their own attempts
  (EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = a.user_id AND u.auth_user_id = auth.uid()
  ))
  -- Admins can see all
  OR is_admin(auth.uid());