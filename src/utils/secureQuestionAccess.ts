/**
 * SECURITY MODULE: Secure Question Access
 * 
 * This module provides secure access to question data, ensuring that
 * sensitive information like correct answers and explanations are only
 * accessible when appropriate.
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecureQuestion {
  id: string;
  question_text: string;
  type: string;
  options: any;
  difficulty_level: number;
  media_urls?: any;
  points?: number;
  time_limit_seconds?: number;
  subject_id: string;
  tags?: any;
}

export interface QuestionExplanation {
  explanation: string;
  correct_answer: any;
}

/**
 * Securely fetch questions for an active exam attempt
 * This function ensures students cannot see correct answers during the exam
 */
export async function getSecureExamQuestions(attemptId: string): Promise<SecureQuestion[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_student_exam_questions', { attempt_id_param: attemptId });
    
    if (error) {
      console.error('Error fetching secure questions:', error);
      throw new Error('Failed to load exam questions securely');
    }
    
    return data || [];
  } catch (error) {
    console.error('Secure question fetch failed:', error);
    throw error;
  }
}

/**
 * Securely validate a student's answer without exposing the correct answer
 */
export async function validateStudentAnswer(
  questionId: string, 
  submittedAnswer: any
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('validate_student_answer', {
        question_id_param: questionId,
        submitted_answer: submittedAnswer
      });
    
    if (error) {
      console.error('Error validating answer:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Answer validation failed:', error);
    return false;
  }
}

/**
 * Get question explanation and correct answer (only after submission)
 * This function only returns data if the user has submitted an attempt with this question
 */
export async function getQuestionExplanation(questionId: string): Promise<QuestionExplanation | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_question_explanation_secure', { question_id_param: questionId });
    
    if (error) {
      console.error('Error fetching explanation:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Explanation fetch failed:', error);
    return null;
  }
}

/**
 * Security audit log for question access attempts
 */
export function logQuestionAccess(action: string, questionId: string, details?: any) {
  // This will be logged automatically by the database functions
  console.log(`Question Access: ${action} - Question: ${questionId}`, details);
}