import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, CheckCircle, TrendingUp, BarChart3, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultsPaywallProps {
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
}

export function ResultsPaywall({ percentage, totalQuestions, correctAnswers }: ResultsPaywallProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Your Test is Complete!</h1>
          </div>
          <p className="text-primary-foreground/80">
            Unlock your full results and detailed analysis
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Preview Score Card */}
        <Card className="border-2 border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <CardContent className="pt-6 relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Your Score
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {correctAnswers} / {totalQuestions} Correct
              </h2>
              
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Test Submitted Successfully
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Locked Features */}
        <Card className="border-2 border-accent/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Unlock Full Results
              </CardTitle>
              <Crown className="h-6 w-6 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Subscribe now to access your complete performance analysis and take your preparation to the next level!
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Detailed Subject Breakdown</h3>
                  <p className="text-sm text-muted-foreground">
                    See your performance across all subjects with visual charts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Answer Review & Explanations</h3>
                  <p className="text-sm text-muted-foreground">
                    Review all questions with detailed explanations for correct answers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your progress over time and identify areas for improvement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Downloadable PDF Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Get professional exam reports you can save and share
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/payment" className="flex-1">
                <Button size="lg" className="w-full gap-2">
                  <Crown className="h-5 w-5" />
                  Unlock Results Now
                </Button>
              </Link>
              
              <Link to="/dashboard" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                🎯 Join thousands of students who improved their scores
              </p>
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <span>✓ Cancel anytime</span>
                <span>✓ Instant access</span>
                <span>✓ All exams included</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
