-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create blog_posts table for admission news and updates
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  category VARCHAR DEFAULT 'general',
  tags JSONB DEFAULT '[]'::jsonb,
  author_id UUID,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some indexes for better performance
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_posts_featured ON public.blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

-- Insert sample blog posts for testing
INSERT INTO public.blog_posts (title, slug, content, excerpt, category, is_published, is_featured, published_at) VALUES
('JAMB 2024 Registration Opens - Important Updates', 'jamb-2024-registration-opens', 'The Joint Admissions and Matriculation Board (JAMB) has announced the opening of registration for the 2024 Unified Tertiary Matriculation Examination (UTME). Students planning to gain admission into Nigerian universities must complete their registration within the specified timeframe. Here are the key details you need to know about the registration process, requirements, and important dates to remember.', 'JAMB registration for 2024 is now open. Get all the important details and requirements here.', 'admissions', true, true, now()),
('WAEC Results 2024: How to Check Your Results', 'waec-results-2024-how-to-check', 'The West African Examinations Council (WAEC) has released the 2024 SSCE results. Here is a comprehensive guide on how to check your results online using the official WAEC portal. Follow these step-by-step instructions to access your results quickly and securely.', 'Step-by-step guide to checking your WAEC 2024 results online.', 'results', true, false, now()),
('Top 10 Study Tips for JAMB Success', 'top-10-study-tips-jamb-success', 'Preparing for JAMB can be challenging, but with the right strategies, you can achieve your target score. Here are our top 10 proven study tips that have helped thousands of students excel in their examinations. These techniques focus on effective time management, subject mastery, and exam strategy.', 'Discover proven study strategies that will help you excel in your JAMB examination.', 'study-tips', true, false, now()),
('New Universities Approved by NUC 2024', 'new-universities-approved-nuc-2024', 'The National Universities Commission (NUC) has approved several new universities for the 2024 academic session. Here is the complete list of newly approved institutions, their locations, and the courses they will be offering. This expansion provides more opportunities for students seeking higher education.', 'Complete list of newly approved universities by NUC for 2024 admission.', 'admissions', true, false, now());