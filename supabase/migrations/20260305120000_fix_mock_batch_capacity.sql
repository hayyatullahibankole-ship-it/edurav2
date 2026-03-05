-- Migration to fix mock batch capacity management
-- This ensures batches are marked as inactive once they reach 30 students
-- and corrects the batch assignment logic

-- Step 1: Add a batch_type column to distinguish virtual vs physical batches
-- This helps ensure proper batch assignment
ALTER TABLE public.mock_batches ADD COLUMN IF NOT EXISTS batch_type VARCHAR 
  CHECK (batch_type IN ('virtual', 'physical'));

-- Step 2: Set batch_type for all existing batches
-- Physical Exam Batch gets 'physical', all others get 'virtual'
UPDATE public.mock_batches
SET batch_type = CASE 
  WHEN title = 'Physical Exam Batch' THEN 'physical'
  ELSE 'virtual'
END
WHERE batch_type IS NULL;

-- Step 3: Mark batches that are full (30+ registrations) as inactive
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
AND batch_type = 'virtual';  -- Only deactivate virtual batches

-- Step 4: Ensure the Physical Exam Batch remains active regardless
UPDATE public.mock_batches
SET is_active = true
WHERE title = 'Physical Exam Batch';

-- Step 5: Create or update an index to improve batch lookup performance
CREATE INDEX IF NOT EXISTS idx_mock_batches_active_type_exam_date 
ON public.mock_batches(is_active, batch_type, exam_date) 
WHERE is_active = true;

-- Step 6: Add a filtered index for virtual batches only for query optimization
CREATE INDEX IF NOT EXISTS idx_mock_batches_virtual_active 
ON public.mock_batches(exam_date) 
WHERE is_active = true AND batch_type = 'virtual';

-- Step 7: Add a trigger to automatically deactivate batches when they reach capacity
-- This prevents future issues where batches exceed 30 students
CREATE OR REPLACE FUNCTION public.check_batch_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
  v_batch_type VARCHAR;
BEGIN
  -- Only process if batch_id is set
  IF NEW.batch_id IS NOT NULL THEN
    -- Get batch type
    SELECT batch_type INTO v_batch_type
    FROM public.mock_batches
    WHERE id = NEW.batch_id;
    
    -- Count registrations in the batch being inserted
    SELECT COUNT(*) INTO v_count
    FROM public.mock_registrations
    WHERE batch_id = NEW.batch_id;
    
    -- No longer mark batch as inactive when full; app logic will handle it
    -- IF v_count >= 30 AND v_batch_type = 'virtual' THEN
    --   UPDATE public.mock_batches
    --   SET is_active = false
    --   WHERE id = NEW.batch_id
    --   AND batch_type = 'virtual';
    -- END IF;
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

-- Enforce batch capacity at the database level
-- Step 1: Create a function to prevent inserts if batch is full
CREATE OR REPLACE FUNCTION public.enforce_batch_capacity()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
  v_batch_type VARCHAR;
BEGIN
  IF NEW.batch_id IS NOT NULL THEN
    SELECT batch_type INTO v_batch_type FROM public.mock_batches WHERE id = NEW.batch_id;
    IF v_batch_type = 'virtual' THEN
      SELECT COUNT(*) INTO v_count FROM public.mock_registrations WHERE batch_id = NEW.batch_id;
      IF v_count >= 30 THEN
        RAISE EXCEPTION 'Batch is full: no more registrations allowed for this batch.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create the BEFORE INSERT trigger
DROP TRIGGER IF EXISTS trigger_enforce_batch_capacity ON public.mock_registrations;
CREATE TRIGGER trigger_enforce_batch_capacity
BEFORE INSERT ON public.mock_registrations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_batch_capacity();

-- Step 8: Final verification and cleanup
-- Ensure Physical Exam Batch is properly configured
UPDATE public.mock_batches
SET 
  batch_type = 'physical',
  is_active = true
