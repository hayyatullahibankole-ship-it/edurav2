import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import SubjectBasedExamInterface from "@/components/SubjectBasedExamInterface";
import JambCBTInterface from "@/components/JambCBTInterface";
import CBTOptimizer from "@/components/CBTOptimizer";
import { calculateJAMBScore } from "@/utils/examScoring";

const CBTExam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const attemptId = searchParams.get('attempt');

  useEffect(() => {
    if (attemptId) {
      console.log('Loading exam for attempt:', attemptId);
      fetchExamData();
    } else {
      console.log('No attempt ID provided, redirecting to dashboard');
      // If no attempt ID, redirect to dashboard
      navigate('/dashboard');
    }
  }, [attemptId, navigate]);

  const fetchExamData = async () => {
    try {
      setLoading(true);

      // Fetch attempt data
      const { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      if (!attempt) {
        throw new Error('Attempt not found');
      }

      console.log('Loaded attempt data:', attempt);
      const proctoringData = attempt.proctoring_data as any;
      console.log('Proctoring data exam_type:', proctoringData?.exam_type);
      setExamData(attempt);

      // Check if this is a practice attempt (has proctoring_data) or exam-based attempt
      let allQuestions: any[] = [];

      if (proctoringData && attempt.selected_subjects) {
        // Practice attempt - fetch questions directly
        const selectedSubjects = Array.isArray(attempt.selected_subjects) 
          ? attempt.selected_subjects as string[]
          : [];
          
        if (selectedSubjects.length === 0) {
          throw new Error('No subjects selected for this test');
        }

        // Fetch subject names
        const { data: subjectRows } = await supabase
          .from('subjects')
          .select('id, name')
          .in('id', selectedSubjects);
          
        const subjectNameMap: Record<string, string> = {};
        (subjectRows || []).forEach((s: any) => subjectNameMap[s.id] = s.name);

      const isJamb = (proctoringData?.exam_type || '').toLowerCase() === 'jamb';

      // Fetch questions for each subject
      for (const subjectId of selectedSubjects) {
        console.log(`Fetching questions for subject: ${subjectId} (${subjectNameMap[subjectId]})`);
        const subjectName = subjectNameMap[subjectId] || 'Unknown';
        const perSubject = isJamb && subjectName.toLowerCase().includes('english') 
          ? 60 
          : (proctoringData.question_count_per_subject || 40);

        // SECURITY FIX: Use secure function to fetch questions without exposing answers
        const { data: subjectQuestions, error } = await supabase
          .rpc('get_student_exam_questions', { attempt_id_param: attemptId });

        if (error) {
          console.error(`Error fetching questions securely:`, error);
          continue;
        }

        console.log(`Found ${subjectQuestions?.length || 0} questions from secure function`);

        if (subjectQuestions && subjectQuestions.length > 0) {
          // Transform questions to match the expected format (no correct answers exposed)
          const transformedQuestions = subjectQuestions
            .filter(q => q.subject_id === subjectId) // Filter for current subject
            .slice(0, perSubject) // Limit per subject
            .map((q, index) => ({
              id: allQuestions.length + index + 1,
              subject: subjectNameMap[subjectId] || 'Unknown',
              question: q.question_text,
              options: Array.isArray(q.options) ? 
                (q.options as string[]).map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`) : 
                [],
              // Note: No 'correct' field - this prevents answer exposure
              explanation: '', // Will be loaded securely after submission
              difficulty: q.difficulty_level === 1 ? 'easy' as const : 
                         q.difficulty_level === 2 ? 'medium' as const : 'hard' as const,
              originalId: q.id
            }));

          allQuestions.push(...transformedQuestions);
        } else {
            console.warn(`No questions found for subject: ${subjectNameMap[subjectId] || subjectId}`);
          }
        }

        if (allQuestions.length === 0) {
          console.error('No questions loaded. Selected subjects:', selectedSubjects);
          throw new Error('No questions available for this test. Please contact support.');
        }

        console.log(`Successfully loaded ${allQuestions.length} questions for ${selectedSubjects.length} subjects`);
      } else if (attempt.exam_id) {
        // Exam-based attempt - use edge function to get questions
        const { data: examQuestions, error: questionsError } = await supabase.functions.invoke('exam-api/start', {
          body: { 
            examId: attempt.exam_id,
            selectedSubjects: attempt.selected_subjects 
          }
        });

        if (questionsError) throw questionsError;
        allQuestions = examQuestions.questions || [];
      } else {
        throw new Error('Invalid attempt configuration');
      }

      if (allQuestions.length === 0) {
        console.error('No questions loaded for attempt:', attemptId);
        setShowOptimizer(true);
        throw new Error('No questions available for this test. Please contact support.');
      }

      console.log(`Successfully loaded ${allQuestions.length} questions`);
      
      // Shuffle questions for practice attempts
      if (proctoringData) {
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);
      }
      
      setQuestions(allQuestions);

    } catch (error) {
      console.error('Error fetching exam data:', error);
      let errorMessage = "Failed to load test data";
      
      if (error instanceof Error) {
        if (error.message.includes('No subjects selected')) {
          errorMessage = "No subjects were selected for this test";
        } else if (error.message.includes('No questions available')) {
          errorMessage = "No questions available for the selected subjects";
        } else if (error.message.includes('not found')) {
          errorMessage = "Test session not found or has expired";
        } else if (error.message.includes('Invalid attempt')) {
          errorMessage = "Invalid test configuration";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (answers: {[key: number]: string}, timeTaken: number) => {
    try {
      console.log('Starting exam submission...', { attemptId, answersCount: Object.keys(answers).length });
      
      // We'll update attempt status AFTER saving answers to satisfy RLS

      // SECURITY FIX: Use secure validation instead of client-side answer checking
      let correctCount = 0;
      const subjectStats: Record<string, { total: number; correct: number }> = {};
      
      const answerRecords = [];
      
      // Process each question with secure validation
      console.log('Processing answers for submission:', {
        totalQuestions: questions.length,
        answersReceived: Object.keys(answers).length,
        answersSample: Object.entries(answers).slice(0, 3)
      });

      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        const question = questions[questionIndex];
        
        // FIX: Use question.id as the key (matches how answers are stored in interface)
        const userAnswer = answers[question.id];
        const subject = question.subject || 'General';
        
        console.log(`Processing question ${questionIndex}:`, {
          questionId: question.originalId,
          userAnswer,
          subject
        });
        
        // Initialize subject stats
        subjectStats[subject] = subjectStats[subject] || { total: 0, correct: 0 };
        subjectStats[subject].total += 1;
        
        // Use secure validation function (doesn't expose correct answer)
        let isCorrect = false;
        if (userAnswer && question.originalId) {
          try {
            // Convert letter-based answer to numeric format for validation
            let normalizedAnswer: string | number = userAnswer;
            
            // Handle different answer formats
            if (typeof userAnswer === 'string') {
              if (userAnswer.match(/^[A-D]\)/)) {
                // Format: "A) option text"
                const letter = userAnswer.charAt(0);
                normalizedAnswer = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
              } else if (userAnswer.match(/^[A-D]$/)) {
                // Format: "A"
                normalizedAnswer = userAnswer.charCodeAt(0) - 65;
              } else if (userAnswer.match(/^[0-3]$/)) {
                // Format: "0", "1", "2", "3"
                normalizedAnswer = parseInt(userAnswer);
              }
            }

            console.log('Validating answer:', {
              questionId: question.originalId,
              originalAnswer: userAnswer,
              normalizedAnswer
            });

            const { data: validationResult, error: validationError } = await supabase
              .rpc('validate_student_answer', {
                question_id_param: question.originalId,
                submitted_answer: JSON.stringify(normalizedAnswer)
              });
            
            if (validationError) {
              console.error('Error validating answer:', validationError);
              isCorrect = false;
            } else {
              isCorrect = validationResult === true;
              console.log('Validation result:', { isCorrect, validationResult });
            }
          } catch (error) {
            console.error('Error in secure validation:', error);
            isCorrect = false;
          }
        }
        
        if (isCorrect) {
          correctCount++;
          subjectStats[subject].correct += 1;
        }
        
        answerRecords.push({
          attempt_id: attemptId,
          question_id: question.originalId,
          answer: userAnswer || null,
          is_correct: isCorrect,
          time_spent_seconds: Math.floor(timeTaken / questions.length)
        });
      }

      console.log('Inserting answer records...', { recordCount: answerRecords.length });
      
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .insert(answerRecords);

      if (answersError) {
        console.error('Error inserting answers:', answersError);
        throw answersError;
      }

      // Now mark attempt as SUBMITTED (after answers are stored)
      const { error: attemptError } = await supabase
        .from('attempts')
        .update({ 
          status: 'SUBMITTED' as 'SUBMITTED',
          submitted_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (attemptError) {
        console.error('Error updating attempt:', attemptError);
        throw attemptError;
      }

      const percentage = (correctCount / questions.length) * 100;
      const wrongCount = questions.length - correctCount;
      // Fix unanswered count - count questions that actually have non-null answers
      const answeredCount = answerRecords.filter(record => record.answer !== null && record.answer !== undefined).length;
      const unansweredCount = questions.length - answeredCount;

      console.log('Calculated exam results:', {
        totalQuestions: questions.length,
        correctCount,
        answeredCount,
        unansweredCount,
        percentage
      });

      // Determine exam type from proctoring data
      const examType = ((examData?.proctoring_data as any)?.exam_type || 'CUSTOM').toUpperCase();
      
      // Calculate scaled score for JAMB
      let scaledScore = null;
      if (examType === 'JAMB') {
        scaledScore = calculateJAMBScore(correctCount, wrongCount, questions.length);
      }

      // Build subject breakdown for analytics
      const subject_breakdown: Record<string, { total: number; correct: number; percentage: number }> = {};
      Object.entries(subjectStats).forEach(([subject, stats]) => {
        subject_breakdown[subject] = {
          total: stats.total,
          correct: stats.correct,
          percentage: Math.round((stats.correct / stats.total) * 100)
        };
      });

      console.log('Inserting results...', { 
        correctCount, 
        wrongCount, 
        unansweredCount,
        totalQuestions: questions.length, 
        percentage, 
        scaledScore,
        examType 
      });

      const resultData: any = {
        attempt_id: attemptId,
        raw_score: correctCount,
        total_questions: questions.length,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unanswered: unansweredCount,
        percentage: percentage,
        time_taken_minutes: Math.floor(timeTaken / 60),
        subject_breakdown
      };

      // Add scaled score for JAMB exams
      if (scaledScore !== null) {
        resultData.scaled_score = scaledScore;
      }

      const { error: resultError } = await supabase
        .from('results')
        .insert(resultData);

      if (resultError) {
        console.error('Error inserting results:', resultError);
        throw resultError;
      }

      
      // Fire-and-forget: trigger instant SMS via edge function
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.functions.invoke('notify-result', {
          body: { attemptId, userId: user?.id }
        });
      } catch (e) {
        // Silent fail - SMS is optional
      }
      
      toast({
        title: "Exam Submitted!",
        description: scaledScore 
          ? `JAMB Score: ${scaledScore}/400 (${percentage.toFixed(1)}% - ${correctCount}/${questions.length})`
          : `You scored ${correctCount}/${questions.length} (${percentage.toFixed(1)}%)`,
      });

      navigate(`/results?attempt=${attemptId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      
      // More specific error messages
      let errorMessage = "Failed to submit exam. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('foreign key')) {
          errorMessage = "Error saving answers. Please contact support.";
        } else if (error.message.includes('duplicate')) {
          errorMessage = "This exam has already been submitted.";
        } else if (error.message.includes('permission')) {
          errorMessage = "Permission denied. Please log in again.";
        } else if (error.message.includes('violates row-level security')) {
          errorMessage = "Access denied. Please refresh and try again.";
        } else if (error.message.includes('attempt_answers')) {
          errorMessage = "Error saving your answers. Please try again.";
        } else {
          // Include the actual error message for debugging
          errorMessage = `Submission failed: ${error.message}`;
        }
      }
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your exam...</p>
        </div>
      </div>
    );
  }

  if (!examData || questions.length === 0) {
    if (showOptimizer && examData) {
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">CBT Exam Optimization</h1>
              <p className="text-muted-foreground">
                Analyzing and optimizing your exam configuration...
              </p>
            </div>
            
            <CBTOptimizer 
              examData={examData}
              questions={questions}
              onOptimize={() => {
                setShowOptimizer(false);
                navigate('/dashboard');
              }}
            />
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-lg font-medium mb-2">Unable to Load Test</p>
          <p className="text-muted-foreground mb-4">
            {!examData ? "Test session not found or has expired." : "No questions available for the selected subjects."}
          </p>
          <div className="text-sm text-muted-foreground mb-6 space-y-1">
            <p>This may happen if:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>The test was already completed</li>
              <li>The session has expired</li>
              <li>There are insufficient questions for your selected subjects</li>
              <li>The exam configuration needs optimization</li>
            </ul>
          </div>
          <div className="space-y-3">
            {examData && (
              <button 
                onClick={() => setShowOptimizer(true)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Optimize & Retry
              </button>
            )}
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urlExamType = searchParams.get('examType')?.toLowerCase();
  const proctorExamType = (examData?.proctoring_data as any)?.exam_type as string | undefined;
  const examType = (proctorExamType || urlExamType || '').toLowerCase();
  console.log('Detected exam type:', examType, 'urlExamType:', urlExamType, 'from proctoring_data:', examData?.proctoring_data);
  const isJambExam = examType === 'jamb';
  const isSubjectBasedExam = ['waec', 'neco', 'post-utme', 'custom'].includes(examType);
  console.log('isJambExam:', isJambExam, 'isSubjectBasedExam:', isSubjectBasedExam);

  return (
    <>
      {showOptimizer ? (
        <CBTOptimizer
          examData={examData}
          questions={questions}
          onOptimize={() => setShowOptimizer(false)}
        />
      ) : isJambExam ? (
        <JambCBTInterface
          examTitle={(examData?.proctoring_data as any)?.title || "JAMB CBT Practice Test"}
          examDescription={(examData?.proctoring_data as any)?.description || "Joint Admissions and Matriculation Board Computer Based Test"}
          questions={questions}
          duration={examData?.time_remaining_seconds ? Math.ceil(examData.time_remaining_seconds / 60) : ((examData?.proctoring_data as any)?.duration_minutes || 90)}
          onSubmit={handleExamSubmit}
        />
      ) : (
        <SubjectBasedExamInterface
          examTitle={(examData?.proctoring_data as any)?.title || "Practice Test"}
          examDescription={(examData?.proctoring_data as any)?.description || "Practice Examination"}
          questions={questions}
          duration={examData?.time_remaining_seconds ? Math.ceil(examData.time_remaining_seconds / 60) : ((examData?.proctoring_data as any)?.duration_minutes || 90)}
          onSubmit={handleExamSubmit}
          allowReview={true}
          showExplanations={false}
          antiCheatEnabled={true}
        />
      )}
    </>
  );
};

export default CBTExam;