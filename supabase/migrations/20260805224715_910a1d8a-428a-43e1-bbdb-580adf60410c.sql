CREATE OR REPLACE FUNCTION public.notify_new_forum_question()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subject_name TEXT;
  post_author_name TEXT;
BEGIN
  SELECT name INTO subject_name FROM subjects WHERE id = NEW.subject_id;

  SELECT CONCAT(first_name, ' ', last_name) INTO post_author_name
  FROM users WHERE id = NEW.user_id;

  INSERT INTO notifications (user_id, title, message, type, metadata)
  SELECT
    u.id,
    '📚 New Forum Question',
    COALESCE(post_author_name, 'A student') || ' asked: "' || LEFT(NEW.title, 50) ||
    CASE WHEN LENGTH(NEW.title) > 50 THEN '..."' ELSE '"' END,
    'info',
    jsonb_build_object(
      'post_id', NEW.id,
      'subject_id', NEW.subject_id,
      'subject_name', COALESCE(subject_name, 'General'),
      'exam_type', NEW.exam_type
    )
  FROM users u
  WHERE u.id <> NEW.user_id
    AND COALESCE(u.is_suspended, false) = false;

  RETURN NEW;
END;
$$;