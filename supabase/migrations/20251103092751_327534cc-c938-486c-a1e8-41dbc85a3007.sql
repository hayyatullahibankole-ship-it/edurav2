-- Add school_student and school_admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'school_student';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'school_admin';