-- Upgrade existing school students from Basic Access to Pro subscription
-- This fixes students that were created with free accounts

-- Update all school students' subscriptions to Pro plan
UPDATE public.subscriptions s
SET 
  plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'Pro' LIMIT 1),
  end_date = COALESCE(
    (
      SELECT ss.end_date 
      FROM public.school_students st
      JOIN public.schools sch ON st.school_id = sch.id
      JOIN public.school_subscriptions ss ON ss.school_id = sch.id
      WHERE st.user_id = s.user_id 
        AND ss.status = 'ACTIVE'
      ORDER BY ss.created_at DESC
      LIMIT 1
    ),
    NOW() + INTERVAL '1 year'
  ),
  updated_at = NOW()
FROM public.users u
WHERE s.user_id = u.id
  AND u.email LIKE '%@%.edu.ng'
  AND s.status = 'ACTIVE'
  AND s.plan_id = (SELECT id FROM public.subscription_plans WHERE name = 'Basic Access' LIMIT 1);