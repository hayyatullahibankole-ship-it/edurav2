INSERT INTO public.waec_result_settings (result_published)
SELECT false
WHERE NOT EXISTS (
  SELECT 1 FROM public.waec_result_settings
);

CREATE POLICY "Admin insert waec settings"
ON public.waec_result_settings
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(
    (SELECT users.id FROM public.users WHERE users.auth_user_id = auth.uid()),
    'admin'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS waec_result_settings_singleton_idx
ON public.waec_result_settings ((true));