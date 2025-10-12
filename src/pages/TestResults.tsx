import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCleanResults } from '@/hooks/useCleanResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateExamReportPDF } from '@/utils/pdfGenerator';
import { useSubscription } from '@/hooks/useSubscription';
import { ResultsPaywall } from '@/components/ResultsPaywall';

export default function TestResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attempt');
  const { toast } = useToast();
  const { hasPremiumAccess, isPremium, loading: subscriptionLoading } = useSubscription();
  
  // Fetch basic stats for paywall (always fetch, use conditionally)
  const [basicStats, setBasicStats] = useState<{ percentage: number; total: number; correct: number } | null>(null);
  const [fetchingBasicStats, setFetchingBasicStats] = useState(false);
  
  useEffect(() => {
    const fetchBasicStats = async () => {
      if (!attemptId || hasPremiumAccess || isPremium || subscriptionLoading) return;
      
      setFetchingBasicStats(true);
      try {
        // Fetch attempt answers to calculate basic percentage for paywall
        const { data: answers } = await supabase
          .from('attempt_answers')
          .select('is_correct')
          .eq('attempt_id', attemptId);
        
        if (answers) {
          const total = answers.length;
          const correct = answers.filter(a => a.is_correct === true).length;
          const percentage = total > 0 ? (correct / total) * 100 : 0;
          setBasicStats({ percentage, total, correct });
        }
      } catch (error) {
        console.error('Error fetching basic stats:', error);
      } finally {
        setFetchingBasicStats(false);
      }
    };
    
    fetchBasicStats();
  }, [attemptId, hasPremiumAccess, isPremium, subscriptionLoading]);
  
  // Only load full results if user has premium access
  const shouldLoadResults = !subscriptionLoading && (hasPremiumAccess || isPremium);
  const { results, loading } = useCleanResults(shouldLoadResults ? attemptId : null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!results || !attemptId) return;

    try {
      setDownloading(true);

      // Fetch additional data needed for PDF
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [userProfileResp, attemptResp] = await Promise.all([
        supabase.from('users').select('first_name, last_name, email').eq('auth_user_id', user.id).single(),
        supabase.from('attempts').select('proctoring_data, started_at').eq('id', attemptId).single()
      ]);

      const userProfile = userProfileResp.data;
      const attemptData = attemptResp.data;

      if (!userProfile || !attemptData) {
        throw new Error('Failed to fetch required data');
      }

      const proctorData = attemptData.proctoring_data as any;
      const examTitle = proctorData?.title || 'Practice Test';
      const durationMinutes = proctorData?.duration_minutes || 180;

      // Prepare data for PDF generator
      const pdfData = {
        examTitle,
        studentName: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Student',
        studentEmail: userProfile.email || user.email || '',
        examDate: new Date(attemptData.started_at || results.createdAt).toLocaleDateString(),
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        wrongAnswers: results.wrongAnswers,
        unanswered: results.unanswered,
        score: results.rawScore,
        percentage: results.percentage,
        timeTaken: results.timeTakenMinutes,
        timeAllotted: durationMinutes,
        subjectBreakdown: results.subjectBreakdown,
        attemptId: results.attemptId
      };

      await generateExamReportPDF(pdfData);

      toast({
        title: 'Success',
        description: 'Results PDF downloaded successfully'
      });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDownloading(false);
    }
  };

  // Show loading only while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // Show paywall IMMEDIATELY if no premium access (before loading full results)
  if (!hasPremiumAccess && !isPremium) {
    if (fetchingBasicStats || !basicStats) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Processing your submission...</p>
          </div>
        </div>
      );
    }
    
    return (
      <ResultsPaywall
        percentage={basicStats.percentage}
        totalQuestions={basicStats.total}
        correctAnswers={basicStats.correct}
      />
    );
  }

  // Loading full results (only for premium users)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Results not found (for premium users only)
  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Results not found</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Exam Results</h1>
          </div>
          <p className="text-primary-foreground/80">
            {results.percentage >= 50 ? 'Congratulations!' : 'Keep practicing!'} Here's how you performed.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Score Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {results.percentage.toFixed(1)}%
                  </div>
                  {results.scaledScore && (
                    <div className="text-sm text-muted-foreground">
                      {results.scaledScore}/400
                    </div>
                  )}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {results.correctAnswers} / {results.totalQuestions} Correct
              </h2>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Completed in {results.timeTakenMinutes} minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Correct
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {results.correctAnswers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Incorrect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {results.wrongAnswers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                Unanswered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {results.unanswered}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Breakdown */}
        {Object.keys(results.subjectBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(results.subjectBreakdown).map(([subject, stats]) => (
                <div key={subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{subject}</span>
                    <Badge variant="outline">
                      {stats.correct} / {stats.total}
                    </Badge>
                  </div>
                  <Progress value={stats.percentage} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.percentage.toFixed(1)}% correct
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate(`/answer-review?attempt=${attemptId}`)}
            size="lg"
            className="flex-1"
          >
            <FileText className="h-5 w-5 mr-2" />
            Review Answers
          </Button>
          
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            {downloading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Results
              </>
            )}
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
