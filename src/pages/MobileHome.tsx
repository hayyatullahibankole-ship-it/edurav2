import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  Zap,
  ChevronRight,
  Play,
  Award,
  Sparkles,
  User,
  LogOut
} from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import MobileNav from '@/components/MobileNav';
import { useSubscription } from '@/hooks/useSubscription';
import { playTapSound } from '@/utils/sounds';

const MobileHome = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    testsTaken: 0,
    averageScore: 0,
    studyHours: 0,
    rank: 0
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchStats();
    }
  }, [userProfile]);

  const fetchStats = async () => {
    try {
      const { data: attempts } = await supabase
        .rpc('get_student_exam_progress');
      
      const userAttempts = attempts?.filter(a => 
        a.user_id === userProfile?.id && a.status === 'SUBMITTED'
      ) || [];

      const attemptsWithResults = await Promise.all(
        userAttempts.map(async (attempt) => {
          const { data: result } = await supabase
            .from("results")
            .select("*")
            .eq("attempt_id", attempt.id)
            .maybeSingle();
          return { ...attempt, results: result ? [result] : [] };
        })
      );

      const testsTaken = attemptsWithResults.length;
      const resultsWithScores = attemptsWithResults.filter(a => a.results?.length > 0);
      const averageScore = resultsWithScores.length > 0
        ? Math.round(resultsWithScores.reduce((sum, a) => sum + (a.results[0]?.percentage || 0), 0) / resultsWithScores.length)
        : 0;
      const studyHours = Math.round(
        resultsWithScores.reduce((sum, a) => sum + (a.results[0]?.time_taken_minutes || 0), 0) / 60
      );

      setStats({ testsTaken, averageScore, studyHours, rank: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleNavigation = async (path: string) => {
    await Haptics.impact({ style: ImpactStyle.Light });
    playTapSound();
    navigate(path);
  };

  const handleLogout = async () => {
    await Haptics.impact({ style: ImpactStyle.Medium });
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent p-6 pb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <img src="/src/assets/edura-logo.png" alt="Edura" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                {isPremium ? (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Premium
                  </span>
                ) : 'Free'}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleLogout}
                className="h-8 w-8 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {userProfile?.first_name || 'Student'}! 👋
            </h1>
            <p className="text-white/80 text-sm">
              {stats.averageScore > 0 ? `${stats.averageScore}% average score` : 'Ready to start learning?'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 text-center">
                <Target className="h-5 w-5 text-white mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{stats.testsTaken}</div>
                <div className="text-xs text-white/80">Tests</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-5 w-5 text-white mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{stats.averageScore}%</div>
                <div className="text-xs text-white/80">Average</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 text-white mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{stats.studyHours}h</div>
                <div className="text-xs text-white/80">Study</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4 -mt-4">
        {/* Quick Start Test */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-lg">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Start Practice Test</h3>
                <p className="text-sm text-muted-foreground">Continue your exam prep</p>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90"
                onClick={() => handleNavigation('/dashboard')}
              >
                Start
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold px-1">Explore Features</h2>
          
          {/* Challenge Arena */}
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98]"
            onClick={() => handleNavigation('/challenge-arena')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-warning to-destructive rounded-xl">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">Challenge Arena</h3>
                <p className="text-xs text-muted-foreground">Compete & win prizes</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Resources */}
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98]"
            onClick={() => handleNavigation('/resources')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-info to-secondary rounded-xl">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">Study Resources</h3>
                <p className="text-xs text-muted-foreground">Past questions & materials</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Consultation */}
          <Card 
            className="border-0 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98]"
            onClick={() => handleNavigation('/consultation')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-accent to-primary rounded-xl">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">Expert Tutors</h3>
                <p className="text-xs text-muted-foreground">Book consultation sessions</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Subscription CTA */}
        {!isPremium && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/10 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-1">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unlock unlimited tests, detailed analytics, and expert support
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-accent to-primary"
                    onClick={() => handleNavigation('/payment')}
                  >
                    Go Premium
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeTab="dashboard" onTabChange={(tab) => {
        if (tab === "profile") navigate('/dashboard?tab=profile');
        else if (tab === "settings") navigate('/dashboard?tab=settings');
      }} />
    </div>
  );
};

export default MobileHome;
