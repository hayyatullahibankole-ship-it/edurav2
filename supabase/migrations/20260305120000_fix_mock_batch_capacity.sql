-- Migration to fix mock batch capacity management
-- This ensures batches are marked as inactive once they reach 30 students
-- and corrects the batch assignment logic

-- Step 1: Mark batches that are full (30+ registrations) as inactive
-- Only mark VIRTUAL batches (Batch A, B, C, etc) - NOT the Physical Exam Batch
UPDATE public.mock_batches
SET is_active = false
WHERE id IN (
  SELECT batch_id
  FROM public.mock_registrations
  WHERE batch_id IS NOT NULL
  GROUP BY batch_id
  HAVING COUNT(*) >= 30
)
AND title != 'Physical Exam Batch';  -- Never deactivate Physical Exam Batch

-- Step 2: Ensure the Physical Exam Batch remains active regardless
UPDATE public.mock_batches
SET is_active = true
WHERE title = 'Physical Exam Batch';

-- Step 3: Add a batch_type column to distinguish virtual vs physical batches
-- This helps ensure proper batch assignment
ALTER TABLE public.mock_batches ADD COLUMN IF NOT EXISTS batch_type VARCHAR DEFAULT 'virtual' 
  CHECK (batch_type IN ('virtual', 'physical'));

-- Step 4: Ensure Physical Exam Batch has correct type
UPDATE public.mock_batches
SET batch_type = 'physical'
WHERE title = 'Physical Exam Batch';

-- Step 5: Create or update an index to improve batch lookup performance
CREATE INDEX IF NOT EXISTS idx_mock_batches_active_exam_date 
ON public.mock_batches(is_active, batch_type, exam_date) 
WHERE is_active = true;

-- Step 6: Add a trigger to automatically deactivate batches when they reach capacity
-- This prevents future issues where batches exceed 30 students
CREATE OR REPLACE FUNCTION public.check_batch_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
  v_batch_type VARCHAR;
BEGIN
  -- Get batch type if batch_id is set
  IF NEW.batch_id IS NOT NULL THEN
    SELECT batch_type INTO v_batch_type
    FROM public.mock_batches
    WHERE id = NEW.batch_id;
    
    -- Count registrations in the batch being inserted
    SELECT COUNT(*) INTO v_count
    FROM public.mock_registrations
    WHERE batch_id = NEW.batch_id;
    
    -- If batch reaches 30 registrations, mark it as inactive
    -- BUT only if it's not a physical batch
    IF v_count >= 30 AND v_batch_type != 'physical' THEN
      UPDATE public.mock_batches
      SET is_active = false
      WHERE id = NEW.batch_id
      AND batch_type != 'physical'; -- Never deactivate physical batches
    END IF;
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
