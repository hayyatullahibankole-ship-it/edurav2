-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule monthly subscription reminders
-- Runs on the 1st of every month at 9:00 AM UTC
SELECT cron.schedule(
  'send-monthly-subscription-reminders',
  '0 9 1 * *', -- At 9:00 AM on the 1st day of every month
  $$
  SELECT
    net.http_post(
      url := 'https://zqapbmllkywsuywpfava.supabase.co/functions/v1/send-subscription-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXBibWxsa3l3c3V5d3BmYXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTA5NDgsImV4cCI6MjA3NDI4Njk0OH0.uZmBzHcTI3oBiigUv_QCVkYF5Nh5_dK21qQtdpzjkUI'
      ),
      body := jsonb_build_object('scheduled_run', now())
    ) as request_id;
  $$
);

-- Also schedule a weekly reminder (every Sunday at 9:00 AM)
-- This catches subscriptions ending within the next 7 days
SELECT cron.schedule(
  'send-weekly-subscription-reminders',
  '0 9 * * 0', -- At 9:00 AM every Sunday
  $$
  SELECT
    net.http_post(
      url := 'https://zqapbmllkywsuywpfava.supabase.co/functions/v1/send-subscription-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXBibWxsa3l3c3V5d3BmYXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MTA5NDgsImV4cCI6MjA3NDI4Njk0OH0.uZmBzHcTI3oBiigUv_QCVkYF5Nh5_dK21qQtdpzjkUI'
      ),
      body := jsonb_build_object('scheduled_run', now())
    ) as request_id;
  $$
);
