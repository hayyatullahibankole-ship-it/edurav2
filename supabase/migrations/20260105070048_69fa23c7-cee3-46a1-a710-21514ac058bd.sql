-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.promo_coupons;

-- Recreate with explicit WITH CHECK for inserts
CREATE POLICY "Admins can manage coupons" 
ON public.promo_coupons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);