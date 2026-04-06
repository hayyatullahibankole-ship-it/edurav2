
INSERT INTO public.mock_settings (key, value) VALUES
  ('brand_name', '""'),
  ('brand_logo_url', '""'),
  ('brand_tagline', '""'),
  ('brand_color', '"#f97316"'),
  ('brand_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
