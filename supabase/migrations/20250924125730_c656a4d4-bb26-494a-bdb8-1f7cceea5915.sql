-- Confirm the email for akeemsulekz@gmail.com in the auth.users table
UPDATE auth.users 
SET email_confirmed_at = now(), 
    updated_at = now()
WHERE email = 'akeemsulekz@gmail.com' 
AND email_confirmed_at IS NULL;