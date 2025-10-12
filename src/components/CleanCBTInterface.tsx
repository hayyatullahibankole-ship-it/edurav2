import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MathRenderer } from '@/components/ui/math-renderer';
import { Clock, ChevronLeft, ChevronRight, Check, Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CBTQuestion, CBTAnswers } from '@/hooks/useCBTExam';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface CleanCBTInterfaceProps {
  questions: CBTQuestion[];
  answers: CBTAnswers;
  onAnswerSelect: (questionId: string, optionIndex: number) => void;
  onSubmit: (timeSpent: number) => void;
  duration: number;
  examTitle?: string;
}

export const CleanCBTInterface: React.FC<CleanCBTInterfaceProps> = ({
  questions,
  answers,
  onAnswerSelect,
  onSubmit,
  duration,
  examTitle = 'CBT Exam'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
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

  const handleSubmitClick = () => {
    // Block submission for free/basic users
    if (!subscriptionLoading && !canAccessPremium) {
      setShowSubmitDialog(false);
      setShowUpgradeDialog(true);
      return;
    }
    const timeSpent = (duration * 60) - timeLeft;
    onSubmit(timeSpent);
  };

  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{examTitle}</h1>
            <p className="text-sm opacity-90">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/10 px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-mono text-lg font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSubmitDialog(true)}
            >
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-card border-b p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length} / {questions.length} answered
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Question {currentIndex + 1}
              </CardTitle>
              <Badge variant="outline">{currentQuestion.subject}</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div>
              <MathRenderer 
                content={currentQuestion.questionText}
                className="text-lg font-medium leading-relaxed"
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
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 mr-3 flex items-center justify-center font-semibold",
                        isSelected 
                          ? "border-primary bg-primary text-primary-foreground" 
                          : "border-muted-foreground text-muted-foreground"
                      )}>
                        {isSelected ? <Check className="h-5 w-5" /> : optionLabel}
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
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {questions.length}
              </span>

              <Button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
          </div>

          {/* Sidebar - Quick navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      !isCurrent && isAnswered && "border-green-500 bg-green-50 text-green-700",
                      !isCurrent && !isAnswered && "border-muted text-muted-foreground hover:border-muted-foreground"
                    )}
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
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Submit Exam?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(answers).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Answered</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {questions.length - Object.keys(answers).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unanswered</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSubmitDialog(false)}
                  className="flex-1"
                >
                  Continue
                </Button>
                <Button 
                  onClick={handleSubmitClick}
                  className="flex-1"
                >
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Required Dialog */}
      {showUpgradeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Upgrade to Submit Test</CardTitle>
              <p className="text-muted-foreground mt-2">
                Subscribe now to submit your test and unlock detailed results, analytics, and more!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Crown className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Submit Tests & View Results</h4>
                    <p className="text-sm text-muted-foreground">
                      Access detailed exam results with breakdowns
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Crown className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Answer Review & Explanations</h4>
                    <p className="text-sm text-muted-foreground">
                      Review all questions with detailed explanations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Crown className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Performance Analytics</h4>
                    <p className="text-sm text-muted-foreground">
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
                  className="flex-1"
                >
                  Continue Practicing
                </Button>
                <Link to="/payment" className="flex-1">
                  <Button className="w-full gap-2">
                    <Crown className="h-5 w-5" />
                    Upgrade Now
                  </Button>
                </Link>
              </div>

              {/* Trust Badge */}
              <div className="text-center pt-4 border-t text-sm text-muted-foreground">
                ✓ Cancel anytime · ✓ Instant access · ✓ All exams included
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
