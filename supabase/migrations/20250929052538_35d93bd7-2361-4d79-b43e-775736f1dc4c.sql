-- Fix rate limits table security - restrict access to admins only
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

-- Create proper admin-only policies for rate limits table
CREATE POLICY "Admins can view rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "System can insert rate limits" 
ON public.rate_limits 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update rate limits" 
ON public.rate_limits 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete rate limits" 
ON public.rate_limits 
FOR DELETE 
USING (is_admin(auth.uid()));