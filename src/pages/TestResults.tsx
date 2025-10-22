import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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

export default function TestResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attempt');
  const { toast } = useToast();
  const { results, loading } = useCleanResults(attemptId);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative pb-24">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-secondary/20 to-success/15 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div 
        className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-br from-primary via-primary-glow to-secondary p-6 shadow-2xl animate-fade-in"
        style={{ boxShadow: '0 20px 60px rgba(0, 123, 255, 0.4)' }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/30 rounded-full blur-2xl animate-pulse" />
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-lg">Exam Results</h1>
          </div>
          <p className="text-white/90 font-semibold">
            {results.percentage >= 50 ? '🎉 Congratulations!' : '💪 Keep practicing!'} Here's how you performed.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {/* Score Card */}
        <Card 
          className="border-2 border-primary/30 overflow-hidden shadow-2xl"
          style={{ boxShadow: '0 20px 60px rgba(0, 123, 255, 0.2)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          <CardContent className="pt-8 relative z-10">
            <div className="text-center">
              <div 
                className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary-glow to-secondary mb-4 shadow-2xl relative"
                style={{ boxShadow: '0 15px 40px rgba(0, 123, 255, 0.5)' }}
              >
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {results.percentage.toFixed(1)}%
                    </div>
                    {results.scaledScore && (
                      <div className="text-sm text-muted-foreground font-bold">
                        {results.scaledScore}/400
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {results.correctAnswers} / {results.totalQuestions} Correct
              </h2>
              
              <div className="flex items-center justify-center gap-2 text-muted-foreground font-semibold">
                <Clock className="h-4 w-4" />
                <span>Completed in {results.timeTakenMinutes} minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border-2 border-success/30 overflow-hidden shadow-xl hover:scale-105 active:scale-95 transition-all"
            style={{ boxShadow: '0 15px 40px rgba(16, 185, 129, 0.2)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success/20">
                  <CheckCircle className="h-4 w-4 text-success" strokeWidth={2.5} />
                </div>
                Correct
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-success drop-shadow-sm">
                {results.correctAnswers}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-destructive/30 overflow-hidden shadow-xl hover:scale-105 active:scale-95 transition-all"
            style={{ boxShadow: '0 15px 40px rgba(239, 68, 68, 0.2)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-xl bg-destructive/20">
                  <XCircle className="h-4 w-4 text-destructive" strokeWidth={2.5} />
                </div>
                Incorrect
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-destructive drop-shadow-sm">
                {results.wrongAnswers}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="border-2 border-warning/30 overflow-hidden shadow-xl hover:scale-105 active:scale-95 transition-all"
            style={{ boxShadow: '0 15px 40px rgba(251, 146, 60, 0.2)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-warning/10 to-transparent" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <div className="p-2 rounded-xl bg-warning/20">
                  <FileText className="h-4 w-4 text-warning" strokeWidth={2.5} />
                </div>
                Unanswered
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-warning drop-shadow-sm">
                {results.unanswered}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Breakdown */}
        {Object.keys(results.subjectBreakdown).length > 0 && (
          <Card 
            className="border-2 border-primary/20 overflow-hidden shadow-xl"
            style={{ boxShadow: '0 15px 40px rgba(0, 123, 255, 0.15)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {Object.entries(results.subjectBreakdown).map(([subject, stats]) => (
                <div key={subject} className="p-4 rounded-2xl bg-gradient-to-br from-white/50 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/30 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-lg">{subject}</span>
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-lg font-bold">
                      {stats.correct} / {stats.total}
                    </Badge>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted/50 overflow-hidden shadow-inner">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-glow to-secondary rounded-full shadow-lg transition-all duration-500"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground font-bold mt-2">
                    {stats.percentage.toFixed(1)}% correct
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate(`/answer-review?attempt=${attemptId}`)}
            size="lg"
            className="h-14 text-base font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
            style={{ boxShadow: '0 10px 30px rgba(0, 123, 255, 0.4)' }}
          >
            <FileText className="h-5 w-5 mr-2" strokeWidth={2.5} />
            Review Answers
          </Button>
          
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            variant="secondary"
            size="lg"
            className="h-14 text-base font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {downloading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" strokeWidth={2.5} />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" strokeWidth={2.5} />
                Download Results
              </>
            )}
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="h-14 text-base font-bold border-2 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
