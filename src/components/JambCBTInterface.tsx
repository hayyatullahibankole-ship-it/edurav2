import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MathRenderer } from '@/components/ui/math-renderer';
import Calculator from '@/components/Calculator';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Calculator as CalculatorIcon,
  Users,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correct_answer?: string;
  explanation?: string;
}

interface JambCBTInterfaceProps {
  questions: Question[];
  duration: number;
  onSubmit: (answers: { [key: number]: string }, timeSpent: number) => void;
  examTitle?: string;
  examDescription?: string;
}

interface SubjectQuestions {
  [subject: string]: {
    questions: Question[];
    completed: number;
    score?: number;
  };
}

const JambCBTInterface: React.FC<JambCBTInterfaceProps> = ({
  questions,
  duration,
  onSubmit,
  examTitle = "JAMB CBT Practice Test",
  examDescription = "Joint Admissions and Matriculation Board Computer Based Test"
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [subjectQuestions, setSubjectQuestions] = useState<SubjectQuestions>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Group questions by subject on mount
  useEffect(() => {
    const grouped: SubjectQuestions = {};
    questions.forEach(question => {
      if (!grouped[question.subject]) {
        grouped[question.subject] = {
          questions: [],
          completed: 0
        };
      }
      grouped[question.subject].questions.push(question);
    });

    setSubjectQuestions(grouped);
    
    // Set first subject as current
    const firstSubject = Object.keys(grouped)[0];
    if (firstSubject) {
      setCurrentSubject(firstSubject);
    }
  }, [questions]);

  // Timer effect
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleManualSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft]);

  // Anti-cheat measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        if (tabSwitchCount >= 2) {
          alert('Warning: Excessive tab switching detected. This may affect your test submission.');
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common cheating shortcuts
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'a' || e.key === 'f')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        alert('This action is not allowed during the exam.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabSwitchCount]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFlagQuestion = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(true);
  };

  const handleManualSubmit = useCallback(() => {
    setIsSubmitting(true);
    const timeSpent = (duration * 60) - timeLeft;
    onSubmit(answers, timeSpent);
  }, [answers, duration, timeLeft, onSubmit]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const getCurrentQuestion = () => {
    if (!currentSubject || !subjectQuestions[currentSubject]) return null;
    return subjectQuestions[currentSubject].questions[currentQuestionIndex] || null;
  };

  const nextQuestionInSubject = () => {
    const subjectData = subjectQuestions[currentSubject];
    if (subjectData && currentQuestionIndex < subjectData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestionInSubject = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const switchToSubject = (subject: string) => {
    setCurrentSubject(subject);
    setCurrentQuestionIndex(0);
  };

  const getSubjectProgress = (subject: string) => {
    if (!subjectQuestions[subject]) return 0;
    const answeredCount = subjectQuestions[subject].questions.filter(q => 
      answers.hasOwnProperty(q.id)
    ).length;
    return (answeredCount / subjectQuestions[subject].questions.length) * 100;
  };

  const getTotalProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading JAMB CBT Interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{examTitle}</h1>
            <p className="text-primary-foreground/80 text-sm">{examDescription}</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-mono text-lg font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={togglePause}
                disabled={isSubmitting}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmSubmit}
                disabled={isSubmitting}
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length} of {questions.length} questions answered
            </span>
          </div>
          <Progress value={getTotalProgress()} className="h-2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Subject Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {Object.keys(subjectQuestions).map((subject) => (
                    <button
                      key={subject}
                      onClick={() => switchToSubject(subject)}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/50 transition-colors border-l-4",
                        currentSubject === subject 
                          ? "border-primary bg-primary/5 font-medium" 
                          : "border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{subject}</span>
                        <Badge variant={getSubjectProgress(subject) === 100 ? "default" : "outline"} className="text-xs">
                          {subjectQuestions[subject].questions.filter(q => answers.hasOwnProperty(q.id)).length}/
                          {subjectQuestions[subject].questions.length}
                        </Badge>
                      </div>
                      <Progress 
                        value={getSubjectProgress(subject)} 
                        className="h-1 mt-1" 
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anti-cheat warning */}
            {tabSwitchCount > 0 && (
              <Alert className="mt-4 border-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Tab switches detected: {tabSwitchCount}
                  {tabSwitchCount >= 2 && " (Warning issued)"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Question {currentQuestionIndex + 1} of {subjectQuestions[currentSubject]?.questions.length}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Subject: {currentSubject}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCalculatorOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <CalculatorIcon className="h-4 w-4" />
                      Calculator
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFlagQuestion(currentQuestion.id)}
                      className={flaggedQuestions.has(currentQuestion.id) ? "bg-warning/10 border-warning" : ""}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Question */}
                  <div>
                    <MathRenderer 
                      content={currentQuestion.question}
                      className="text-lg font-medium leading-relaxed"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.id] === option;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                          className={cn(
                            "w-full text-left p-4 rounded-lg border-2 transition-all hover:bg-muted/50",
                            isSelected 
                              ? "border-primary bg-primary/5 font-medium" 
                              : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <div className="flex items-center">
                            <div className={cn(
                              "w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center",
                              isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                            )}>
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>
                            <MathRenderer content={option} className="flex-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevQuestionInSubject}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {subjectQuestions[currentSubject]?.questions.length}
                    </div>

                    <Button
                      onClick={nextQuestionInSubject}
                      disabled={currentQuestionIndex === subjectQuestions[currentSubject]?.questions.length - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
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
            <DialogTitle>Submit JAMB CBT Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Object.keys(answers).length}</div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{flaggedQuestions.size}</div>
                <div className="text-sm text-muted-foreground">Flagged</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{questions.length - Object.keys(answers).length}</div>
                <div className="text-sm text-muted-foreground">Unanswered</div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSubmitDialog(false)}
                className="flex-1"
              >
                Continue Test
              </Button>
              <Button 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Test Paused</h2>
            <p className="text-muted-foreground mb-6">Click resume to continue your exam</p>
            <Button onClick={togglePause}>Resume Test</Button>
          </Card>
        </div>
      )}

      {/* Calculator Component */}
      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
};

export default JambCBTInterface;