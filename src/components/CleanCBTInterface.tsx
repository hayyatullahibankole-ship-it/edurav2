import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MathRenderer } from '@/components/ui/math-renderer';
import { Clock, ChevronLeft, ChevronRight, Check, Lock, Crown, Calculator as CalculatorIcon, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CBTQuestion, CBTAnswers } from '@/hooks/useCBTExam';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import Calculator from '@/components/Calculator';

interface CleanCBTInterfaceProps {
  questions: CBTQuestion[];
  answers: CBTAnswers;
  onAnswerSelect: (questionId: string, optionIndex: number) => void;
  onSubmit: (timeSpent: number) => Promise<void>;
  duration: number;
  examTitle?: string;
  submitting?: boolean;
  bypassSubscription?: boolean;
  disableSubmit?: boolean;
}

export const CleanCBTInterface: React.FC<CleanCBTInterfaceProps> = ({
  questions,
  answers,
  onAnswerSelect,
  onSubmit,
  duration,
  examTitle = 'CBT Exam',
  submitting = false,
  bypassSubscription = false,
  disableSubmit = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const { canAccessPremium, loading: subscriptionLoading } = useSubscription();

  const currentQuestion = questions[currentIndex];

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitClick();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitClick = async () => {
    // Prevent double submission
    if (submitting || disableSubmit) return;
    
    // Block submission for free/basic users
    if (!bypassSubscription && !subscriptionLoading && !canAccessPremium) {
      setShowSubmitDialog(false);
      setShowUpgradeDialog(true);
      return;
    }
    const timeSpent = (duration * 60) - timeLeft;
    try {
      await onSubmit(timeSpent);
      // Close the dialog after successful submission
      setShowSubmitDialog(false);
    } catch (error) {
      console.error('Submission error:', error);
      // Error toast should be handled in onSubmit
      // Keep dialog open so user can try again
    }
  };

  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;

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
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">📝</div>
              <div>
                <h1 className="text-lg font-bold">{examTitle}</h1>
                <p className="text-xs opacity-90">Question {currentIndex + 1} of {questions.length}</p>
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

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">
        <div className={cn("grid gap-4 lg:grid-cols-[1fr_280px]")}>
          {/* Question Area */}
          <div className="space-y-4">
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
            {/* Question Navigation Grid */}
            <Card className="border">
              <CardHeader className="py-2 px-3 border-b bg-gray-50">
                <CardTitle className="text-xs font-semibold text-gray-600">
                  All Questions — Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = idx === currentIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
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

      {/* Upgrade Required Dialog */}
      {showUpgradeDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-2 shadow-2xl">
            <CardHeader className="text-center pb-3">
              <Lock className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <CardTitle className="text-lg font-bold">Upgrade to Submit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                Subscribe to submit your exam and unlock detailed results and explanations.
              </p>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-orange-500" />
                  Submit tests & view full results
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-orange-500" />
                  Detailed answer explanations
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-orange-500" />
                  Performance analytics
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1 h-11">
                  Continue
                </Button>
                <Link to="/payment" className="flex-1">
                  <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 font-bold">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </Link>
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
