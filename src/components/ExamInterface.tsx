import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MathRenderer } from "@/components/ui/math-renderer";
import { MathJax, MathJaxContext } from "better-react-mathjax";
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
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    const timeTaken = (duration * 60) - timeLeft;
    onSubmit(answers, Math.floor(timeTaken / 60));
  }, [answers, duration, timeLeft, onSubmit]);

  const handleManualSubmit = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
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
    <div className="min-h-screen bg-background">
      {/* Anti-cheat warning */}
      {showWarning && (
        <Alert className="fixed top-4 left-4 right-4 z-50 border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>Suspicious activity detected! Tab switches: {tabSwitchCount}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowWarning(false)}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{examTitle}</h1>
                <p className="text-sm text-muted-foreground">{examDescription}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge 
                variant={timeWarning ? "destructive" : "outline"} 
                className={`${timeWarning ? 'animate-pulse' : ''} text-base px-3 py-1`}
              >
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
              
              <Button variant="outline" size="sm" onClick={togglePause}>
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={handleManualSubmit}
                className="hidden sm:flex"
              >
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/80 z-30 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader className="text-center">
              <Pause className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Exam Paused</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Your exam is currently paused. Click resume to continue.
              </p>
              <Button onClick={togglePause} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Resume Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <Card className="lg:order-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Question Navigator
                <Button variant="ghost" size="sm" onClick={() => setIsReviewMode(!isReviewMode)}>
                  {isReviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {answeredCount} of {questions.length} answered ({Math.round(progress)}%)
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`aspect-square p-0 text-xs ${
                        status === "answered" ? "border-green-500 bg-green-50 hover:bg-green-100" :
                        status === "flagged" ? "border-yellow-500 bg-yellow-50 hover:bg-yellow-100" : ""
                      }`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-yellow-600" />
                  <span>Flagged ({flagged.size})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 text-muted-foreground" />
                  <span>Not Visited ({questions.length - answeredCount - (flagged.size - Object.keys(answers).filter(key => flagged.has(parseInt(key))).length)})</span>
                </div>
              </div>

              {allowReview && (
                <div className="mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // Jump to first unanswered question
                      const firstUnanswered = questions.findIndex((_, index) => !answers[index]);
                      if (firstUnanswered !== -1) {
                        setCurrentQuestion(firstUnanswered);
                      }
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Review Unanswered
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Question Area */}
          <div className="lg:col-span-3 lg:order-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        {questions[currentQuestion].subject}
                      </Badge>
                      <Badge variant="outline">
                        Question {currentQuestion + 1} of {questions.length}
                      </Badge>
                      {questions[currentQuestion].difficulty && (
                        <Badge variant={
                          questions[currentQuestion].difficulty === 'easy' ? 'secondary' :
                          questions[currentQuestion].difficulty === 'medium' ? 'default' : 'destructive'
                        }>
                          {questions[currentQuestion].difficulty}
                        </Badge>
                      )}
                    </div>
                    <MathRenderer 
                      content={questions[currentQuestion].question}
                      className="text-xl leading-relaxed font-semibold"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={flagged.has(currentQuestion) ? "text-yellow-600 border-yellow-600" : ""}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const optionLetter = option.split(')')[0];
                    const isSelected = answers[currentQuestion] === optionLetter;
                    const isCorrect = showExplanations && optionLetter === questions[currentQuestion].correct;
                    const isWrong = showExplanations && isSelected && optionLetter !== questions[currentQuestion].correct;
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          isSelected ? "border-primary bg-primary/10" : 
                          isCorrect ? "border-green-500 bg-green-50" :
                          isWrong ? "border-red-500 bg-red-50" : "border-border"
                        }`}
                        onClick={() => !showExplanations && handleAnswerSelect(currentQuestion, optionLetter)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : 
                            isCorrect ? "border-green-500 bg-green-500" :
                            isWrong ? "border-red-500 bg-red-500" : "border-muted-foreground"
                          }`}>
                            {(isSelected || isCorrect || isWrong) && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <MathRenderer 
                            content={option} 
                            className="flex-1"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showExplanations && questions[currentQuestion].explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <MathRenderer 
                      content={questions[currentQuestion].explanation || ""}
                      className="text-blue-800"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleFlagQuestion}
                  className={flagged.has(currentQuestion) ? "text-yellow-600 border-yellow-600" : ""}
                >
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
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleManualSubmit}
                  className="sm:hidden"
                >
                  Submit
                </Button>
              </div>

              <Button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Progress Summary */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="font-bold text-lg text-green-600">{answeredCount}</div>
                    <div className="text-sm text-muted-foreground">Answered</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-yellow-600">{flagged.size}</div>
                    <div className="text-sm text-muted-foreground">Flagged</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-muted-foreground">
                      {questions.length - answeredCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-blue-600">
                      {Math.round(progress)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-green-600">{answeredCount}</div>
                <div>Answered</div>
              </div>
              <div>
                <div className="font-bold text-yellow-600">{flagged.size}</div>
                <div>Flagged</div>
              </div>
              <div>
                <div className="font-bold text-red-600">{questions.length - answeredCount}</div>
                <div>Unanswered</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">
                Continue Exam
              </Button>
              <Button onClick={confirmSubmit} className="flex-1">
                Submit Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamInterface;
