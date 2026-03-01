-- Allow non-admins to create mock batches
-- This migration adds a permissive insert policy so that the client-side
-- registration flow can auto-create a batch when none is available. Previously
-- only admins were allowed to write to mock_batches, which resulted in RLS
-- errors during user registration.

ALTER TABLE public.mock_batches ENABLE ROW LEVEL SECURITY;

-- permit anyone (including anonymous) to insert batches
CREATE POLICY "Anyone can create batches" ON public.mock_batches
  FOR INSERT WITH CHECK (true);

-- existing admin policy remains for all other operations
-- (no changes required here)
