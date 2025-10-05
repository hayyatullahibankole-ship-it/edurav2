-- Ensure results has a unique row per attempt to allow safe upserts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'results_attempt_id_key'
  ) THEN
    ALTER TABLE public.results
    ADD CONSTRAINT results_attempt_id_key UNIQUE (attempt_id);
  END IF;
END $$;
