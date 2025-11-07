import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MathRenderer } from '@/components/ui/math-renderer';
import { Clock, ChevronLeft, ChevronRight, Check, Lock, Crown, Calculator as CalculatorIcon } from 'lucide-react';
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
}

export const CleanCBTInterface: React.FC<CleanCBTInterfaceProps> = ({
  questions,
  answers,
  onAnswerSelect,
  onSubmit,
  duration,
  examTitle = 'CBT Exam',
  submitting = false
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
    if (submitting) return;
    
    // Block submission for free/basic users
    if (!subscriptionLoading && !canAccessPremium) {
      setShowSubmitDialog(false);
      setShowUpgradeDialog(true);
      return;
    }
    const timeSpent = (duration * 60) - timeLeft;
    await onSubmit(timeSpent);
  };

  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-secondary/10 to-success/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Vibrant Header */}
      <div 
        className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-glow to-secondary text-white p-4 sm:p-6 shadow-2xl z-10"
        style={{ boxShadow: '0 10px 40px rgba(0, 123, 255, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)' }}
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black drop-shadow-lg">{examTitle}</h1>
              <p className="text-sm sm:text-base opacity-95 font-semibold drop-shadow-md">Question {currentIndex + 1} of {questions.length}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center bg-white/20 backdrop-blur-xl px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border-2 border-white/30 shadow-xl"
                style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.2)' }}
              >
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 mr-2 drop-shadow-lg" />
                <span className="font-mono text-lg sm:text-xl font-black drop-shadow-md">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCalculator(true)}
                className="bg-white/20 backdrop-blur-xl text-white hover:bg-white/30 font-black rounded-xl h-10 sm:h-11 px-3 sm:px-4 shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30"
                style={{ boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)' }}
              >
                <CalculatorIcon className="h-5 w-5" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
                className="bg-white text-primary hover:bg-white/90 font-black rounded-xl h-10 sm:h-11 px-4 sm:px-6 shadow-xl hover:scale-105 active:scale-95 transition-all"
                style={{ boxShadow: '0 8px 24px rgba(255, 255, 255, 0.3)' }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress */}
      <div className="bg-card/80 backdrop-blur-sm border-b-2 border-border/50 p-4 sm:p-5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground/80">Progress</span>
            <span className="text-sm text-primary font-black">
              {Object.keys(answers).length} / {questions.length} answered
            </span>
          </div>
          <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-glow to-secondary rounded-full transition-all duration-500 shadow-lg"
              style={{ 
                width: `${progressPercentage}%`,
                boxShadow: '0 2px 8px rgba(0, 123, 255, 0.4)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 relative z-10">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
        <Card 
          className="backdrop-blur-sm bg-card/80 border-2 border-border hover:border-primary/50 rounded-[28px] shadow-2xl transition-all animate-fade-in"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Question {currentIndex + 1}
              </CardTitle>
              <Badge 
                variant="outline" 
                className="font-bold text-xs sm:text-sm rounded-full border-2 border-primary/30 bg-primary/10 text-primary"
              >
                {currentQuestion.subject}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div 
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10"
              style={{ boxShadow: 'inset 0 2px 8px rgba(0, 123, 255, 0.05)' }}
            >
              <MathRenderer 
                content={currentQuestion.questionText}
                className="text-base sm:text-lg font-semibold leading-relaxed text-foreground/90"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                
                return (
                  <button
                    key={index}
                    onClick={() => onAnswerSelect(currentQuestion.id, index)}
                    className={cn(
                      "w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]",
                      isSelected 
                        ? "border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 shadow-xl" 
                        : "border-border hover:border-primary/30 hover:bg-muted/50 shadow-lg"
                    )}
                    style={isSelected ? { boxShadow: '0 8px 24px rgba(0, 123, 255, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.1)' } : {}}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center font-black text-sm sm:text-base shadow-lg",
                        isSelected 
                          ? "border-primary bg-gradient-to-br from-primary to-primary-glow text-white" 
                          : "border-muted-foreground text-muted-foreground"
                      )}>
                        {isSelected ? <Check className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow-md" /> : optionLabel}
                      </div>
                      <MathRenderer content={option} className="flex-1 font-medium text-sm sm:text-base" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t-2 border-border/50">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="rounded-xl border-2 font-bold hover:scale-105 active:scale-95 transition-all"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm font-bold text-primary">
                {currentIndex + 1} / {questions.length}
              </span>

              <Button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="rounded-xl font-bold hover:scale-105 active:scale-95 transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
          </div>

          {/* Sidebar - Quick navigation */}
        <Card 
          className="backdrop-blur-sm bg-card/80 border-2 border-border rounded-[28px] shadow-xl animate-fade-in"
          style={{ animationDelay: '0.1s', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.08)' }}
        >
          <CardHeader>
            <CardTitle className="text-base font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all hover:scale-110 active:scale-95 shadow-lg",
                      isCurrent && "border-primary bg-gradient-to-br from-primary to-primary-glow text-white shadow-xl",
                      !isCurrent && isAnswered && "border-success bg-gradient-to-br from-success/20 to-success/10 text-success shadow-md",
                      !isCurrent && !isAnswered && "border-muted text-muted-foreground hover:border-primary/50"
                    )}
                    style={isCurrent ? { boxShadow: '0 8px 24px rgba(0, 123, 255, 0.4)' } : {}}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card 
            className="w-full max-w-md mx-4 backdrop-blur-xl bg-card/95 border-2 border-primary/20 rounded-[28px] shadow-2xl animate-scale-in"
            style={{ boxShadow: '0 25px 70px rgba(0, 123, 255, 0.3)' }}
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Submit Exam?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <div 
                  className="p-4 bg-gradient-to-br from-success/20 to-success/10 rounded-2xl border-2 border-success/30 shadow-lg"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(16, 185, 129, 0.1)' }}
                >
                  <div className="text-3xl font-black text-success drop-shadow-sm">
                    {Object.keys(answers).length}
                  </div>
                  <div className="text-xs font-bold text-foreground/70 mt-1">Answered</div>
                </div>
                <div 
                  className="p-4 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl border-2 border-destructive/30 shadow-lg"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(239, 68, 68, 0.1)' }}
                >
                  <div className="text-3xl font-black text-destructive drop-shadow-sm">
                    {questions.length - Object.keys(answers).length}
                  </div>
                  <div className="text-xs font-bold text-foreground/70 mt-1">Unanswered</div>
                </div>
                <div 
                  className="p-4 bg-gradient-to-br from-primary/20 to-primary-glow/10 rounded-2xl border-2 border-primary/30 shadow-lg"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0, 123, 255, 0.1)' }}
                >
                  <div className="text-3xl font-black text-primary drop-shadow-sm">
                    {questions.length}
                  </div>
                  <div className="text-xs font-bold text-foreground/70 mt-1">Total</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1 h-12 rounded-xl border-2 font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  Continue
                </Button>
                <Button 
                  onClick={handleSubmitClick}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary via-primary-glow to-secondary font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
                  disabled={submitting}
                  style={{ boxShadow: '0 10px 30px rgba(0, 123, 255, 0.4)' }}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Required Dialog */}
      {showUpgradeDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <Card 
            className="w-full max-w-lg backdrop-blur-xl bg-card/95 border-2 border-primary/20 rounded-[32px] shadow-2xl animate-scale-in"
            style={{ boxShadow: '0 30px 80px rgba(0, 123, 255, 0.3)' }}
          >
            <CardHeader className="text-center pb-4">
              <div 
                className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-primary-glow/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/30 shadow-xl"
                style={{ boxShadow: 'inset 0 2px 8px rgba(0, 123, 255, 0.2)' }}
              >
                <Lock className="h-10 w-10 text-primary drop-shadow-lg" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Upgrade to Submit Test
              </CardTitle>
              <p className="text-foreground/70 font-semibold mt-3 text-sm sm:text-base">
                Subscribe now to unlock detailed results, analytics, and more!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div 
                  className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/5 border-2 border-primary/20 shadow-lg"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0, 123, 255, 0.05)' }}
                >
                  <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground/90">Submit Tests & View Results</h4>
                    <p className="text-sm text-foreground/70 font-medium mt-1">
                      Access detailed exam results with breakdowns
                    </p>
                  </div>
                </div>

                <div 
                  className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 shadow-lg"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(16, 185, 129, 0.05)' }}
                >
                  <div className="p-2 bg-gradient-to-br from-success to-success-glow rounded-xl">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground/90">Answer Review & Explanations</h4>
                    <p className="text-sm text-foreground/70 font-medium mt-1">
                      Review all questions with detailed explanations
                    </p>
                  </div>
                </div>

                <div 
                  className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 shadow-lg"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0, 180, 180, 0.05)' }}
                >
                  <div className="p-2 bg-gradient-to-br from-secondary to-info rounded-xl">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground/90">Performance Analytics</h4>
                    <p className="text-sm text-foreground/70 font-medium mt-1">
                      Track progress and identify areas for improvement
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeDialog(false)}
                  className="flex-1 h-12 rounded-xl border-2 font-bold hover:scale-105 active:scale-95 transition-all"
                >
                  Continue Practicing
                </Button>
                <Link to="/payment" className="flex-1">
                  <Button 
                    className="w-full h-12 gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-glow to-secondary font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
                    style={{ boxShadow: '0 15px 40px rgba(0, 123, 255, 0.4)' }}
                  >
                    <Crown className="h-5 w-5" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="text-center pt-4 border-t-2 text-sm font-bold text-foreground/70">
                ✓ Cancel anytime · ✓ Instant access · ✓ All exams included
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
