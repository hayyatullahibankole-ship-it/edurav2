-- Feature 1: Syllabus Coverage Tracker
CREATE TABLE IF NOT EXISTS public.syllabus_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  attempted_questions INTEGER NOT NULL DEFAULT 0,
  correct_questions INTEGER NOT NULL DEFAULT 0,
  coverage_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_questions > 0 THEN (attempted_questions::NUMERIC / total_questions::NUMERIC * 100)
      ELSE 0
    END
  ) STORED,
  mastery_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN attempted_questions > 0 THEN (correct_questions::NUMERIC / attempted_questions::NUMERIC * 100)
      ELSE 0
    END
  ) STORED,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id, topic_name)
);

ALTER TABLE public.syllabus_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own syllabus coverage"
  ON public.syllabus_coverage FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = syllabus_coverage.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "System can manage syllabus coverage"
  ON public.syllabus_coverage FOR ALL
  USING (true)
  WITH CHECK (true);

-- Feature 2: Weak Topic Recommendations
CREATE TABLE IF NOT EXISTS public.weak_topic_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  weakness_score NUMERIC(5,2) NOT NULL, -- Lower score = weaker performance
  recommended_practice_count INTEGER DEFAULT 10,
  times_recommended INTEGER DEFAULT 0,
  last_recommended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject_id, topic_name)
);

ALTER TABLE public.weak_topic_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weak topic recommendations"
  ON public.weak_topic_recommendations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = weak_topic_recommendations.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own recommendations"
  ON public.weak_topic_recommendations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = weak_topic_recommendations.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Feature 3: Daily Practice Streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_practice_date DATE,
  total_practice_days INTEGER NOT NULL DEFAULT 0,
  streak_milestones JSONB DEFAULT '[]'::JSONB, -- Track milestones like [7, 14, 30, 60, 100]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.user_streaks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = user_streaks.user_id 
    AND users.auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update own streaks"
  ON public.user_streaks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = user_streaks.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Feature 4: Offline Downloads Tracking
CREATE TABLE IF NOT EXISTS public.offline_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  exam_type exam_type NOT NULL,
  subject_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  questions_data JSONB NOT NULL, -- Stores question IDs and basic info (not answers)
  download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_synced BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.offline_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own offline downloads"
  ON public.offline_downloads FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = offline_downloads.user_id 
    AND users.auth_user_id = auth.uid()
  ));

-- Function to update syllabus coverage after attempt
CREATE OR REPLACE FUNCTION public.update_syllabus_coverage_after_attempt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_subject_id UUID;
  v_topic_name TEXT;
  v_is_correct BOOLEAN;
BEGIN
  -- Get user_id from attempt
  SELECT a.user_id INTO v_user_id
  FROM attempts a
  WHERE a.id = NEW.attempt_id;
  
  -- Get subject and topic from question
  SELECT q.subject_id, 
         COALESCE(q.tags->0->>'topic', 'General') INTO v_subject_id, v_topic_name
  FROM questions q
  WHERE q.id = NEW.question_id;
  
  -- Upsert syllabus coverage
  INSERT INTO syllabus_coverage (
    user_id,
    subject_id,
    topic_name,
    total_questions,
    attempted_questions,
    correct_questions,
    last_practiced_at
  )
  VALUES (
    v_user_id,
    v_subject_id,
    v_topic_name,
    1,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    NOW()
  )
  ON CONFLICT (user_id, subject_id, topic_name)
  DO UPDATE SET
    attempted_questions = syllabus_coverage.attempted_questions + 1,
    correct_questions = syllabus_coverage.correct_questions + 
      CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    last_practiced_at = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_coverage_on_answer
  AFTER INSERT ON attempt_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_syllabus_coverage_after_attempt();

-- Function to update streaks
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_last_practice_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_new_milestone BOOLEAN := false;
  v_milestone_reached INTEGER;
BEGIN
  -- Get or create streak record
  INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_practice_date, total_practice_days)
  VALUES (p_user_id, 0, 0, NULL, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT last_practice_date, current_streak, longest_streak
  INTO v_last_practice_date, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_id = p_user_id;
  
  -- If no practice today yet
  IF v_last_practice_date IS NULL OR v_last_practice_date < v_today THEN
    -- Check if streak continues (practiced yesterday)
    IF v_last_practice_date = v_today - INTERVAL '1 day' THEN
      v_current_streak := v_current_streak + 1;
    ELSIF v_last_practice_date < v_today - INTERVAL '1 day' OR v_last_practice_date IS NULL THEN
      -- Streak broken, start new
      v_current_streak := 1;
    END IF;
    
    -- Check if new longest streak
    IF v_current_streak > v_longest_streak THEN
      v_longest_streak := v_current_streak;
    END IF;
    
    -- Check for milestones
    IF v_current_streak IN (7, 14, 30, 60, 100, 365) THEN
      v_new_milestone := true;
      v_milestone_reached := v_current_streak;
    END IF;
    
    -- Update streak record
    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_practice_date = v_today,
        total_practice_days = total_practice_days + 1,
        streak_milestones = CASE 
          WHEN v_new_milestone THEN 
            streak_milestones || jsonb_build_object(
              'days', v_milestone_reached,
              'achieved_at', NOW()
            )
          ELSE streak_milestones
        END,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'new_milestone', v_new_milestone,
    'milestone_reached', v_milestone_reached
  );
END;
$$;

-- Function to identify weak topics and create recommendations
CREATE OR REPLACE FUNCTION public.generate_weak_topic_recommendations(p_user_id UUID)
RETURNS TABLE(subject_name TEXT, topic_name TEXT, weakness_score NUMERIC, recommended_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear old recommendations
  UPDATE weak_topic_recommendations
  SET is_active = false
  WHERE user_id = p_user_id;
  
  -- Insert new recommendations based on syllabus coverage
  INSERT INTO weak_topic_recommendations (
    user_id,
    subject_id,
    topic_name,
    weakness_score,
    recommended_practice_count,
    is_active,
    last_recommended_at
  )
  SELECT 
    sc.user_id,
    sc.subject_id,
    sc.topic_name,
    sc.mastery_percentage as weakness_score,
    CASE 
      WHEN sc.mastery_percentage < 30 THEN 20
      WHEN sc.mastery_percentage < 50 THEN 15
      WHEN sc.mastery_percentage < 70 THEN 10
      ELSE 5
    END as recommended_practice_count,
    true,
    NOW()
  FROM syllabus_coverage sc
  WHERE sc.user_id = p_user_id
    AND sc.attempted_questions >= 3  -- At least 3 attempts
    AND sc.mastery_percentage < 75   -- Less than 75% mastery
  ON CONFLICT (user_id, subject_id, topic_name)
  DO UPDATE SET
    weakness_score = EXCLUDED.weakness_score,
    recommended_practice_count = EXCLUDED.recommended_practice_count,
    is_active = true,
    last_recommended_at = NOW();
  
  -- Return recommendations
  RETURN QUERY
  SELECT 
    s.name as subject_name,
    wtr.topic_name,
    wtr.weakness_score,
    wtr.recommended_practice_count
  FROM weak_topic_recommendations wtr
  JOIN subjects s ON s.id = wtr.subject_id
  WHERE wtr.user_id = p_user_id
    AND wtr.is_active = true
  ORDER BY wtr.weakness_score ASC
  LIMIT 5;
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_syllabus_coverage_user_subject ON public.syllabus_coverage(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_weak_recommendations_user ON public.weak_topic_recommendations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_offline_downloads_user ON public.offline_downloads(user_id, expires_at);