WHERE title = 'Physical Exam Batch';

-- Fix any incorrectly named batches (e.g., "Physical Exam Batch A" should be "Physical Exam Batch")
UPDATE public.mock_batches
SET 
  title = 'Physical Exam Batch',
  batch_type = 'physical',
  is_active = true
WHERE title LIKE 'Physical Exam Batch%' AND title != 'Physical Exam Batch';

-- Reassign any registrations from incorrectly named physical batches to the correct one
UPDATE public.mock_registrations
SET batch_id = (
  SELECT id FROM public.mock_batches 
  WHERE title = 'Physical Exam Batch' 
  LIMIT 1
)
WHERE batch_id IN (
  SELECT id FROM public.mock_batches 
  WHERE title LIKE 'Physical Exam Batch%' AND title != 'Physical Exam Batch'
);

-- Delete duplicate/incorrectly named physical batches
DELETE FROM public.mock_batches 
WHERE title LIKE 'Physical Exam Batch%' AND title != 'Physical Exam Batch';

-- Create or replace the auto_schedule_batch function with correct timing logic
-- This function creates virtual batches at fixed time slots: 9 AM (A), 12 PM (B), 3 PM (C)
CREATE OR REPLACE FUNCTION public.auto_schedule_batch()
RETURNS public.mock_batches AS $$
DECLARE
  v_batch public.mock_batches;
  v_target_date DATE;
  v_next_start TIMESTAMP WITH TIME ZONE;
  v_next_letter TEXT;
  v_found_slot BOOLEAN := false;
  
  -- Define fixed daily time slots for virtual batches
  v_time_slots TEXT[] := ARRAY['09:00:00', '12:00:00', '15:00:00'];
  v_slot_letters TEXT[] := ARRAY['A', 'B', 'C'];
BEGIN
  -- Find the current date to check for available slots
  -- Start with today's date
  v_target_date := CURRENT_DATE;
  
  -- If there are existing virtual batches, start from the latest date
  SELECT GREATEST(CURRENT_DATE, exam_date::DATE) INTO v_target_date
  FROM public.mock_batches
  WHERE batch_type = 'virtual' AND exam_date IS NOT NULL
  ORDER BY exam_date DESC
  LIMIT 1;
  
  -- If no batches exist, use April 2, 2026 as default start date (if it's in the future)
  IF v_target_date IS NULL THEN
    v_target_date := GREATEST(CURRENT_DATE, '2026-04-02'::DATE);
  END IF;
  
  -- Loop through dates starting from target_date until we find an available slot
  WHILE NOT v_found_slot LOOP
    -- Check each time slot for availability on current date
    FOR i IN 1..array_length(v_time_slots, 1) LOOP
      v_next_start := (v_target_date || ' ' || v_time_slots[i])::TIMESTAMP WITH TIME ZONE;
      v_next_letter := v_slot_letters[i];
      
      -- Check if this slot is already taken
      IF NOT EXISTS (
        SELECT 1 FROM public.mock_batches
        WHERE batch_type = 'virtual'
        AND exam_date::DATE = v_target_date
        AND title = 'Batch ' || v_next_letter
      ) THEN
        -- Slot is available, create the batch
        INSERT INTO public.mock_batches (
          title, 
          exam_date, 
          exam_venue,
          batch_type,
          is_active
        ) VALUES (
          'Batch ' || v_next_letter,
          v_next_start,
          NULL, -- exam_venue will be set by application
          'virtual',
          true
        )
        RETURNING * INTO v_batch;
        
        v_found_slot := true;
        EXIT;
      END IF;
    END LOOP;
    
    -- If no slots available on this date, move to next day
    IF NOT v_found_slot THEN
      v_target_date := v_target_date + INTERVAL '1 day';
    END IF;
  END LOOP;
  
  RETURN v_batch;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.auto_schedule_batch() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auto_schedule_batch() TO anon;
