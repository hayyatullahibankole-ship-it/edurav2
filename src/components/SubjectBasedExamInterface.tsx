import React, { useState, useEffect, useCallback } from "react";
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
  Target
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

  const handleAutoSubmit = useCallback(() => {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{examTitle}</h1>
              <p className="text-sm text-muted-foreground">{examDescription}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`text-lg font-mono ${timeLeft < 600 ? 'text-red-600' : 'text-foreground'}`}>
                <Clock className="inline h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={togglePause}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>

              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleManualSubmit}
              >
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Overall Progress: {answeredCount}/{questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {showWarning && (
        <Alert className="mx-4 mt-4 border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Suspicious activity detected. Tab switches: {tabSwitchCount}
          </AlertDescription>
        </Alert>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Subject Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectQuestions.map((subjectData) => {
                  const progress = getSubjectProgress(subjectData.subject);
                  const isActive = currentSubject === subjectData.subject;
                  
                  return (
                    <div
                      key={subjectData.subject}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        isActive ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => switchToSubject(subjectData.subject)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{subjectData.subject}</span>
                        <Badge variant={progress === 100 ? "default" : "secondary"} className="text-xs">
                          {progress}%
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {subjectData.questions.filter(q => answers.hasOwnProperty(q.id - 1)).length}/{subjectData.questions.length} answered
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {currentSubject}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Question {currentQuestionInSubject + 1} of {currentSubjectData.questions.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={flagged.has(globalQuestionIndex) ? "destructive" : "outline"}>
                      {flagged.has(globalQuestionIndex) ? "Flagged" : "Not flagged"}
                    </Badge>
                    <Badge variant={answers[globalQuestionIndex] ? "default" : "secondary"}>
                      {answers[globalQuestionIndex] ? "Answered" : "Unanswered"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <MathRenderer 
                    content={currentQuestion.question} 
                    className="text-lg leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    // Handle both pre-lettered options (A) text) and plain text options
                    const optionLetter = option.includes(')') ? option.split(')')[0] : String.fromCharCode(65 + index);
                    const optionText = option.includes(')') ? option : `${optionLetter}) ${option}`;
                    // SECURITY FIX: Remove direct access to correct answers during exam
                    const isSelected = answers[globalQuestionIndex] === optionLetter;
                    const isCorrect = false; // Never expose correct answers during active exam
                    const isWrong = false; // Never expose incorrect indicators during active exam
                    
                    return (
                      <div
                        key={`${globalQuestionIndex}-${index}`} // Ensure unique keys for shuffled options
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                          isSelected ? "border-primary bg-primary/10" : 
                          isCorrect ? "border-green-500 bg-green-50" :
                          isWrong ? "border-red-500 bg-red-50" : "border-border"
                        }`}
                        onClick={() => !showExplanations && handleAnswerSelect(globalQuestionIndex, optionLetter)}
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
                            content={optionText} 
                            className="flex-1"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {showExplanations && currentQuestion.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <MathRenderer 
                      content={currentQuestion.explanation || ""}
                      className="text-blue-800"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                onClick={prevQuestionInSubject}
                disabled={currentQuestionInSubject === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleFlagQuestion}
                  className={flagged.has(globalQuestionIndex) ? "text-yellow-600 border-yellow-600" : ""}
                >
                  {flagged.has(globalQuestionIndex) ? "Unflag" : "Flag for Review"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    localStorage.setItem('exam_progress', JSON.stringify({
                      answers,
                      flagged: Array.from(flagged),
                      currentSubject,
                      currentQuestionInSubject,
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
              </div>

              <Button
                onClick={nextQuestionInSubject}
                disabled={currentQuestionInSubject === currentSubjectData.questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Subject Summary */}
            <Card className="bg-muted/30 mt-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="font-bold text-lg text-green-600">
                      {currentSubjectData.questions.filter(q => answers.hasOwnProperty(q.id - 1)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Answered</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-yellow-600">
                      {currentSubjectData.questions.filter(q => flagged.has(q.id - 1)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Flagged</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-muted-foreground">
                      {currentSubjectData.questions.length - currentSubjectData.questions.filter(q => answers.hasOwnProperty(q.id - 1)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-blue-600">
                      {getSubjectProgress(currentSubject)}%
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
            
            {/* Subject breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium">Subject Progress:</h4>
              {subjectQuestions.map((subjectData) => (
                <div key={subjectData.subject} className="flex justify-between items-center text-sm">
                  <span>{subjectData.subject}:</span>
                  <span>
                    {subjectData.questions.filter(q => answers.hasOwnProperty(q.id - 1)).length}/{subjectData.questions.length}
                    ({getSubjectProgress(subjectData.subject)}%)
                  </span>
                </div>
              ))}
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

export default SubjectBasedExamInterface;