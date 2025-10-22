-- Create AKBOY Creative Hub content tables

-- Services table
CREATE TABLE IF NOT EXISTS public.akboy_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  short_description TEXT,
  full_description TEXT,
  icon_name VARCHAR(100),
  image_url TEXT,
  pricing_info TEXT,
  category VARCHAR(100),
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio/Projects table
CREATE TABLE IF NOT EXISTS public.akboy_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  project_url TEXT,
  client_name VARCHAR(200),
  completion_date DATE,
  tags JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events and Programs table
CREATE TABLE IF NOT EXISTS public.akboy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(300),
  event_type VARCHAR(100),
  registration_url TEXT,
  image_url TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.akboy_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(200) NOT NULL,
  role VARCHAR(200),
  company VARCHAR(200),
  content TEXT NOT NULL,
  image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.akboy_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  role VARCHAR(200) NOT NULL,
  bio TEXT,
  image_url TEXT,
  email VARCHAR(255),
  social_links JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries/Contact form submissions table
CREATE TABLE IF NOT EXISTS public.akboy_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  responded_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS public.akboy_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats/Metrics table for homepage
CREATE TABLE IF NOT EXISTS public.akboy_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(200) NOT NULL,
  value VARCHAR(100) NOT NULL,
  icon_name VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.akboy_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for active content
CREATE POLICY "Public can view active services" ON public.akboy_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active portfolio" ON public.akboy_portfolio FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active events" ON public.akboy_events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active testimonials" ON public.akboy_testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active team" ON public.akboy_team FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active faqs" ON public.akboy_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active stats" ON public.akboy_stats FOR SELECT USING (is_active = true);

-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries" ON public.akboy_inquiries FOR INSERT WITH CHECK (true);

-- Admin full access to all tables
CREATE POLICY "Admins can manage services" ON public.akboy_services FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage portfolio" ON public.akboy_portfolio FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage events" ON public.akboy_events FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage testimonials" ON public.akboy_testimonials FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage team" ON public.akboy_team FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view inquiries" ON public.akboy_inquiries FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update inquiries" ON public.akboy_inquiries FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage faqs" ON public.akboy_faqs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage stats" ON public.akboy_stats FOR ALL USING (is_admin(auth.uid()));

-- Insert default stats
INSERT INTO public.akboy_stats (label, value, icon_name, display_order) VALUES
('Years of Experience', '5+', 'Calendar', 1),
('Students Trained', '1000+', 'Users', 2),
('Projects Completed', '30+', 'Briefcase', 3),
('Success Rate', '98%', 'TrendingUp', 4)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_akboy_services_active ON public.akboy_services(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_akboy_portfolio_category ON public.akboy_portfolio(category, is_active);
CREATE INDEX IF NOT EXISTS idx_akboy_events_date ON public.akboy_events(event_date, is_active);
CREATE INDEX IF NOT EXISTS idx_akboy_inquiries_status ON public.akboy_inquiries(status, created_at);