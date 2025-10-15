import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MathRenderer } from '@/components/ui/math-renderer';
import { Clock, CheckCircle2 } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  options: any;
  correct_answer: any;
}

export default function LessonQuiz() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    if (lessonId && userProfile) {
      fetchQuizData();
    }
  }, [lessonId, userProfile]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);

      // Fetch lesson details
      const { data: lessonData } = await supabase
        .from('study_lessons')
        .select('title, content')
        .eq('id', lessonId)
        .single();

      if (lessonData) {
        setLessonTitle(lessonData.title);
      }

      // First, try to fetch manually assigned questions
      const { data: questionsData, error } = await supabase
        .from('lesson_questions')
        .select('*, questions(*)')
        .eq('lesson_id', lessonId)
        .order('display_order');

      if (error) throw error;

      let formattedQuestions = questionsData?.map((lq: any) => ({
        id: lq.questions.id,
        question_text: lq.questions.question_text,
        options: lq.questions.options,
        correct_answer: lq.questions.correct_answer
      })) || [];

      // If no manual questions, generate with AI
      if (formattedQuestions.length === 0 && lessonData?.content) {
        toast.info('Generating quiz questions...');
        
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(
          `https://zqapbmllkywsuywpfava.supabase.co/functions/v1/generate-lesson-quiz`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              lessonContent: lessonData.content,
              lessonTitle: lessonData.title,
              questionCount: 10
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to generate quiz questions');
        }

        const { questions: generatedQuestions } = await response.json();
        
        // Format AI-generated questions
        formattedQuestions = generatedQuestions.map((q: any, idx: number) => ({
          id: `ai-${idx}`,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        }));
      }

      setQuestions(formattedQuestions);

      if (formattedQuestions.length === 0) {
        toast.error('No quiz questions available for this lesson');
        navigate(`/study-hub/lesson/${lessonId}`);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
      navigate(`/study-hub/lesson/${lessonId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    let correctCount = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = typeof question.correct_answer === 'number' 
        ? question.correct_answer 
        : parseInt(question.correct_answer);

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const percentage = (correctCount / questions.length) * 100;
    const timeSpentMinutes = Math.ceil((600 - timeLeft) / 60);

    setScore(correctCount);
    setSubmitted(true);

    // If passed (60% or more), mark lesson as completed
    if (percentage >= 60 && userProfile) {
      try {
        const { error } = await supabase
          .from('lesson_completions')
          .upsert({
            user_id: userProfile.id,
            lesson_id: lessonId,
            quiz_score: correctCount,
            quiz_percentage: percentage,
            time_spent_minutes: timeSpentMinutes,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,lesson_id'
          });

        if (error) throw error;
        toast.success(`🎉 Lesson completed! Score: ${correctCount}/${questions.length}`);
      } catch (error) {
        console.error('Error saving completion:', error);
        toast.success(`Quiz completed! Score: ${correctCount}/${questions.length}`);
      }
    } else {
      toast.success(`Quiz completed! Score: ${correctCount}/${questions.length}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    const percentage = (score / questions.length) * 100;
    const passed = percentage >= 60;

    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className={`text-6xl font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                {percentage.toFixed(0)}%
              </div>
              <div className="text-xl">
                You scored {score} out of {questions.length}
              </div>
              {passed ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-lg font-semibold">Passed!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ✅ Lesson marked as completed
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You need at least 60% to pass. Keep studying and try again!
                </p>
              )}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(`/study-hub/lesson/${lessonId}`)}>
                  Back to Lesson
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{lessonTitle} - Quiz</h1>
            <p className="text-muted-foreground">{questions.length} questions</p>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-medium">
                  <MathRenderer content={question.question_text} />
                </div>

                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => 
                    setAnswers(prev => ({ ...prev, [question.id]: parseInt(value) }))
                  }
                >
                  {Array.isArray(question.options) ? (
                    question.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optIndex.toString()} id={`${question.id}-${optIndex}`} />
                        <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                          <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>{' '}
                          <MathRenderer content={option} />
                        </Label>
                      </div>
                    ))
                  ) : (
                    Object.entries(question.options).map(([key, value], optIndex) => (
                      <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={optIndex.toString()} id={`${question.id}-${optIndex}`} />
                        <Label htmlFor={`${question.id}-${optIndex}`} className="cursor-pointer">
                          <span className="font-medium">{key}.</span>{' '}
                          <MathRenderer content={String(value)} />
                        </Label>
                      </div>
                    ))
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
          >
            Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/study-hub/lesson/${lessonId}`)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
}
