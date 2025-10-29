-- Insert Edura CBT Platform into the portfolio
INSERT INTO public.akboy_portfolio (
  title,
  category,
  description,
  project_url,
  client_name,
  images,
  tags,
  is_featured,
  is_active,
  display_order,
  completion_date
) 
SELECT 
  'Edura CBT Platform',
  'Web Development',
  'Africa''s most advanced educational platform with AI-powered learning and 10,000+ practice questions. Revolutionizing exam preparation for Nigerian students with cutting-edge technology and comprehensive study resources.',
  'https://edura.app',
  'Edura Education',
  '["https://edura.app/og-default.png"]'::jsonb,
  '["React", "AI", "Education", "Mobile-First", "TypeScript", "Supabase"]'::jsonb,
  true,
  true,
  0,
  CURRENT_DATE
WHERE NOT EXISTS (
  SELECT 1 FROM public.akboy_portfolio WHERE title = 'Edura CBT Platform'
);