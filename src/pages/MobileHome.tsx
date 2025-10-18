import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  LogOut,
  GraduationCap,
  FileText
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import MobileNav from '@/components/MobileNav';
import { useSubscription } from '@/hooks/useSubscription';
import { playTapSound } from '@/utils/sounds';
import eduraLogo from '@/assets/edura-logo.png';
import ScheduleTestModal from '@/components/ScheduleTestModal';
import ProfileSettings from '@/components/ProfileSettings';
import WhatsAppButton from '@/components/WhatsAppButton';

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
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);

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

      // Fetch recent results (last 3)
      const recentWithExam = await Promise.all(
        attemptsWithResults
          .filter(a => a.results?.length > 0)
          .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
          .slice(0, 3)
          .map(async (attempt) => {
            const { data: exam } = await supabase
              .from('exams')
              .select('title, type')
              .eq('id', attempt.exam_id)
              .single();
            return {
              ...attempt.results[0],
              examTitle: exam?.title || 'Test',
              examType: exam?.type || 'JAMB',
              submittedAt: attempt.submitted_at
            };
          })
      );
      setRecentResults(recentWithExam);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleNavigation = async (path: string) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    playTapSound();
    navigate(path);
  };

  const handleLogout = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
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
              <img src={eduraLogo} alt="Edura" className="h-8 w-auto" />
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
                onClick={() => {
                  if (Capacitor.isNativePlatform()) {
                    Haptics.impact({ style: ImpactStyle.Light });
                  }
                  playTapSound();
                  setShowTestPanel(true);
                }}
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

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold">Recent Results</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/dashboard?tab=results')}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentResults.map((result, index) => (
                <Card 
                  key={index} 
                  className="border-0 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer"
                  onClick={() => handleNavigation(`/results/${result.attempt_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        result.percentage >= 70 ? 'bg-success/10' : 
                        result.percentage >= 50 ? 'bg-warning/10' : 'bg-destructive/10'
                      }`}>
                        <Target className={`h-5 w-5 ${
                          result.percentage >= 70 ? 'text-success' : 
                          result.percentage >= 50 ? 'text-warning' : 'text-destructive'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm">{result.examTitle}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          result.percentage >= 70 ? 'text-success' : 
                          result.percentage >= 50 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {Math.round(result.percentage)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.correct_answers}/{result.total_questions}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Your Progress */}
        {stats.testsTaken > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold px-1">Your Progress</h2>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Keep it up!</p>
                      <p className="text-xs text-muted-foreground">You're doing great</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{stats.testsTaken}</p>
                    <p className="text-xs text-muted-foreground">tests taken</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

      {/* WhatsApp Support Button */}
      <WhatsAppButton />

      {/* Mobile Navigation */}
      <MobileNav activeTab="dashboard" onTabChange={(tab) => {
        if (tab === "profile") {
          if (Capacitor.isNativePlatform()) {
            Haptics.impact({ style: ImpactStyle.Light });
          }
          playTapSound();
          setShowProfileSheet(true);
        } else if (tab === "study") {
          navigate('/study-hub');
        } else if (tab === "forum") {
          navigate('/forum');
        } else if (tab === "settings") {
          navigate('/dashboard?tab=settings');
        }
      }} />

      {/* Test Selection Sheet */}
      <Sheet open={showTestPanel} onOpenChange={setShowTestPanel}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="h-6 w-6" />
              Choose Your Test
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-3 overflow-y-auto h-[calc(85vh-100px)]">
            {/* JAMB Test */}
            <ScheduleTestModal defaultExamType="JAMB">
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary to-primary-glow rounded-xl">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">JAMB CBT</h3>
                      <p className="text-xs text-muted-foreground">Practice JAMB UTME questions</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </ScheduleTestModal>

            {/* WAEC Test */}
            <ScheduleTestModal defaultExamType="WAEC">
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-success to-success-glow rounded-xl">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">WAEC</h3>
                      <p className="text-xs text-muted-foreground">WAEC past questions</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </ScheduleTestModal>

            {/* NECO Test */}
            <ScheduleTestModal defaultExamType="NECO">
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-info to-secondary rounded-xl">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">NECO</h3>
                      <p className="text-xs text-muted-foreground">NECO exam preparation</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </ScheduleTestModal>

            {/* Post-UTME Test */}
            <ScheduleTestModal defaultExamType="POST-UTME">
              <Card className="border-2 hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-accent to-primary rounded-xl">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base">Post-UTME</h3>
                      <p className="text-xs text-muted-foreground">University screening prep</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </ScheduleTestModal>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Sheet */}
      <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto h-[calc(90vh-80px)]">
            <ProfileSettings />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileHome;
