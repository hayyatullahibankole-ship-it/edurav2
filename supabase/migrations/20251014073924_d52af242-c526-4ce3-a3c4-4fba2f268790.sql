-- Create function to notify students about new forum questions
CREATE OR REPLACE FUNCTION notify_new_forum_question()
RETURNS TRIGGER AS $$
DECLARE
  subject_name TEXT;
  post_author_name TEXT;
BEGIN
  -- Get subject name if applicable
  SELECT name INTO subject_name
  FROM subjects
  WHERE id = NEW.subject_id;
  
  -- Get author name
  SELECT CONCAT(first_name, ' ', last_name) INTO post_author_name
  FROM users
  WHERE id = NEW.user_id;
  
  -- Create notifications for all students (excluding the author)
  INSERT INTO notifications (user_id, title, message, type, metadata)
  SELECT 
    u.id,
    '📚 New Forum Question',
    post_author_name || ' asked: "' || LEFT(NEW.title, 50) || 
    CASE WHEN LENGTH(NEW.title) > 50 THEN '..."' ELSE '"' END,
    'info',
    jsonb_build_object(
      'post_id', NEW.id,
      'subject_id', NEW.subject_id,
      'subject_name', COALESCE(subject_name, 'General'),
      'exam_type', NEW.exam_type
    )
  FROM users u
  WHERE u.id != NEW.user_id  -- Don't notify the author
    AND u.is_active = true
    AND NOT u.is_suspended;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new forum posts
DROP TRIGGER IF EXISTS on_new_forum_post ON forum_posts;
CREATE TRIGGER on_new_forum_post
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_forum_question();