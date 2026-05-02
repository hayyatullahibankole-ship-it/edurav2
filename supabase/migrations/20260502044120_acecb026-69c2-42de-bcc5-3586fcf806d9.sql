
-- 1) Recategorize posts by content type based on title keywords
UPDATE public.blog_posts SET category = CASE
  WHEN title ~* '(scholarship|bursary|grant|fellowship|bea )' THEN 'Scholarships'
  WHEN title ~* '(jamb|utme|waec|neco|nabteb|gce|post[- ]?utme|cbt)' THEN 'Exams & JAMB'
  WHEN title ~* '(accredit|nuc full|nuc 100%|nbte|approval)' THEN 'Accreditation'
  WHEN title ~* '(convocation|matriculation|inaugural|festival|ceremony|seminar|workshop|conference)' THEN 'Convocation & Events'
  WHEN title ~* '(academic calendar|resumption|semester|timetable|examination time|lecture)' THEN 'Academic Calendar'
  WHEN title ~* '(intern|recruitment|job|vacancy|career|hiring|graduate trainee)' THEN 'Career & Internships'
  WHEN title ~* '(admission form|admission|releases.*form|registration|application|admission list|cut.?off)' THEN 'Admissions'
  WHEN title ~* '(study tip|past question|syllabus|how to|guide to|tutorial)' THEN 'Study Tips'
  ELSE 'News & Updates'
END
WHERE is_published = true;

-- 2) Auto-populate `school` from title (Nigerian institutions)
UPDATE public.blog_posts SET school = CASE
  WHEN title ~* '\m(LASU|LAGOS STATE UNIVERSITY)\M' THEN 'LASU'
  WHEN title ~* '\m(UNILAG|UNIVERSITY OF LAGOS)\M' THEN 'UNILAG'
  WHEN title ~* '\m(UI|UNIVERSITY OF IBADAN)\M' THEN 'UI'
  WHEN title ~* '\m(OAU|OBAFEMI AWOLOWO)\M' THEN 'OAU'
  WHEN title ~* '\m(UNIOSUN|OSUN STATE UNIVERSITY)\M' THEN 'UNIOSUN'
  WHEN title ~* '\m(UNIBEN|UNIVERSITY OF BENIN)\M' THEN 'UNIBEN'
  WHEN title ~* '\m(UNIPORT|UNIVERSITY OF PORT[- ]?HARCOURT)\M' THEN 'UNIPORT'
  WHEN title ~* '\m(UNIZIK|NNAMDI AZIKIWE)\M' THEN 'UNIZIK'
  WHEN title ~* '\m(UNILORIN|UNIVERSITY OF ILORIN)\M' THEN 'UNILORIN'
  WHEN title ~* '\m(ABU|AHMADU BELLO)\M' THEN 'ABU'
  WHEN title ~* '\m(FUTA|FEDERAL UNIVERSITY OF TECHNOLOGY,? AKURE)\M' THEN 'FUTA'
  WHEN title ~* '\m(FUTMINNA|FUT MINNA)\M' THEN 'FUTMINNA'
  WHEN title ~* '\m(OOU|OLABISI ONABANJO)\M' THEN 'OOU'
  WHEN title ~* '\m(BUK|BAYERO UNIVERSITY)\M' THEN 'BUK'
  WHEN title ~* '\m(FUOYE|FEDERAL UNIVERSITY,? OYE)\M' THEN 'FUOYE'
  WHEN title ~* '\m(LAUTECH|LADOKE AKINTOLA)\M' THEN 'LAUTECH'
  WHEN title ~* '\m(NOUN|NATIONAL OPEN UNIVERSITY)\M' THEN 'NOUN'
  WHEN title ~* '\m(EBSU|EBONYI STATE UNIVERSITY)\M' THEN 'EBSU'
  WHEN title ~* '\m(KSP|KOGI STATE POLYTECHNIC)\M' THEN 'KOGI POLY'
  WHEN title ~* '\m(IBADANPOLY|POLYTECHNIC,? IBADAN)\M' THEN 'IBADAN POLY'
  WHEN title ~* 'YOBE STATE UNIVERSITY' THEN 'YSU'
  WHEN title ~* 'FEDERAL UNIVERSITY,? LAFIA' THEN 'FULAFIA'
  WHEN title ~* 'FEDERAL UNIVERSITY OF HEALTH SCIENCES.*ILA[- ]?ORANGUN' THEN 'FUHSI'
  WHEN title ~* 'AJAYI CROWTHER' THEN 'ACU'
  WHEN title ~* 'CRESCENT UNIVERSITY' THEN 'Crescent University'
  WHEN title ~* 'ELIZADE UNIVERSITY' THEN 'Elizade University'
  WHEN title ~* 'REDEEMER''?S UNIVERSITY' THEN 'Redeemer''s University'
  WHEN title ~* 'KHALIFA ISYAKU RABIU' THEN 'KIRU'
  WHEN title ~* 'STATE UNIVERSITY OF MEDICAL.*ENUGU|SUMAS' THEN 'SUMAS'
  WHEN title ~* '\mJAMB\M' THEN 'JAMB'
  WHEN title ~* '\mWAEC\M' THEN 'WAEC'
  WHEN title ~* '\mNECO\M' THEN 'NECO'
  WHEN title ~* '\mJUPEB\M' THEN 'JUPEB'
  WHEN title ~* '\mNUC\M' THEN 'NUC'
  WHEN title ~* 'COLLEGE OF NURSING' THEN 'College of Nursing'
  WHEN title ~* 'COLLEGE OF HEALTH' THEN 'College of Health'
  WHEN title ~* 'POLYTECHNIC|\mPOLY\M' THEN 'Polytechnic'
  WHEN title ~* 'COLLEGE OF EDUCATION' THEN 'College of Education'
  WHEN title ~* 'UNIVERSITY' THEN 'Other University'
  ELSE 'Other'
END
WHERE is_published = true;

-- 3) Set institution_type
UPDATE public.blog_posts SET institution_type = CASE
  WHEN school IN ('JAMB','WAEC','NECO','JUPEB','NUC') THEN 'Agency'
  WHEN school ILIKE '%poly%' OR school ILIKE '%Polytechnic%' THEN 'Polytechnic'
  WHEN school ILIKE 'College of%' THEN 'College'
  WHEN school IS NOT NULL THEN 'University'
  ELSE NULL
END
WHERE is_published = true;

-- 4) Index for school filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_school_published ON public.blog_posts(school, is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_inst_type_published ON public.blog_posts(institution_type, is_published);
