import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import SubjectBasedExamInterface from "@/components/SubjectBasedExamInterface";
import CBTOptimizer from "@/components/CBTOptimizer";

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
      setExamData(attempt);

      // Check if this is a practice attempt (has proctoring_data) or exam-based attempt
      const proctoringData = attempt.proctoring_data as any;
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

        const perSubject = proctoringData.question_count_per_subject || 40;

        // Fetch questions for each subject
        for (const subjectId of selectedSubjects) {
          console.log(`Fetching questions for subject: ${subjectId} (${subjectNameMap[subjectId]})`);
          
          const { data: subjectQuestions, error } = await supabase
            .from('questions')
            .select('*')
            .eq('subject_id', subjectId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(perSubject);

          if (error) {
            console.error(`Error fetching questions for subject ${subjectId}:`, error);
            continue;
          }

          console.log(`Found ${subjectQuestions?.length || 0} questions for ${subjectNameMap[subjectId]}`);

          if (subjectQuestions && subjectQuestions.length > 0) {
            // Transform questions to match the expected format
            const transformedQuestions = subjectQuestions.map((q, index) => ({
              id: allQuestions.length + index + 1,
              subject: subjectNameMap[subjectId] || 'Unknown',
              question: q.question_text,
              options: Array.isArray(q.options) ? 
                (q.options as string[]).map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`) : 
                [],
              correct: Array.isArray(q.options) ? 
                String.fromCharCode(65 + (typeof q.correct_answer === 'number' ? q.correct_answer : 0)) : 
                'A',
              explanation: q.explanation || '',
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
      
      // Update attempt status and save answers
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

      // Calculate score and prepare answers - Fix the indexing issue
      let correctCount = 0;
      const subjectStats: Record<string, { total: number; correct: number }> = {};
      
      const answerRecords = questions.map((question, questionIndex) => {
        // Use the question's ID minus 1 to match the answer key
        const answerKey = question.id - 1;
        const userAnswer = answers[answerKey];
        const isCorrect = userAnswer === question.correct;
        const subject = question.subject || 'General';
        
        subjectStats[subject] = subjectStats[subject] || { total: 0, correct: 0 };
        subjectStats[subject].total += 1;
        if (isCorrect) {
          correctCount++;
          subjectStats[subject].correct += 1;
        }
        
        return {
          attempt_id: attemptId,
          question_id: question.originalId,
          answer: userAnswer || null,
          is_correct: isCorrect,
          time_spent_seconds: Math.floor(timeTaken / questions.length)
        };
      });

      console.log('Inserting answer records...', { recordCount: answerRecords.length });
      
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .insert(answerRecords);

      if (answersError) {
        console.error('Error inserting answers:', answersError);
        throw answersError;
      }

      const percentage = (correctCount / questions.length) * 100;
      const wrongCount = questions.length - correctCount;
      const unansweredCount = questions.length - Object.keys(answers).length;

      // Build subject breakdown for analytics
      const subject_breakdown: Record<string, { total: number; correct: number; percentage: number }> = {};
      Object.entries(subjectStats).forEach(([subject, stats]) => {
        subject_breakdown[subject] = {
          total: stats.total,
          correct: stats.correct,
          percentage: Math.round((stats.correct / stats.total) * 100)
        };
      });

      console.log('Inserting results...', { correctCount, totalQuestions: questions.length, percentage });

      const { error: resultError } = await supabase
        .from('results')
        .insert({
          attempt_id: attemptId,
          raw_score: correctCount,
          total_questions: questions.length,
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          unanswered: unansweredCount,
          percentage: percentage,
          time_taken_minutes: Math.floor(timeTaken / 60),
          subject_breakdown
        });

      if (resultError) {
        console.error('Error inserting results:', resultError);
        throw resultError;
      }

      console.log('Exam submitted successfully!');
      
      toast({
        title: "Exam Submitted!",
        description: `You scored ${correctCount}/${questions.length} (${percentage.toFixed(1)}%)`,
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

  return (
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
  );
};

export default CBTExam;