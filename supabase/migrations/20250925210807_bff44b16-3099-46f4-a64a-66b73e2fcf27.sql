-- Safely clear all questions and any existing attempt answers that reference them
DELETE FROM attempt_answers; -- depends on questions
DELETE FROM questions;