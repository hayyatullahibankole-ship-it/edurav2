-- Fix promo_coupons admin policy to use existing SECURITY DEFINER role helpers
-- (auth.uid() is auth.users id, while user_roles.user_id references public.users.id)

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.promo_coupons;

CREATE POLICY "Admins can manage coupons"
ON public.promo_coupons
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));