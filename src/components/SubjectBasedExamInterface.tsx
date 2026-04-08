import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MathRenderer } from "@/components/ui/math-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  CheckCircle2,
  Circle,
  AlertTriangle,
  BookOpen,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Save,
  Target,
  Check
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from "@/hooks/use-toast";

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correct: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  originalId?: string;
}

interface SubjectQuestions {
  subject: string;
  questions: Question[];
  completed: boolean;
  score?: number;
}

interface ExamInterfaceProps {
  examTitle?: string;
  examDescription?: string;
  questions: Question[];
  duration: number; // in minutes
  onSubmit: (answers: {[key: number]: string}, timeTaken: number) => void;
  allowReview?: boolean;
  showExplanations?: boolean;
  antiCheatEnabled?: boolean;
}

const SubjectBasedExamInterface: React.FC<ExamInterfaceProps> = ({
  examTitle = "Practice Exam",
  examDescription = "Mixed Subjects Test",
  questions,
  duration,
  onSubmit,
  allowReview = true,
  showExplanations = false,
  antiCheatEnabled = true
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { canAccessPremium, loading: subscriptionLoading } = useSubscription();

  // Subject-based state
  const [currentSubject, setCurrentSubject] = useState<string>("");
  const [currentQuestionInSubject, setCurrentQuestionInSubject] = useState(0);
  const [subjectQuestions, setSubjectQuestions] = useState<SubjectQuestions[]>([]);

  // Group questions by subject
  useEffect(() => {
    const groupedQuestions = questions.reduce((acc, question) => {
      const subject = question.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(question);
      return acc;
    }, {} as {[key: string]: Question[]});

    const subjectData: SubjectQuestions[] = Object.entries(groupedQuestions).map(([subject, qs]) => ({
      subject,
      questions: qs,
      completed: false,
      score: 0
    }));

    setSubjectQuestions(subjectData);
    if (subjectData.length > 0) {
      setCurrentSubject(subjectData[0].subject);
    }
  }, [questions]);

  const currentSubjectData = subjectQuestions.find(s => s.subject === currentSubject);
  const currentQuestion = currentSubjectData?.questions[currentQuestionInSubject];
  const globalQuestionIndex = currentQuestion ? currentQuestion.id - 1 : 0;

  const hasAutoSubmittedRef = useRef(false);

  const handleAutoSubmit = useCallback(() => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    toast.info("Time is up! Your exam is being submitted automatically.");
    const totalTime = duration * 60;
    const timeTaken = totalTime - timeLeft;
    onSubmit(answers, timeTaken);
  }, [answers, duration, timeLeft, onSubmit]);

  // Timer effect with auto-submit on time expiry
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-submit all answers when time expires (JAMB/WAEC standard)
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, handleAutoSubmit]);

  // Anti-cheat monitoring
  useEffect(() => {
    if (!antiCheatEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isPaused) {
        setTabSwitchCount(prev => prev + 1);
        setShowWarning(true);
        toast({
          title: "Warning: Tab Switch Detected",
          description: "Switching tabs during exam is monitored",
          variant: "destructive"
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || 
          (e.ctrlKey && e.key === 'u') || (e.ctrlKey && e.shiftKey && e.key === 'C')) {
        e.preventDefault();
        setShowWarning(true);
        toast({
          title: "Warning: Restricted Action",
          description: "Developer tools access is monitored",
          variant: "destructive"
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Warning: Right-click Disabled",
        description: "Context menu is disabled during exam",
        variant: "destructive"
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [antiCheatEnabled, isPaused]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleFlagQuestion = () => {
    if (!currentQuestion) return;
    const questionIndex = globalQuestionIndex;
    setFlagged(prev => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionIndex)) {
        newFlagged.delete(questionIndex);
      } else {
        newFlagged.add(questionIndex);
      }
      return newFlagged;
    });
  };

  const confirmSubmit = () => {
    if (!subscriptionLoading && !canAccessPremium) {
      setShowSubmitDialog(false);
      setShowUpgradeDialog(true);
      return;
    }
    setShowSubmitDialog(false);
    const totalTime = duration * 60;
    const timeTaken = totalTime - timeLeft;
    onSubmit(answers, timeTaken);
  };

  const handleManualSubmit = () => {
    setShowSubmitDialog(true);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const nextQuestionInSubject = () => {
    if (!currentSubjectData) return;
    if (currentQuestionInSubject < currentSubjectData.questions.length - 1) {
      setCurrentQuestionInSubject(prev => prev + 1);
    }
  };

  const prevQuestionInSubject = () => {
    if (currentQuestionInSubject > 0) {
      setCurrentQuestionInSubject(prev => prev - 1);
    }
  };

  const switchToSubject = (subject: string) => {
    setCurrentSubject(subject);
    setCurrentQuestionInSubject(0);
  };

  const getSubjectProgress = (subject: string) => {
    const subjectData = subjectQuestions.find(s => s.subject === subject);
    if (!subjectData) return 0;
    
    const answeredCount = subjectData.questions.filter(q => 
      answers.hasOwnProperty(q.id - 1)
    ).length;
    
    return Math.round((answeredCount / subjectData.questions.length) * 100);
  };

  const getSubjectScore = (subject: string) => {
    const subjectData = subjectQuestions.find(s => s.subject === subject);
    if (!subjectData) return 0;
    
    // SECURITY FIX: Remove client-side score calculation
    // All scoring will be done securely on the server during submission
    // This prevents exposure of correct answers to determine scores
    return 0; // Placeholder - real scores calculated securely
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  if (!currentQuestion || !currentSubjectData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">📚</div>
              <div>
                <h1 className="text-lg font-bold">{examTitle}</h1>
                <p className="text-xs opacity-90">{examDescription}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className={`flex items-center px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                timeLeft < 300 ? 'bg-red-600 animate-pulse' : 'bg-white/20'
              }`}>
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeLeft)}
              </div>
              
              {/* Controls */}
              <Button
                size="sm"
                onClick={togglePause}
                className="bg-white/20 hover:bg-white/30 h-9 px-3"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              
              <Button
                size="sm"
                onClick={handleManualSubmit}
                className="bg-white text-orange-600 hover:bg-white/90 font-bold h-9 px-4"
              >
                Submit
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{answeredCount}/{questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Tabs */}
      {subjectQuestions.length > 0 && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {subjectQuestions.map((subject) => {
                const answeredInSubject = subject.questions.filter(q => answers[q.id] !== undefined).length;
                const isActive = currentSubject === subject.subject;
                return (
                  <button
                    key={subject.subject}
                    onClick={() => {
                      setCurrentSubject(subject.subject);
                      setCurrentQuestionInSubject(0);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    {subject.subject}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                      isActive ? "bg-white/30" : "bg-gray-100"
                    )}>
                      {answeredInSubject}/{subject.questions.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showWarning && (
        <div className="max-w-7xl mx-auto px-4 py-2 mt-2">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Suspicious activity detected. Tab switches: {tabSwitchCount}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className={cn("grid gap-4 lg:grid-cols-[1fr_280px]")}>
          {/* Question Area */}
          <div className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">
                    Question {currentQuestionInSubject + 1}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-medium border-orange-200 bg-orange-50 text-orange-700">
                    {currentSubject}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question Text */}
                <div className="p-4 rounded-xl bg-gray-50 border">
                  <MathRenderer
                    content={currentQuestion.question}
                    className="text-base font-medium leading-relaxed"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === option;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all",
                          isSelected
                            ? "border-orange-500 bg-orange-50 shadow-md"
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30"
                        )}
                      >
                        <div className="flex items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full border-2 mr-3 flex items-center justify-center font-bold text-sm",
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-gray-300 text-gray-500"
                          )}>
                            {isSelected ? <Check className="h-4 w-4" /> : String.fromCharCode(65 + index)}
                          </div>
                          <MathRenderer content={option} className="flex-1 text-sm" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={prevQuestionInSubject}
                    disabled={currentQuestionInSubject === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-sm font-semibold text-orange-600">
                    {currentQuestionInSubject + 1} / {currentSubjectData?.questions.length}
                  </span>

                  <Button
                    onClick={nextQuestionInSubject}
                    disabled={currentQuestionInSubject === (currentSubjectData?.questions.length || 0) - 1}
                    className="bg-orange-500 hover:bg-orange-600"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Question Navigation Grid */}
            <Card className="border">
              <CardHeader className="py-2 px-3 border-b bg-gray-50">
                <CardTitle className="text-xs font-semibold text-gray-600">
                  {currentSubject || 'All Questions'} — Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-5 gap-1.5">
                  {currentSubjectData?.questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionInSubject;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionInSubject(idx)}
                        className={cn(
                          "w-full aspect-square rounded-lg border text-xs font-bold flex items-center justify-center transition-all",
                          isCurrent && "bg-orange-500 text-white border-orange-500 shadow-md",
                          !isCurrent && isAnswered && "bg-green-100 text-green-700 border-green-300",
                          !isCurrent && !isAnswered && "bg-white text-gray-400 border-gray-200 hover:border-orange-300"
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-500" /> Current
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Answered
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-white border border-gray-200" /> Unanswered
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card className="border bg-orange-50">
              <CardContent className="p-3">
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-bold text-green-600">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flagged:</span>
                    <span className="font-bold text-yellow-600">{flagged.size}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-bold text-red-600">{questions.length - answeredCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center pb-3">
            <DialogTitle className="text-xl font-bold">Submit Exam?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
                <div className="text-xs text-gray-500">Answered</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{flagged.size}</div>
                <div className="text-xs text-gray-500">Flagged</div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="text-2xl font-bold text-red-600">{questions.length - answeredCount}</div>
                <div className="text-xs text-gray-500">Unanswered</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1 h-11">
                Continue Exam
              </Button>
              <Button onClick={confirmSubmit} className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 font-bold">
                Submit Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Required Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="text-lg font-bold">Upgrade to Submit</DialogTitle>
            <DialogDescription className="text-sm">
              Subscribe to submit your exam and unlock full results and explanations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1 h-11">
              Continue Exam
            </Button>
            <Link to="/payment" className="flex-1">
              <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600">Upgrade Now</Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectBasedExamInterface;