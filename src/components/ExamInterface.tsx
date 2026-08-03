import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MathRenderer } from "@/components/ui/math-renderer";
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

const ExamInterface: React.FC<ExamInterfaceProps> = ({
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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { canAccessPremium, loading: subscriptionLoading } = useSubscription();

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
      // Prevent common shortcuts
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'f')) {
        e.preventDefault();
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [antiCheatEnabled, isPaused]);

  // Timer effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Auto-save answers
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem('exam_progress', JSON.stringify({
          answers,
          flagged: Array.from(flagged),
          currentQuestion,
          timeLeft
        }));
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSave);
  }, [answers, flagged, currentQuestion, timeLeft]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = useCallback((questionIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  }, []);

  const handleFlagQuestion = useCallback(() => {
    const newFlagged = new Set(flagged);
    if (flagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  }, [flagged, currentQuestion]);

  const handleAutoSubmit = useCallback(() => {
    if (!subscriptionLoading && !canAccessPremium) {
      setShowUpgradeDialog(true);
      return;
    }
    const timeTaken = (duration * 60) - timeLeft;
    onSubmit(answers, Math.floor(timeTaken / 60));
  }, [answers, duration, timeLeft, onSubmit, canAccessPremium, subscriptionLoading]);

  const handleManualSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    if (!subscriptionLoading && !canAccessPremium) {
      setShowSubmitDialog(false);
      setShowUpgradeDialog(true);
      return;
    }
    const timeTaken = (duration * 60) - timeLeft;
    onSubmit(answers, Math.floor(timeTaken / 60));
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return "answered";
    if (flagged.has(index)) return "flagged";
    return "unanswered";
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Exam Resumed" : "Exam Paused",
      description: isPaused ? "Timer is now running" : "Timer has been paused"
    });
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const timeWarning = timeLeft <= 300; // 5 minutes warning

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">📝</div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold truncate">{examTitle}</h1>
                <p className="text-xs opacity-90 truncate">{examDescription}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 justify-end flex-wrap">
              {/* Timer */}
              <div className={`flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-2 rounded-xl font-mono text-xs sm:text-lg font-bold whitespace-nowrap flex-shrink-0 ${
                timeWarning ? 'bg-red-600 animate-pulse' : 'bg-white/20'
              }`}>
                <Clock className="h-2.5 w-2.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-base">{formatTime(timeLeft)}</span>
              </div>
              
              <Button
                size="sm"
                onClick={togglePause}
                className="bg-white/20 hover:bg-white/30 h-7 sm:h-9 px-2 sm:px-3 flex-shrink-0"
              >
                {isPaused ? <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1">
              <span className="whitespace-nowrap">{answeredCount}/{questions.length}</span>
              <span className="whitespace-nowrap">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 sm:h-1.5" />
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center">
          <Card className="w-full max-w-md border-2 shadow-2xl mx-4">
            <CardHeader className="text-center pb-3">
              <Pause className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <CardTitle className="text-xl font-bold">Exam Paused</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">Your exam is currently paused. Click resume to continue.</p>
              <Button onClick={togglePause} className="w-full bg-orange-500 hover:bg-orange-600 h-11">
                <Play className="h-4 w-4 mr-2" />
                Resume Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 overflow-hidden">
        <div className={cn("grid gap-3 sm:gap-4 lg:grid-cols-[1fr_280px]")}>
          {/* Question Area */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm sm:text-base font-bold">
                      Q {currentQuestion + 1}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {questions[currentQuestion].subject}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                    <Badge variant="outline" className="text-[10px] sm:text-xs font-medium border-orange-200 bg-orange-50 text-orange-700 flex-shrink-0">
                      {questions[currentQuestion].subject}
                    </Badge>
                    {questions[currentQuestion].difficulty && (
                      <Badge variant={
                        questions[currentQuestion].difficulty === 'easy' ? 'secondary' :
                        questions[currentQuestion].difficulty === 'medium' ? 'outline' : 'destructive'
                      } className="text-[10px] sm:text-xs flex-shrink-0">
                        {questions[currentQuestion].difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                {/* Question Text */}
                <div className="p-2.5 sm:p-4 rounded-lg sm:rounded-xl bg-gray-50 border text-sm sm:text-base overflow-x-auto">
                  <MathRenderer 
                    content={questions[currentQuestion].question}
                    className="text-sm sm:text-base font-medium leading-relaxed break-words"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {questions[currentQuestion].options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    const isSelected = answers[currentQuestion] === optionLetter;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !showExplanations && handleAnswerSelect(currentQuestion, optionLetter)}
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
                            {isSelected ? <Check className="h-4 w-4" /> : optionLetter}
                          </div>
                          <MathRenderer content={option} className="flex-1 text-sm" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanations && questions[currentQuestion].explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">Explanation:</h4>
                    <MathRenderer 
                      content={questions[currentQuestion].explanation || ""}
                      className="text-blue-800 text-sm"
                    />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-sm font-semibold text-orange-600">
                    {currentQuestion + 1} / {questions.length}
                  </span>

                  <Button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === questions.length - 1}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-gray-600">
                    Question Navigator
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsReviewMode(!isReviewMode)} className="h-6 w-6 p-0">
                    {isReviewMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    const isCurrent = index === currentQuestion;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={cn(
                          "w-full aspect-square rounded-lg border text-xs font-bold flex items-center justify-center transition-all",
                          isCurrent && "bg-orange-500 text-white border-orange-500 shadow-md",
                          !isCurrent && status === "answered" && "bg-green-100 text-green-700 border-green-300",
                          !isCurrent && status === "flagged" && "bg-yellow-100 text-yellow-700 border-yellow-300",
                          !isCurrent && !status && "bg-white text-gray-400 border-gray-200 hover:border-orange-300"
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 pt-3 border-t text-[10px] text-gray-500 space-y-1.5">
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

            {/* Tools */}
            <Card className="border">
              <CardContent className="p-3 space-y-2">
                <Button
                  variant="outline"
                  onClick={handleFlagQuestion}
                  className={flagged.has(currentQuestion) ? "bg-red-50 border-red-200 text-red-600 w-full" : "w-full"}
                  size="sm"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  {flagged.has(currentQuestion) ? "Unflag" : "Flag for Review"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    localStorage.setItem('exam_progress', JSON.stringify({
                      answers,
                      flagged: Array.from(flagged),
                      currentQuestion,
                      timeLeft
                    }));
                    toast({
                      title: "Progress Saved",
                      description: "Your answers have been saved"
                    });
                  }}
                  size="sm"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Progress
                </Button>
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

export default ExamInterface;