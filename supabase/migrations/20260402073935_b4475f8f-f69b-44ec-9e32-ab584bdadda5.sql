
-- Drop broken policies
DROP POLICY IF EXISTS "Admins can insert waec mock results" ON public.waec_mock_results;
DROP POLICY IF EXISTS "Admins can update waec mock results" ON public.waec_mock_results;
DROP POLICY IF EXISTS "Admins manage waec results" ON public.waec_mock_results;
DROP POLICY IF EXISTS "Students view own waec results" ON public.waec_mock_results;

-- Recreate with correct auth.uid() usage
CREATE POLICY "Admins manage waec results"
  ON public.waec_mock_results FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Students view own waec results"
  ON public.waec_mock_results FOR SELECT
  TO authenticated
  USING (user_id = (SELECT u.id FROM public.users u WHERE u.auth_user_id = auth.uid()));
