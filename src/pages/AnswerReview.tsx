import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Lightbulb,
  Target,
  Clock,
  Loader2,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuestionReview {
  id: string;
  question_text: string;
  type: string;
  options: any[];
  user_answer: any;
  correct_answer: any;
  is_correct: boolean;
  explanation: string;
  subject: string;
  difficulty_level: number;
  time_spent_seconds: number;
}

const AnswerReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  const attemptId = searchParams.get('attempt');

  useEffect(() => {
    if (attemptId) {
      fetchAnswerReview();
    } else {
      navigate('/dashboard');
    }
  }, [attemptId, navigate]);

  const fetchAnswerReview = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // First, get the user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Fetch attempt details to verify ownership
      const { data: attempt } = await supabase
        .from('attempts')
        .select('*')
        .eq('id', attemptId)
        .eq('user_id', userData.id)
        .single();

      if (!attempt) {
        toast({
          title: "Error",
          description: "Exam attempt not found or access denied",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Only show review for completed attempts
      if (attempt.status !== 'SUBMITTED') {
        toast({
          title: "Error",
          description: "Answer review is only available for completed exams",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      // Fetch answers with question details
      const { data: answers } = await supabase
        .from('attempt_answers')
        .select(`
          *,
          questions!inner(
            id,
            question_text,
            type,
            options,
            correct_answer,
            explanation,
            difficulty_level,
            subject_id,
            subjects(name)
          )
        `)
        .eq('attempt_id', attemptId);

      if (!answers) {
        toast({
          title: "Error",
          description: "Failed to load answers",
          variant: "destructive"
        });
        return;
      }

      // Transform the data
      const questionDetails: QuestionReview[] = answers.map(answer => ({
        id: answer.questions.id,
        question_text: answer.questions.question_text,
        type: answer.questions.type,
        options: Array.isArray(answer.questions.options) ? answer.questions.options : [],
        user_answer: answer.answer,
        correct_answer: answer.questions.correct_answer,
        is_correct: answer.is_correct,
        explanation: answer.questions.explanation || 'No explanation available',
        subject: answer.questions.subjects?.name || 'Unknown Subject',
        difficulty_level: answer.questions.difficulty_level || 1,
        time_spent_seconds: answer.time_spent_seconds || 0
      }));

      setQuestions(questionDetails);
    } catch (error) {
      console.error('Error fetching answer review:', error);
      toast({
        title: "Error",
        description: "Failed to load answer review",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const correctAnswers = questions.filter(q => q.is_correct);
  const incorrectAnswers = questions.filter(q => !q.is_correct);
  const getFilteredQuestions = () => {
    switch (activeTab) {
      case "correct":
        return correctAnswers;
      case "incorrect":
        return incorrectAnswers;
      default:
        return questions;
    }
  };

  const getDifficultyBadge = (level: number) => {
    switch (level) {
      case 1: return <Badge variant="secondary">Easy</Badge>;
      case 2: return <Badge variant="outline">Medium</Badge>;
      case 3: return <Badge variant="destructive">Hard</Badge>;
      default: return <Badge variant="secondary">Easy</Badge>;
    }
  };

  const formatOption = (option: string, index: number) => {
    return `${String.fromCharCode(65 + index)}. ${option}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading answer review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Answer Review</h1>
            <p className="text-muted-foreground mt-2">
              Review your answers and learn from explanations
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to={`/results?attempt=${attemptId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Results
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Correct Answers</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{correctAnswers.length}</div>
              <p className="text-xs text-muted-foreground">
                {questions.length > 0 ? Math.round((correctAnswers.length / questions.length) * 100) : 0}% accuracy
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incorrect Answers</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers.length}</div>
              <p className="text-xs text-muted-foreground">
                Areas for improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Answer Review Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="correct" className="text-green-600">
              Correct ({correctAnswers.length})
            </TabsTrigger>
            <TabsTrigger value="incorrect" className="text-red-600">
              Incorrect ({incorrectAnswers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6 mt-6">
            {getFilteredQuestions().map((question, index) => (
              <Card key={question.id} className="border-l-4" style={{
                borderLeftColor: question.is_correct ? '#22c55e' : '#ef4444'
              }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Question {index + 1}
                        {question.is_correct ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getDifficultyBadge(question.difficulty_level)}
                        <Badge variant="outline">{question.subject}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {Math.floor(question.time_spent_seconds / 60)}:{(question.time_spent_seconds % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Question:</h4>
                    <p className="text-foreground">{question.question_text}</p>
                  </div>

                  {question.options && question.options.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Options:</h4>
                      <div className="space-y-2">
                        {question.options.map((option: string, optIndex: number) => {
                          const isUserAnswer = question.user_answer === optIndex;
                          const isCorrectAnswer = question.correct_answer === optIndex;
                          
                          let bgColor = 'bg-muted';
                          let borderColor = 'border-muted';
                          let textColor = '';
                          
                          if (isCorrectAnswer && isUserAnswer) {
                            // User got it right
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            textColor = 'text-green-800';
                          } else if (isCorrectAnswer) {
                            // Correct answer (user didn't choose this)
                            bgColor = 'bg-green-50';
                            borderColor = 'border-green-200';
                            textColor = 'text-green-700';
                          } else if (isUserAnswer) {
                            // User's wrong answer
                            bgColor = 'bg-red-50';
                            borderColor = 'border-red-200';
                            textColor = 'text-red-800';
                          }
                          
                          return (
                            <div 
                              key={optIndex} 
                              className={`p-3 rounded border ${bgColor} ${borderColor} ${textColor}`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{formatOption(option, optIndex)}</span>
                                <div className="flex gap-2">
                                  {isCorrectAnswer && (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                      ✓ Correct Answer
                                    </Badge>
                                  )}
                                  {isUserAnswer && (
                                    <Badge variant={question.is_correct ? "default" : "destructive"}>
                                      Your Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Show answers for non-MCQ questions */}
                  {(!question.options || question.options.length === 0) && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Your Answer:</h4>
                        <div className={`p-3 rounded border ${
                          question.is_correct 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          {question.user_answer || 'No answer provided'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Correct Answer:</h4>
                        <div className="p-3 rounded border bg-green-50 border-green-200 text-green-700">
                          {question.correct_answer || 'Not available'}
                        </div>
                      </div>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
                          <p className="text-blue-800 text-sm">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {getFilteredQuestions().length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "correct" && "No correct answers to show"}
                    {activeTab === "incorrect" && "Great! No incorrect answers"}
                    {activeTab === "all" && "No questions available for review"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnswerReview;