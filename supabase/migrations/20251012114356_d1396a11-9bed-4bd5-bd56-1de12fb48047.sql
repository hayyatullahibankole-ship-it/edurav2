-- Study Companion Hub Tables

-- Study topics table
CREATE TABLE public.study_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  exam_type exam_type NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Study lessons table
CREATE TABLE public.study_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.study_topics(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  display_order INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Study resources table (PDFs, videos)
CREATE TABLE public.study_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.study_lessons(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('pdf', 'video', 'image', 'link')),
  resource_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Link lessons to practice questions
CREATE TABLE public.lesson_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.study_lessons(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  display_order INTEGER DEFAULT 0,
  UNIQUE(lesson_id, question_id)
);

-- User progress tracking
CREATE TABLE public.user_study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.study_lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- Discussion Forum Tables

-- Forum posts
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  exam_type exam_type,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  is_solved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  solved_at TIMESTAMPTZ
);

-- Forum replies
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]',
  is_answer BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum votes (upvotes)
CREATE TABLE public.forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) DEFAULT 'upvote' CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id),
  CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Challenge Arena Tables

-- Challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) DEFAULT 'daily' CHECK (challenge_type IN ('daily', 'weekly', 'special')),
  subject_ids JSONB NOT NULL DEFAULT '[]',
  question_count INTEGER NOT NULL DEFAULT 20,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  difficulty_level INTEGER DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 5),
  points_reward INTEGER DEFAULT 100,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge attempts
CREATE TABLE public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Achievement types
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  badge_icon TEXT,
  badge_color VARCHAR(50) DEFAULT 'blue',
  category VARCHAR(50) CHECK (category IN ('speed', 'accuracy', 'consistency', 'subject', 'milestone')),
  criteria JSONB NOT NULL,
  points_value INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User points/credits
CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  total_points INTEGER DEFAULT 0,
  rank INTEGER,
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Study Hub (Premium/Pro only)
CREATE POLICY "Premium users can view study topics" ON public.study_topics
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN users u ON s.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level IN ('premium', 'enterprise')
    )
  );

CREATE POLICY "Admins can manage study topics" ON public.study_topics
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Premium users can view lessons" ON public.study_lessons
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN users u ON s.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level IN ('premium', 'enterprise')
    )
  );

CREATE POLICY "Admins can manage lessons" ON public.study_lessons
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Premium users can view resources" ON public.study_resources
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    JOIN users u ON s.user_id = u.id
    WHERE u.auth_user_id = auth.uid()
      AND s.status = 'ACTIVE'
      AND s.end_date > now()
      AND sp.resource_access_level IN ('premium', 'enterprise')
  ));

CREATE POLICY "Admins can manage resources" ON public.study_resources
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view lesson questions" ON public.lesson_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage lesson questions" ON public.lesson_questions
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can manage own study progress" ON public.user_study_progress
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = user_study_progress.user_id AND auth_user_id = auth.uid()
  ));

-- RLS Policies for Forum (All authenticated users)
CREATE POLICY "Authenticated users can view posts" ON public.forum_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = forum_posts.user_id AND auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own posts" ON public.forum_posts
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM users WHERE id = forum_posts.user_id AND auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all posts" ON public.forum_posts
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can view replies" ON public.forum_replies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = forum_replies.user_id AND auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own replies" ON public.forum_replies
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM users WHERE id = forum_replies.user_id AND auth_user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all replies" ON public.forum_replies
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can vote" ON public.forum_votes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = forum_votes.user_id AND auth_user_id = auth.uid()
  ));

-- RLS Policies for Challenge Arena (Pro only)
CREATE POLICY "Pro users can view challenges" ON public.challenges
  FOR SELECT USING (
    is_active = true AND 
    start_date <= now() AND 
    end_date >= now() AND
    EXISTS (
      SELECT 1 FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id = sp.id
      JOIN users u ON s.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND s.status = 'ACTIVE'
        AND s.end_date > now()
        AND sp.resource_access_level = 'enterprise'
    )
  );

CREATE POLICY "Admins can manage challenges" ON public.challenges
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Pro users can create challenge attempts" ON public.challenge_attempts
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id = challenge_attempts.user_id AND auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can view own attempts" ON public.challenge_attempts
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE id = challenge_attempts.user_id AND auth_user_id = auth.uid()
  ) OR is_admin(auth.uid()));

CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE id = user_achievements.user_id AND auth_user_id = auth.uid()
  ) OR is_admin(auth.uid()));

CREATE POLICY "System can insert user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE id = user_points.user_id AND auth_user_id = auth.uid()
  ) OR is_admin(auth.uid()));

CREATE POLICY "System can manage user points" ON public.user_points
  FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_study_topics_subject ON public.study_topics(subject_id);
CREATE INDEX idx_study_lessons_topic ON public.study_lessons(topic_id);
CREATE INDEX idx_study_resources_lesson ON public.study_resources(lesson_id);
CREATE INDEX idx_user_study_progress_user ON public.user_study_progress(user_id);
CREATE INDEX idx_forum_posts_subject ON public.forum_posts(subject_id);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_replies_post ON public.forum_replies(post_id);
CREATE INDEX idx_challenge_attempts_challenge ON public.challenge_attempts(challenge_id);
CREATE INDEX idx_challenge_attempts_user ON public.challenge_attempts(user_id);
CREATE INDEX idx_user_points_rank ON public.user_points(rank);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_topics_updated_at BEFORE UPDATE ON public.study_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_lessons_updated_at BEFORE UPDATE ON public.study_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();