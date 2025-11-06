-- Create the missing school subscription for the successful payment
-- This payment succeeded but subscription creation failed due to the foreign key constraint

INSERT INTO school_subscriptions (
  school_id,
  admin_user_id,
  student_seats,
  price_per_student,
  total_amount,
  status,
  start_date,
  end_date,
  payment_reference,
  auto_renew
)
SELECT 
  '41d8b883-0b05-4b75-b2b4-496169fc31f0'::uuid,
  '03f65cbb-0120-4196-87b2-5be200981b2f'::uuid,
  1,
  1000,
  1000,
  'ACTIVE'::subscription_status,
  NOW(),
  NOW() + INTERVAL '3 months',
  'sub_1762443520916_qmmvg59fh',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM school_subscriptions 
  WHERE payment_reference = 'sub_1762443520916_qmmvg59fh'
);