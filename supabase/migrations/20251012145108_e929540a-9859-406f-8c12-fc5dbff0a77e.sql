-- Function to notify all premium users
CREATE OR REPLACE FUNCTION notify_premium_users(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  notification_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notifications for all users with active premium subscriptions
  INSERT INTO notifications (user_id, title, message, type, metadata)
  SELECT DISTINCT u.id, notification_title, notification_message, notification_type, notification_metadata
  FROM users u
  JOIN subscriptions s ON s.user_id = u.id
  JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE s.status = 'ACTIVE'
    AND s.end_date > now()
    AND sp.resource_access_level IN ('premium', 'enterprise');
END;
$$;

-- Function to notify all users
CREATE OR REPLACE FUNCTION notify_all_users(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  notification_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notifications for all active users
  INSERT INTO notifications (user_id, title, message, type, metadata)
  SELECT u.id, notification_title, notification_message, notification_type, notification_metadata
  FROM users u
  WHERE u.is_suspended = false;
END;
$$;

-- Trigger function for new challenges
CREATE OR REPLACE FUNCTION notify_new_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if challenge is active
  IF NEW.is_active = true THEN
    PERFORM notify_all_users(
      '🎯 New Challenge Available!',
      'A new challenge "' || NEW.title || '" is now available. Compete and earn points!',
      'info',
      jsonb_build_object(
        'challenge_id', NEW.id,
        'challenge_type', NEW.challenge_type,
        'points_reward', NEW.points_reward
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function for earned achievements
CREATE OR REPLACE FUNCTION notify_achievement_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_name TEXT;
  achievement_points INTEGER;
BEGIN
  -- Get achievement details
  SELECT name, points_value INTO achievement_name, achievement_points
  FROM achievements
  WHERE id = NEW.achievement_id;
  
  -- Notify the user who earned the achievement
  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    NEW.user_id,
    '🏆 Achievement Unlocked!',
    'Congratulations! You earned the "' || achievement_name || '" achievement and ' || achievement_points || ' points!',
    'success',
    jsonb_build_object(
      'achievement_id', NEW.achievement_id,
      'points_earned', achievement_points
    )
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function for new forum posts
CREATE OR REPLACE FUNCTION notify_new_forum_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author_name TEXT;
  subject_name TEXT;
BEGIN
  -- Get author name
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO author_name
  FROM users
  WHERE id = NEW.user_id;
  
  -- Get subject name if applicable
  IF NEW.subject_id IS NOT NULL THEN
    SELECT name INTO subject_name
    FROM subjects
    WHERE id = NEW.subject_id;
  END IF;
  
  -- Notify all users except the author
  INSERT INTO notifications (user_id, title, message, type, metadata)
  SELECT 
    u.id,
    '💬 New Forum Discussion',
    author_name || ' started a new discussion: "' || NEW.title || '"' || 
    CASE WHEN subject_name IS NOT NULL THEN ' in ' || subject_name ELSE '' END,
    'info',
    jsonb_build_object(
      'post_id', NEW.id,
      'author_id', NEW.user_id,
      'subject_id', NEW.subject_id
    )
  FROM users u
  WHERE u.id != NEW.user_id
    AND u.is_suspended = false
    AND NEW.is_pinned = true; -- Only notify for pinned/important posts initially
  
  RETURN NEW;
END;
$$;

-- Trigger function for forum replies
CREATE OR REPLACE FUNCTION notify_forum_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
  post_title TEXT;
  replier_name TEXT;
BEGIN
  -- Get post details
  SELECT user_id, title INTO post_author_id, post_title
  FROM forum_posts
  WHERE id = NEW.post_id;
  
  -- Get replier name
  SELECT COALESCE(first_name || ' ' || last_name, email) INTO replier_name
  FROM users
  WHERE id = NEW.user_id;
  
  -- Notify the post author (if not replying to own post)
  IF post_author_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      post_author_id,
      '💬 New Reply to Your Post',
      replier_name || ' replied to your discussion: "' || post_title || '"',
      'info',
      jsonb_build_object(
        'post_id', NEW.post_id,
        'reply_id', NEW.id,
        'replier_id', NEW.user_id
      )
    );
  END IF;
  
  -- Notify other participants in the thread
  INSERT INTO notifications (user_id, title, message, type, metadata)
  SELECT DISTINCT
    fr.user_id,
    '💬 New Reply in Discussion',
    replier_name || ' added a reply to: "' || post_title || '"',
    'info',
    jsonb_build_object(
      'post_id', NEW.post_id,
      'reply_id', NEW.id,
      'replier_id', NEW.user_id
    )
  FROM forum_replies fr
  WHERE fr.post_id = NEW.post_id
    AND fr.user_id != NEW.user_id
    AND fr.user_id != post_author_id;
  
  RETURN NEW;
END;
$$;

-- Trigger function for new study topics
CREATE OR REPLACE FUNCTION notify_new_study_topic()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subject_name TEXT;
BEGIN
  -- Only notify if topic is active
  IF NEW.is_active = true THEN
    -- Get subject name if applicable
    IF NEW.subject_id IS NOT NULL THEN
      SELECT name INTO subject_name
      FROM subjects
      WHERE id = NEW.subject_id;
    END IF;
    
    PERFORM notify_premium_users(
      '📚 New Study Topic Available!',
      'New study topic "' || NEW.title || '"' || 
      CASE WHEN subject_name IS NOT NULL THEN ' for ' || subject_name ELSE '' END || 
      ' is now available in Study Hub!',
      'info',
      jsonb_build_object(
        'topic_id', NEW.id,
        'subject_id', NEW.subject_id,
        'exam_type', NEW.exam_type
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for new study lessons
CREATE OR REPLACE FUNCTION notify_new_study_lesson()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  topic_title TEXT;
BEGIN
  -- Only notify if lesson is active
  IF NEW.is_active = true THEN
    -- Get topic title
    SELECT title INTO topic_title
    FROM study_topics
    WHERE id = NEW.topic_id;
    
    PERFORM notify_premium_users(
      '📖 New Lesson Added!',
      'New lesson "' || NEW.title || '" added to topic "' || topic_title || '"',
      'info',
      jsonb_build_object(
        'lesson_id', NEW.id,
        'topic_id', NEW.topic_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_new_challenge ON challenges;
CREATE TRIGGER trigger_notify_new_challenge
  AFTER INSERT ON challenges
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_challenge();

DROP TRIGGER IF EXISTS trigger_notify_achievement_earned ON user_achievements;
CREATE TRIGGER trigger_notify_achievement_earned
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_earned();

DROP TRIGGER IF EXISTS trigger_notify_new_forum_post ON forum_posts;
CREATE TRIGGER trigger_notify_new_forum_post
  AFTER INSERT ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_forum_post();

DROP TRIGGER IF EXISTS trigger_notify_forum_reply ON forum_replies;
CREATE TRIGGER trigger_notify_forum_reply
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION notify_forum_reply();

DROP TRIGGER IF EXISTS trigger_notify_new_study_topic ON study_topics;
CREATE TRIGGER trigger_notify_new_study_topic
  AFTER INSERT ON study_topics
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_study_topic();

DROP TRIGGER IF EXISTS trigger_notify_new_study_lesson ON study_lessons;
CREATE TRIGGER trigger_notify_new_study_lesson
  AFTER INSERT ON study_lessons
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_study_lesson();