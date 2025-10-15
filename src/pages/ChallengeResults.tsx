import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Clock, Target, ArrowLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';

interface ChallengeResultData {
  challengeTitle: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  pointsEarned: number;
  rank: number;
  totalParticipants: number;
}

export default function ChallengeResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [results, setResults] = useState<ChallengeResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId || !userProfile) return;

    const fetchResults = async () => {
      try {
        // Fetch attempt data
        const { data: attemptData, error: attemptError } = await supabase
          .from('attempts')
          .select('proctoring_data')
          .eq('id', attemptId)
          .single();

        if (attemptError) throw attemptError;

        const proctoringData = attemptData?.proctoring_data as any;
        const challengeId = proctoringData?.challenge_id;
        const challengeTitle = proctoringData?.challenge_title || 'Challenge';

        // Fetch challenge attempt data
        const { data: challengeAttempt, error: challengeError } = await supabase
          .from('challenge_attempts')
          .select('*')
          .eq('challenge_id', challengeId)
          .eq('user_id', userProfile.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (challengeError) throw challengeError;

        // Get rank and total participants
        const { data: allAttempts, error: rankError } = await supabase
          .from('challenge_attempts')
          .select('score')
          .eq('challenge_id', challengeId)
          .order('score', { ascending: false });

        if (rankError) throw rankError;

        const userRank = (allAttempts?.findIndex(a => a.score === challengeAttempt.score) || 0) + 1;

        setResults({
          challengeTitle,
          score: challengeAttempt.score,
          correctAnswers: challengeAttempt.correct_answers,
          totalQuestions: challengeAttempt.total_questions,
          timeTaken: challengeAttempt.time_taken_seconds,
          pointsEarned: challengeAttempt.points_earned,
          rank: userRank,
          totalParticipants: allAttempts?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching challenge results:', error);
        toast.error('Failed to load challenge results');
        navigate('/challenge-arena');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, userProfile, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!results) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Results not found</p>
              <Button onClick={() => navigate('/challenge-arena')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Challenge Arena
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const percentage = (results.correctAnswers / results.totalQuestions) * 100;
  const minutesTaken = Math.floor(results.timeTaken / 60);
  const secondsTaken = results.timeTaken % 60;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Congratulations Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Congratulations!</h1>
          <p className="text-lg text-muted-foreground">
            You've completed <span className="font-semibold text-foreground">{results.challengeTitle}</span>
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Your Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-primary mb-2">
                {percentage.toFixed(1)}%
              </div>
              <p className="text-muted-foreground">
                {results.correctAnswers} out of {results.totalQuestions} correct
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{results.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{minutesTaken}:{secondsTaken.toString().padStart(2, '0')}</div>
                <div className="text-sm text-muted-foreground">Time</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-muted/50">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">#{results.rank}</div>
                <div className="text-sm text-muted-foreground">Rank</div>
              </div>

              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{results.pointsEarned}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rank Badge */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-6 py-2">
                You're ranked #{results.rank} out of {results.totalParticipants} participants!
              </Badge>
              {results.rank <= 3 && (
                <p className="text-primary font-semibold mt-4">
                  🎉 Amazing! You're in the top 3!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(`/answer-review?attempt=${attemptId}`)}
            variant="default"
            size="lg"
          >
            Review Answers
          </Button>
          <Button 
            onClick={() => navigate('/challenge-arena')}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Arena
          </Button>
        </div>
      </div>
    </Layout>
  );
}
