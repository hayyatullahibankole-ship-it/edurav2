
-- Normalize blog post categories into Campus Hub taxonomy
-- New canonical categories: Events | Opportunities | Articles | Academic Resources | Campus Updates | Student Spotlight

UPDATE public.blog_posts
SET category = CASE
  -- Opportunities: admissions, scholarships, jobs, internships, gigs
  WHEN lower(coalesce(category,'')) IN ('admissions','admission list','admission') THEN 'Opportunities'
  WHEN lower(coalesce(category,'')) ~ '(scholarship|intern|job|gig|opportun|bursary|grant|fellowship)' THEN 'Opportunities'
  WHEN lower(coalesce(title,'')) ~ '(scholarship|admission|intern|recruit|vacancy|application|apply|releases.*form|admission form)' THEN 'Opportunities'

  -- Events
  WHEN lower(coalesce(category,'')) ~ '(event|matriculation|convocation|orientation|seminar|workshop|conference)' THEN 'Events'
  WHEN lower(coalesce(title,'')) ~ '(matriculation|convocation|orientation|seminar|workshop|conference|symposium|festival)' THEN 'Events'

  -- Academic Resources: tips, study, exams, results, syllabus
  WHEN lower(coalesce(category,'')) ~ '(study|tip|exam|result|syllabus|past question|resource|jamb|waec|neco)' THEN 'Academic Resources'
  WHEN lower(coalesce(title,'')) ~ '(study tip|past question|syllabus|how to pass|jamb|waec|neco|cgpa|gpa)' THEN 'Academic Resources'

  -- Campus Updates: news, announcements, school updates
  WHEN lower(coalesce(category,'')) ~ '(news|update|announcement|university news|education news|school)' THEN 'Campus Updates'

  -- Student Spotlight
  WHEN lower(coalesce(category,'')) ~ '(spotlight|student|profile|interview|story)' THEN 'Student Spotlight'
  WHEN lower(coalesce(title,'')) ~ '(meet |spotlight|student of the|graduate story)' THEN 'Student Spotlight'

  -- Default to Articles
  ELSE 'Articles'
END;

-- Index for fast filtering on the new taxonomy
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_published 
  ON public.blog_posts(category, is_published, created_at DESC);
