import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MathRenderer } from '@/components/ui/math-renderer';
import { Clock, ChevronLeft, ChevronRight, Check, Calculator as CalculatorIcon, Camera, AlertTriangle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CBTQuestion, CBTAnswers } from '@/hooks/useCBTExam';
import Calculator from '@/components/Calculator';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface MockCBTInterfaceProps {
  questions: CBTQuestion[];
  answers: CBTAnswers;
  onAnswerSelect: (questionId: string, optionIndex: number) => void;
  onSubmit: (timeSpent: number) => Promise<void>;
  duration: number;
  examTitle?: string;
  submitting?: boolean;
  disableSubmit?: boolean;
}

export const MockCBTInterface: React.FC<MockCBTInterfaceProps> = ({
  questions,
  answers,
  onAnswerSelect,
  onSubmit,
  duration,
  examTitle = 'AKBOY JAMB Mock Examination',
  submitting = false,
  disableSubmit = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [suspiciousCount, setSuspiciousCount] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasAutoSubmittedRef = useRef(false);
  const isMobile = useIsMobile();

  const currentQuestion = questions[currentIndex];

  // Get unique subjects from questions
  const subjects = React.useMemo(() => {
    const subjectMap = new Map<string, number[]>();
    questions.forEach((q, idx) => {
      const existing = subjectMap.get(q.subject) || [];
      existing.push(idx);
      subjectMap.set(q.subject, existing);
    });
    return Array.from(subjectMap.entries()).map(([name, indices]) => ({ name, indices }));
  }, [questions]);

  // Set initial active subject
  useEffect(() => {
    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0].name);
    }
  }, [subjects, activeSubject]);

  // Get questions for the active subject
  const activeSubjectData = subjects.find(s => s.name === activeSubject);
  const subjectQuestionIndices = activeSubjectData?.indices || [];

  // Start camera for proctoring
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera start failed:", err);
        toast.error("Camera access lost. Please re-enable camera access.");
      }
    };
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Anti-cheat: tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setSuspiciousCount(prev => {
          const newCount = prev + 1;
          toast.warning(`Warning: Tab switch detected (${newCount}/3). Exam will auto-submit at 3 violations.`);
          return newCount;
        });
      }
    };

    const handleCopy = (e: ClipboardEvent) => { e.preventDefault(); toast.warning("Copy is disabled during exam"); };
    const handlePaste = (e: ClipboardEvent) => { e.preventDefault(); toast.warning("Paste is disabled during exam"); };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const blocked = ['c', 'v', 'a', 's', 'p', 'f', 'r', 'u', 'i'];
        if (blocked.includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }
      if (['F5', 'F11', 'F12'].includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-submit on 3 suspicious activities
  useEffect(() => {
    if (suspiciousCount >= 3 && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      toast.error("Too many violations detected. Exam is being auto-submitted.");
      const timeSpent = (duration * 60) - timeLeft;
      onSubmit(timeSpent);
    }
  }, [suspiciousCount, duration, timeLeft, onSubmit]);

  // Timer with auto-submit
  useEffect(() => {
    if (timeLeft <= 0) {
      if (!hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        toast.info("Time is up! Your exam is being submitted automatically.");
        const timeSpent = duration * 60;
        onSubmit(timeSpent);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, duration, onSubmit]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitClick = useCallback(async () => {
    if (submitting || disableSubmit || hasAutoSubmittedRef.current) return;
    const timeSpent = (duration * 60) - timeLeft;
    try {
      await onSubmit(timeSpent);
      setShowSubmitDialog(false);
    } catch (error) {
      console.error('Submission error:', error);
    }
  }, [submitting, disableSubmit, duration, timeLeft, onSubmit]);

  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;
  const isTimeWarning = timeLeft < 300; // less than 5 minutes

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/akboy-logo.png" alt="AKBOY" className="w-8 h-8 rounded-full bg-white p-0.5" />
              <div>
                <h1 className="text-lg font-bold">{examTitle}</h1>
                <p className="text-xs opacity-90">Question {currentIndex + 1} of {questions.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Camera indicator */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                cameraActive ? 'bg-green-600/30 text-white' : 'bg-red-600/50 text-white'
              }`}>
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{cameraActive ? 'Recording' : 'Camera Off'}</span>
                {cameraActive && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
              </div>

              {/* Suspicious activity counter */}
              {suspiciousCount > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-red-600/40 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {suspiciousCount}/3
                </div>
              )}

              {/* Timer */}
              <div className={`flex items-center px-4 py-2 rounded-xl font-mono text-lg font-bold ${
                isTimeWarning ? 'bg-red-600 animate-pulse' : 'bg-white/20'
              }`}>
                <Clock className="h-4 w-4 mr-2" />
                {formatTime(timeLeft)}
              </div>

              <Button
                size="sm"
                onClick={() => setShowCalculator(true)}
                className="bg-white/20 hover:bg-white/30 h-9 px-3"
              >
                <CalculatorIcon className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting || disableSubmit}
                className="bg-white text-orange-600 hover:bg-white/90 font-bold h-9 px-4"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{Object.keys(answers).length}/{questions.length} answered</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Tabs (Desktop) */}
      {!isMobile && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto py-2">
              {subjects.map((subject) => {
                const answeredInSubject = subject.indices.filter(i => answers[questions[i].id] !== undefined).length;
                const isActive = activeSubject === subject.name;
                return (
                  <button
                    key={subject.name}
                    onClick={() => {
                      setActiveSubject(subject.name);
                      setCurrentIndex(subject.indices[0]);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    {subject.name}
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                      isActive ? "bg-white/30" : "bg-gray-100"
                    )}>
                      {answeredInSubject}/{subject.indices.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className={cn("grid gap-4", !isMobile && "grid-cols-[1fr_280px]")}>
          {/* Question Area */}
          <div className="space-y-4">
            {/* Mobile Subject Selector */}
            {isMobile && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    onClick={() => {
                      setActiveSubject(subject.name);
                      setCurrentIndex(subject.indices[0]);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all",
                      activeSubject === subject.name
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200"
                    )}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            )}

            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">
                    Question {currentIndex + 1}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-medium border-orange-200 bg-orange-50 text-orange-700">
                    {currentQuestion.subject}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question Text */}
                <div className="p-4 rounded-xl bg-gray-50 border">
                  <MathRenderer
                    content={currentQuestion.questionText}
                    className="text-base font-medium leading-relaxed"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentQuestion.id] === index;
                    const optionLabel = String.fromCharCode(65 + index);

                    return (
                      <button
                        key={index}
                        onClick={() => onAnswerSelect(currentQuestion.id, index)}
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
                            {isSelected ? <Check className="h-4 w-4" /> : optionLabel}
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
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <span className="text-sm font-semibold text-orange-600">
                    {currentIndex + 1} / {questions.length}
                  </span>

                  <Button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
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
            {/* Camera Feed */}
            <Card className="border overflow-hidden">
              <CardHeader className="py-2 px-3 bg-gray-50 border-b">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <Eye className="w-3.5 h-3.5" />
                  Proctoring Camera
                  {cameraActive && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto" />}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full aspect-video bg-black object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </CardContent>
            </Card>

            {/* Question Navigation Grid */}
            <Card className="border">
              <CardHeader className="py-2 px-3 border-b bg-gray-50">
                <CardTitle className="text-xs font-semibold text-gray-600">
                  {activeSubject || 'All Questions'} — Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-5 gap-1.5">
                  {subjectQuestionIndices.map((qIdx) => {
                    const q = questions[qIdx];
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = qIdx === currentIndex;
                    const displayNum = subjectQuestionIndices.indexOf(qIdx) + 1;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(qIdx)}
                        className={cn(
                          "w-full aspect-square rounded-lg border text-xs font-bold flex items-center justify-center transition-all",
                          isCurrent && "bg-orange-500 text-white border-orange-500 shadow-md",
                          !isCurrent && isAnswered && "bg-green-100 text-green-700 border-green-300",
                          !isCurrent && !isAnswered && "bg-white text-gray-400 border-gray-200 hover:border-orange-300"
                        )}
                      >
                        {displayNum}
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
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-2 shadow-2xl">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-xl font-bold">Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{Object.keys(answers).length}</div>
                  <div className="text-xs text-gray-500">Answered</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{questions.length - Object.keys(answers).length}</div>
                  <div className="text-xs text-gray-500">Unanswered</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{questions.length}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1 h-11">
                  Continue
                </Button>
                <Button
                  onClick={handleSubmitClick}
                  className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 font-bold"
                  disabled={submitting || disableSubmit}
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calculator */}
      <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};
