-- Remove duplicate registrations (keep the earliest one)
DELETE FROM mock_registrations
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY phone ORDER BY created_at ASC) as rn
    FROM mock_registrations
  ) sub WHERE rn > 1
);

-- Add unique constraint on phone to prevent duplicate registrations at DB level
CREATE UNIQUE INDEX idx_mock_registrations_phone_unique 
ON public.mock_registrations (phone);

-- Also add unique constraint on email (only for non-null emails)
CREATE UNIQUE INDEX idx_mock_registrations_email_unique 
ON public.mock_registrations (email) 
WHERE email IS NOT NULL;