import { useState, useEffect } from "react";
import ExamInterface from "@/components/ExamInterface";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CBTExam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const attemptId = searchParams.get('attempt');

  useEffect(() => {
    if (attemptId) {
      fetchExamData();
    } else {
      // If no attempt ID, redirect to dashboard
      navigate('/dashboard');
    }
  }, [attemptId, navigate]);

  const fetchExamData = async () => {
    try {
      setLoading(true);

      // Fetch attempt only (practice config stored in proctoring_data)
      const { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      setExamData(attempt);

      // Fetch questions for selected subjects
      const selectedSubjects = Array.isArray(attempt.selected_subjects) 
        ? attempt.selected_subjects as string[]
        : [];
      const { data: subjectRows } = await supabase
        .from('subjects')
        .select('id, name')
        .in('id', selectedSubjects);
      const subjectNameMap: Record<string, string> = {};
      (subjectRows || []).forEach((s: any) => subjectNameMap[s.id] = s.name);

      const perSubject = (attempt.proctoring_data as any)?.question_count_per_subject || 40;

      const allQuestions: any[] = [];

      for (const subjectId of selectedSubjects) {
        const questionCount = perSubject;
        
        const { data: subjectQuestions, error } = await supabase
          .from('questions')
          .select('*')
          .eq('subject_id', subjectId)
          .eq('is_active', true)
          .limit(questionCount);

        if (error) throw error;

        if (subjectQuestions) {
          // Transform questions to match the expected format
          const transformedQuestions = subjectQuestions.map((q, index) => ({
            id: allQuestions.length + index + 1,
            subject: subjectNameMap[subjectId] || 'Unknown',
            question: q.question_text,
            options: Array.isArray(q.options) ? (q.options as string[]).map((opt: string, i: number) => `${String.fromCharCode(65 + i)}) ${opt}`) : [],
            correct: Array.isArray(q.options) ? String.fromCharCode(65 + (typeof q.correct_answer === 'number' ? q.correct_answer : 0)) : 'A',
            explanation: q.explanation || '',
            difficulty: q.difficulty_level === 1 ? 'easy' as const : q.difficulty_level === 2 ? 'medium' as const : 'hard' as const,
            originalId: q.id
          }));

          allQuestions.push(...transformedQuestions);
        }
      }

      // Shuffle questions
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);

    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast({
        title: "Error",
        description: "Failed to load exam data",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleExamSubmit = async (answers: {[key: number]: string}, timeTaken: number) => {
    try {
      // Update attempt status and save answers
      const { error: attemptError } = await supabase
        .from('attempts')
        .update({ 
          status: 'SUBMITTED' as 'SUBMITTED',
          submitted_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (attemptError) throw attemptError;

      // Calculate score
      let correctCount = 0;
      const answerRecords = questions.map((question, index) => {
        const isCorrect = answers[index] === question.correct;
        if (isCorrect) correctCount++;
        
        return {
          attempt_id: attemptId,
          question_id: question.originalId,
          answer: answers[index] || null,
          is_correct: isCorrect,
          time_spent_seconds: Math.floor(timeTaken / questions.length)
        };
      });

      const { error: answersError } = await supabase
        .from('attempt_answers')
        .insert(answerRecords);

      if (answersError) throw answersError;

      const percentage = (correctCount / questions.length) * 100;
      const wrongCount = questions.length - correctCount;
      const unansweredCount = questions.length - Object.keys(answers).length;

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
          time_taken_minutes: Math.floor(timeTaken / 60)
        });

      if (resultError) throw resultError;

      toast({
        title: "Exam Submitted!",
        description: `You scored ${correctCount}/${questions.length} (${percentage.toFixed(1)}%)`,
      });

      navigate(`/results?attempt=${attemptId}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No exam data found</p>
          <p className="text-muted-foreground mb-4">Unable to load the exam. Please try again.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamInterface
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