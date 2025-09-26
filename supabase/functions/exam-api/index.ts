import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExamStartRequest {
  examId: string;
  selectedSubjects?: string[];
  deviceFingerprint: string;
}

interface AnswerSubmissionRequest {
  attemptId: string;
  questionId: string;
  answer: any;
  timeSpent: number;
}

interface ExamSubmissionRequest {
  attemptId: string;
  suspiciousActivities?: any[];
  proctorData?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/exam-api', '');

    // Get current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: userProfile } = await supabaseClient
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!userProfile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userProfile.id;

    switch (path) {
      case '/start':
        return await handleStartExam(req, supabaseClient, userId);
      
      case '/answer':
        return await handleSubmitAnswer(req, supabaseClient, userId);
      
      case '/submit':
        return await handleSubmitExam(req, supabaseClient, userId);
      
      case '/results':
        return await handleGetResults(req, supabaseClient, userId);
        
      case '/attempts':
        return await handleGetAttempts(req, supabaseClient, userId);

      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Exam API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleStartExam(req: Request, supabaseClient: any, userId: string) {
  const { examId, selectedSubjects, deviceFingerprint }: ExamStartRequest = await req.json();

  // Get exam details
  const { data: exam, error: examError } = await supabaseClient
    .from('exams')
    .select(`
      *,
      exam_subjects (
        subject_id,
        subject_name,
        question_count,
        is_mandatory
      )
    `)
    .eq('id', examId)
    .eq('is_published', true)
    .single();

  if (examError || !exam) {
    return new Response(JSON.stringify({ error: 'Exam not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate subject selection for JAMB
  if (exam.type === 'JAMB') {
    if (!selectedSubjects || selectedSubjects.length !== 3) {
      return new Response(JSON.stringify({ error: 'JAMB requires exactly 3 subjects plus English' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  // Check for active attempts
  const { data: activeAttempts } = await supabaseClient
    .from('attempts')
    .select('id')
    .eq('user_id', userId)
    .eq('exam_id', examId)
    .in('status', ['STARTED', 'IN_PROGRESS']);

  if (activeAttempts && activeAttempts.length > 0) {
    return new Response(JSON.stringify({ error: 'You already have an active attempt for this exam' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create new attempt
  const { data: attempt, error: attemptError } = await supabaseClient
    .from('attempts')
    .insert({
      user_id: userId,
      exam_id: examId,
      status: 'STARTED',
      selected_subjects: selectedSubjects,
      device_fingerprint: deviceFingerprint,
      time_remaining_seconds: exam.duration_minutes * 60,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })
    .select()
    .single();

  if (attemptError) {
    console.error('Attempt creation error:', attemptError);
    return new Response(JSON.stringify({ error: 'Failed to create exam attempt' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get questions for the attempt - First get all available questions to select from
  let questionQuery = supabaseClient.from('questions').select('id, subject_id, question_text, type, options, difficulty_level, media_urls, points, time_limit_seconds, tags');
  
  if (exam.type === 'JAMB') {
    // JAMB: English (60) + 3 selected subjects (40 each)
    const allSubjects = ['English Language', ...(selectedSubjects || [])];
    questionQuery = questionQuery.in('subject_id', allSubjects);
  } else if (exam.type === 'WAEC' && selectedSubjects) {
    questionQuery = questionQuery.in('subject_id', selectedSubjects);
  }

  const { data: allQuestions } = await questionQuery.eq('is_active', true);

  if (!allQuestions || allQuestions.length === 0) {
    return new Response(JSON.stringify({ error: 'No questions available for this exam' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Select random questions based on exam configuration
  const selectedQuestions = selectQuestionsForExam(allQuestions, exam, selectedSubjects);
  
  // Get secure question data without answers using our secure function
  const questionIds = selectedQuestions.map(q => q.id);
  const { data: secureQuestions, error: secureError } = await supabaseClient
    .rpc('get_exam_questions', { exam_question_ids: questionIds });

  if (secureError || !secureQuestions) {
    console.error('Error getting secure questions:', secureError);
    return new Response(JSON.stringify({ error: 'Failed to load exam questions' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Create attempt answers placeholders using the secure question data
  const attemptAnswers = secureQuestions.map((q: any) => ({
    attempt_id: attempt.id,
    question_id: q.id,
    answer: null,
    is_correct: false,
    time_spent_seconds: 0
  }));

  await supabaseClient.from('attempt_answers').insert(attemptAnswers);

  // Update attempt status to IN_PROGRESS
  await supabaseClient
    .from('attempts')
    .update({ status: 'IN_PROGRESS' })
    .eq('id', attempt.id);

  return new Response(JSON.stringify({
    attemptId: attempt.id,
    questions: secureQuestions.map((q: any) => ({
      ...q,
      options: shuffleArray(q.options || [])
    })),
    timeLimit: exam.duration_minutes * 60,
    examConfig: {
      type: exam.type,
      title: exam.title,
      instructions: exam.instructions,
      selectedSubjects
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSubmitAnswer(req: Request, supabaseClient: any, userId: string) {
  const { attemptId, questionId, answer, timeSpent }: AnswerSubmissionRequest = await req.json();

  // Verify attempt ownership
  const { data: attempt } = await supabaseClient
    .from('attempts')
    .select('id, user_id, status')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (!attempt || attempt.status !== 'IN_PROGRESS') {
    return new Response(JSON.stringify({ error: 'Invalid or inactive attempt' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Use secure function to validate answer without exposing correct answer
  const { data: isCorrect, error: validationError } = await supabaseClient
    .rpc('validate_question_answer', {
      question_id: questionId,
      submitted_answer: answer
    });

  if (validationError) {
    console.error('Answer validation error:', validationError);
    return new Response(JSON.stringify({ error: 'Failed to validate answer' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update attempt answer
  const { error } = await supabaseClient
    .from('attempt_answers')
    .upsert({
      attempt_id: attemptId,
      question_id: questionId,
      answer: answer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
      answered_at: new Date().toISOString()
    });

  if (error) {
    console.error('Answer submission error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save answer' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSubmitExam(req: Request, supabaseClient: any, userId: string) {
  const { attemptId, suspiciousActivities, proctorData }: ExamSubmissionRequest = await req.json();

  // Verify attempt ownership
  const { data: attempt } = await supabaseClient
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .eq('user_id', userId)
    .single();

  if (!attempt || attempt.status !== 'IN_PROGRESS') {
    return new Response(JSON.stringify({ error: 'Invalid or inactive attempt' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get exam details
  const { data: exam } = await supabaseClient
    .from('exams')
    .select('type')
    .eq('id', attempt.exam_id)
    .single();

  // Get all answers for this attempt
  const { data: answers } = await supabaseClient
    .from('attempt_answers')
    .select('*, questions(subject_id, points)')
    .eq('attempt_id', attemptId);

  if (!answers) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve answers' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Calculate results
  const result = calculateExamResults(answers, exam.type, attempt.selected_subjects);

  // Update attempt status
  await supabaseClient
    .from('attempts')
    .update({
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      suspicious_activity_count: suspiciousActivities?.length || 0,
      proctoring_data: proctorData || {}
    })
    .eq('id', attemptId);

  // Create result record
  const { data: resultRecord, error: resultError } = await supabaseClient
    .from('results')
    .insert({
      attempt_id: attemptId,
      raw_score: result.correctAnswers,
      scaled_score: result.scaledScore,
      percentage: result.percentage,
      subject_breakdown: result.subjectBreakdown,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      wrong_answers: result.wrongAnswers,
      unanswered: result.unanswered,
      time_taken_minutes: Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / (1000 * 60)),
      auto_graded: true
    })
    .select()
    .single();

  if (resultError) {
    console.error('Result creation error:', resultError);
    return new Response(JSON.stringify({ error: 'Failed to save results' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Log audit trail
  await supabaseClient.from('audit_logs').insert({
    actor_user_id: userId,
    action_type: 'EXAM_SUBMITTED',
    target_type: 'attempt',
    target_id: attemptId,
    details: {
      examId: attempt.exam_id,
      score: result.scaledScore || result.percentage,
      suspicious_activities: suspiciousActivities?.length || 0
    },
    ip_address: req.headers.get('x-forwarded-for') || 'unknown'
  });

  return new Response(JSON.stringify({
    resultId: resultRecord.id,
    ...result
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetResults(req: Request, supabaseClient: any, userId: string) {
  const url = new URL(req.url);
  const resultId = url.searchParams.get('resultId');
  const attemptId = url.searchParams.get('attemptId');

  let query = supabaseClient
    .from('results')
    .select(`
      *,
      attempts!inner (
        id,
        exam_id,
        user_id,
        status,
        started_at,
        submitted_at,
        exams (
          title,
          type
        )
      )
    `)
    .eq('attempts.user_id', userId);

  if (resultId) {
    query = query.eq('id', resultId);
  } else if (attemptId) {
    query = query.eq('attempt_id', attemptId);
  } else {
    return new Response(JSON.stringify({ error: 'Missing resultId or attemptId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: result, error } = await query.single();

  if (error || !result) {
    return new Response(JSON.stringify({ error: 'Result not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetAttempts(req: Request, supabaseClient: any, userId: string) {
  const { data: attempts, error } = await supabaseClient
    .from('attempts')
    .select(`
      id,
      status,
      started_at,
      submitted_at,
      exams (
        title,
        type
      ),
      results (
        raw_score,
        scaled_score,
        percentage
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch attempts' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(attempts), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
function selectQuestionsForExam(allQuestions: any[], exam: any, selectedSubjects?: string[]) {
  const questionsBySubject = groupBy(allQuestions, 'subject_id');
  const selectedQuestions: any[] = [];

  // JAMB: English (60) + 3 selected subjects (40 each) = 180 total
  if (exam.type === 'JAMB') {
    // Find English subject ID
    const englishSubjectId = Object.keys(questionsBySubject).find(id => 
      questionsBySubject[id].some((q: any) => q.subject_name?.toLowerCase().includes('english'))
    );
    
    if (englishSubjectId) {
      const englishQuestions = questionsBySubject[englishSubjectId] || [];
      const englishSelected = shuffleArray([...englishQuestions]).slice(0, 60);
      selectedQuestions.push(...englishSelected);
    }
    
    // Add 40 questions from each of the 3 selected subjects
    (selectedSubjects || []).slice(0, 3).forEach(subjectId => {
      const subjectQuestions = questionsBySubject[subjectId] || [];
      const subjectSelected = shuffleArray([...subjectQuestions]).slice(0, 40);
      selectedQuestions.push(...subjectSelected);
    });
  } else if (exam.type === 'WAEC') {
    // WAEC: 50-60 questions per subject based on subject requirements
    (selectedSubjects || []).forEach(subjectId => {
      const subjectQuestions = questionsBySubject[subjectId] || [];
      // WAEC standard: 50-60 questions per paper
      const questionCount = Math.min(Math.max(50, subjectQuestions.length), 60);
      const subjectSelected = shuffleArray([...subjectQuestions]).slice(0, questionCount);
      selectedQuestions.push(...subjectSelected);
    });
  } else {
    // Custom exam - use exam configuration
    if (exam.exam_subjects && exam.exam_subjects.length > 0) {
      exam.exam_subjects.forEach((examSubject: any) => {
        const subjectQuestions = questionsBySubject[examSubject.subject_id] || [];
        const questionCount = Math.min(examSubject.question_count, subjectQuestions.length);
        const subjectSelected = shuffleArray([...subjectQuestions]).slice(0, questionCount);
        selectedQuestions.push(...subjectSelected);
      });
    } else {
      // Fallback: select questions from all available subjects
      const totalNeeded = exam.total_questions || 40;
      const allShuffled = shuffleArray([...allQuestions]);
      selectedQuestions.push(...allShuffled.slice(0, totalNeeded));
    }
  }

  return shuffleArray(selectedQuestions);
}

function calculateExamResults(answers: any[], examType: string, selectedSubjects?: string[]) {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter((a: any) => a.is_correct).length;
  const wrongAnswers = answers.filter((a: any) => !a.is_correct && a.answer !== null).length;
  const unanswered = answers.filter((a: any) => a.answer === null).length;

  // Group by subject for breakdown
  const subjectBreakdown: { [key: string]: { total: number; correct: number; percentage: number; grade?: string } } = {};
  
  answers.forEach((answer: any) => {
    const subjectId = answer.questions?.subject_id;
    if (!subjectId) return;
    
    if (!subjectBreakdown[subjectId]) {
      subjectBreakdown[subjectId] = { total: 0, correct: 0, percentage: 0 };
    }
    
    subjectBreakdown[subjectId].total += 1;
    if (answer.is_correct) {
      subjectBreakdown[subjectId].correct += 1;
    }
  });

  // Calculate percentages and grades
  Object.keys(subjectBreakdown).forEach(subjectId => {
    const subject = subjectBreakdown[subjectId];
    subject.percentage = Math.round((subject.correct / subject.total) * 100);
    
    // Add WAEC grade for each subject
    if (examType === 'WAEC') {
      subject.grade = getWAECGrade(subject.percentage);
    }
  });

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  let result: any = {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unanswered,
    percentage,
    subjectBreakdown,
    examType
  };

  // Apply exam-specific scoring
  if (examType === 'JAMB') {
    // JAMB scaling: Raw score to 400-point scale (standard JAMB scoring)
    result.scaledScore = Math.round((correctAnswers / totalQuestions) * 400);
    result.rawScore = correctAnswers; // Out of 180 for JAMB
  } else if (examType === 'WAEC') {
    // WAEC uses percentage-based grading with letter grades
    result.overallGrade = getWAECGrade(percentage);
    result.rawScore = correctAnswers;
  } else {
    // Custom exam scoring
    result.rawScore = correctAnswers;
  }

  return result;
}

// WAEC Grading Scale (Nigerian Standard)
function getWAECGrade(percentage: number): string {
  if (percentage >= 85) return 'A1'; // Excellent
  if (percentage >= 75) return 'B2'; // Very Good
  if (percentage >= 65) return 'B3'; // Good
  if (percentage >= 55) return 'C4'; // Credit
  if (percentage >= 50) return 'C5'; // Credit
  if (percentage >= 45) return 'C6'; // Credit
  if (percentage >= 40) return 'D7'; // Pass
  if (percentage >= 35) return 'E8'; // Pass
  return 'F9'; // Fail
}

function checkAnswerCorrectness(userAnswer: any, correctAnswer: any): boolean {
  if (Array.isArray(correctAnswer)) {
    if (Array.isArray(userAnswer)) {
      return correctAnswer.length === userAnswer.length && 
             correctAnswer.every(val => userAnswer.includes(val));
    }
    return correctAnswer.includes(userAnswer);
  }
  
  return userAnswer === correctAnswer;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
