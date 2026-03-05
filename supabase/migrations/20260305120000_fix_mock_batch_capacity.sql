-- Migration to fix mock batch capacity management
-- This ensures batches are marked as inactive once they reach 30 students
-- and corrects the batch assignment logic

-- Step 1: Mark batches that are full (30+ registrations) as inactive
UPDATE public.mock_batches
SET is_active = false
WHERE id IN (
  SELECT batch_id
  FROM public.mock_registrations
  WHERE batch_id IS NOT NULL
  GROUP BY batch_id
  HAVING COUNT(*) >= 30
);

-- Step 2: Ensure the Physical Exam Batch remains active regardless
UPDATE public.mock_batches
SET is_active = true
WHERE title = 'Physical Exam Batch';

-- Step 3: Log what was updated for reference
-- (This is just a comment showing the operation)
-- Batches with 30+ registrations have been marked as inactive
-- This will force the getOrCreateBatch function to either:
-- a) Skip full batches and find one with available capacity
-- b) Create a new batch if no batch has room

-- Step 4: Create or update an index to improve batch lookup performance
CREATE INDEX IF NOT EXISTS idx_mock_batches_active_exam_date 
ON public.mock_batches(is_active, exam_date) 
WHERE is_active = true AND title != 'Physical Exam Batch';

-- Step 5: Add a trigger to automatically deactivate batches when they reach capacity
-- This prevents future issues where batches exceed 30 students
CREATE OR REPLACE FUNCTION public.check_batch_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count registrations in the batch being inserted
  SELECT COUNT(*) INTO v_count
  FROM public.mock_registrations
  WHERE batch_id = NEW.batch_id
  AND batch_id IS NOT NULL;
  
  -- If batch reaches 30 registrations, mark it as inactive
  IF v_count >= 30 THEN
    UPDATE public.mock_batches
    SET is_active = false
    WHERE id = NEW.batch_id
    AND title != 'Physical Exam Batch'; -- Keep physical batch always active
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_check_batch_capacity ON public.mock_registrations;

-- Create trigger that fires after each registration insert
CREATE TRIGGER trigger_check_batch_capacity
AFTER INSERT ON public.mock_registrations
FOR EACH ROW
EXECUTE FUNCTION public.check_batch_capacity();
