-- Delete all exam attempt data and questions
-- Order matters due to foreign key relationships

-- Delete attempt answers first (references attempts and questions)
DELETE FROM attempt_answers;

-- Delete results (references attempts)
DELETE FROM results;

-- Delete attempts (references exams and users)
DELETE FROM attempts;

-- Delete all questions
DELETE FROM questions;

-- Reset any sequences if needed
-- Note: UUIDs don't use sequences, so no need to reset