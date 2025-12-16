-- Create table for tutorial configurations (admin-managed)
CREATE TABLE public.akboy_tutorials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar NOT NULL,
  slug varchar NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  online_group_price numeric DEFAULT 0,
  online_private_price numeric DEFAULT 0,
  physical_group_price numeric DEFAULT 0,
  physical_private_price numeric DEFAULT 0,
  whatsapp_group_link text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for tutorial registrations
CREATE TABLE public.akboy_tutorial_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id uuid REFERENCES public.akboy_tutorials(id),
  -- Student Info
  full_name varchar NOT NULL,
  phone varchar NOT NULL,
  email varchar,
  gender varchar,
  academic_level varchar,
  student_photo_url text,
  -- Tutorial Selection
  tutorial_name varchar NOT NULL,
  mode_of_learning varchar NOT NULL, -- online/physical
  tutorial_type varchar NOT NULL, -- group/private
  price numeric NOT NULL,
  payment_proof_url text,
  -- Parent/Guardian Info
  guardian_name varchar,
  guardian_phone varchar,
  -- Additional Info
  referral_source varchar,
  special_requests text,
  -- Status
  status varchar DEFAULT 'pending', -- pending/verified/rejected
  payment_verified boolean DEFAULT false,
  payment_verified_at timestamp with time zone,
  payment_verified_by uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.akboy_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akboy_tutorial_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutorials
CREATE POLICY "Public can view active tutorials" ON public.akboy_tutorials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage tutorials" ON public.akboy_tutorials
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for registrations
CREATE POLICY "Anyone can submit registrations" ON public.akboy_tutorial_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all registrations" ON public.akboy_tutorial_registrations
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update registrations" ON public.akboy_tutorial_registrations
  FOR UPDATE USING (is_admin(auth.uid()));

-- Insert default tutorials
INSERT INTO public.akboy_tutorials (name, slug, description, online_group_price, online_private_price, physical_group_price, physical_private_price, display_order) VALUES
('JAMB & WAEC Exam Tutorials', 'jamb-waec', 'Comprehensive exam preparation for JAMB UTME and WAEC SSCE', 15000, 30000, 20000, 40000, 1),
('Graphics Design (Canva-Based)', 'graphics-design', 'Learn professional graphics design using Canva', 10000, 20000, 15000, 25000, 2),
('Web Design / Website Basics', 'web-design', 'Learn to create modern websites from scratch', 15000, 30000, 20000, 40000, 3),
('Quran Memorization & Tajweed', 'quran-memorization', 'Learn Quran memorization with proper Tajweed', 10000, 20000, 15000, 25000, 4);

-- Create storage bucket for tutorial uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('tutorial-uploads', 'tutorial-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tutorial uploads
CREATE POLICY "Anyone can upload tutorial files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tutorial-uploads');

CREATE POLICY "Anyone can view tutorial files" ON storage.objects
  FOR SELECT USING (bucket_id = 'tutorial-uploads');