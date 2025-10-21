import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock,
  ChevronRight,
  Flame,
  Settings,
  FileText,
  TrendingUp,
  Calculator,
  Beaker,
  Microscope,
  Globe,
  Search,
  Sparkles,
  Library,
  Award,
  GraduationCap,
  MessageCircle,
  Calendar
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import MobileNav from '@/components/MobileNav';
import { useSubscription } from '@/hooks/useSubscription';
import { playTapSound } from '@/utils/sounds';
import ProfileSettings from '@/components/ProfileSettings';
import WhatsAppButton from '@/components/WhatsAppButton';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import NotificationBell from '@/components/NotificationBell';
import { AIAssistant } from '@/components/AIAssistant';

const MobileHome = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isPremium } = useSubscription();
  usePushNotifications();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    testsTaken: 0,
    averageScore: 0,
    studyHours: 0,
  });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [dailyGoal, setDailyGoal] = useState({ answered: 0, target: 20 });
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const motivationalQuotes = [
    "Success is the sum of small efforts repeated daily.",
    "The expert in anything was once a beginner.",
    "Study hard, stay focused, and achieve greatness!",
    "Every question you answer brings you closer to your goal.",
    "Consistency is the key to mastering any subject."
  ];

  useEffect(() => {
    if (userProfile?.id) {
      fetchStats();
      fetchStreak();
      fetchDailyGoal();
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

      setStats({ testsTaken, averageScore, studyHours });

      // Fetch recent results
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

  const fetchStreak = async () => {
    try {
      const { data: attempts } = await supabase
        .from('attempts')
        .select('submitted_at')
        .eq('user_id', userProfile?.id)
        .eq('status', 'SUBMITTED')
        .order('submitted_at', { ascending: false });

      if (!attempts || attempts.length === 0) {
        setStreak({ current: 0, longest: 0 });
        return;
      }

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastTest = new Date(attempts[0].submitted_at);
      lastTest.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        currentStreak = 1;
        
        for (let i = 1; i < attempts.length; i++) {
          const prevDate = new Date(attempts[i - 1].submitted_at);
          const currDate = new Date(attempts[i].submitted_at);
          prevDate.setHours(0, 0, 0, 0);
          currDate.setHours(0, 0, 0, 0);
          
          const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diff === 1) {
            currentStreak++;
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
      setStreak({ current: currentStreak, longest: longestStreak });
    } catch (error) {
      console.error('Error fetching streak:', error);
    }
  };

  const fetchDailyGoal = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayAttempts } = await supabase
        .from('attempts')
        .select('id')
        .eq('user_id', userProfile?.id)
        .gte('created_at', today.toISOString());

      if (todayAttempts) {
        const { count } = await supabase
          .from('attempt_answers')
          .select('*', { count: 'exact', head: true })
          .in('attempt_id', todayAttempts.map(a => a.id))
          .not('answer', 'is', null);

        setDailyGoal({ answered: count || 0, target: 20 });
      }
    } catch (error) {
      console.error('Error fetching daily goal:', error);
    }
  };

  const handleNavigation = async (path: string) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    playTapSound();
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-24">
      {/* Header with Search */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/40 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white font-bold text-lg">
                {userProfile?.first_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h2 className="font-bold text-lg">{userProfile?.first_name || 'Student'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfileSheet(true)}
              className="rounded-full hover:bg-primary/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <NotificationBell />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects, tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50 rounded-xl"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-5">
        {/* Stats Overview Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Progress</p>
                <h3 className="text-2xl font-bold">{stats.testsTaken} Tests Taken</h3>
              </div>
              <div className="p-3 rounded-2xl bg-primary/20">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-card/50">
                <p className="text-2xl font-bold text-primary">{stats.averageScore}%</p>
                <p className="text-xs text-muted-foreground mt-1">Average</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/50">
                <p className="text-2xl font-bold text-success">{stats.studyHours}h</p>
                <p className="text-xs text-muted-foreground mt-1">Study Time</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-card/50">
                <p className="text-2xl font-bold text-warning">{streak.current}</p>
                <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Grid */}
        <div>
          <h3 className="text-base font-bold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Your Subjects
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleNavigation('/cbt-exam?subject=Mathematics')}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">Mathematics</p>
                  <p className="text-xs text-muted-foreground">35 Topics</p>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleNavigation('/cbt-exam?subject=Physics')}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">Physics</p>
                  <p className="text-xs text-muted-foreground">28 Topics</p>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleNavigation('/cbt-exam?subject=Chemistry')}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Beaker className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">Chemistry</p>
                  <p className="text-xs text-muted-foreground">32 Topics</p>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleNavigation('/cbt-exam?subject=Biology')}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-teal-500/10 to-teal-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Microscope className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">Biology</p>
                  <p className="text-xs text-muted-foreground">30 Topics</p>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleNavigation('/cbt-exam?subject=English')}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">English</p>
                  <p className="text-xs text-muted-foreground">25 Topics</p>
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => handleNavigation('/study-hub')}
              className="group"
            >
              <Card className="border-0 shadow-md hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-pink-500/10 to-pink-500/5">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-0.5">More</p>
                  <p className="text-xs text-muted-foreground">View All</p>
                </CardContent>
              </Card>
            </button>
          </div>
        </div>

        {/* Streak & Daily Goal */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak */}
          {streak.current > 0 && (
            <Card className="border-0 shadow-md bg-gradient-to-br from-warning/10 to-warning/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-warning/20">
                    <Flame className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{streak.current}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Daily Goal */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-success/10 to-success/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-success/20">
                  <Target className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold">{dailyGoal.answered}/{dailyGoal.target}</p>
                  <p className="text-xs text-muted-foreground">Daily Goal</p>
                </div>
              </div>
              <Progress 
                value={(dailyGoal.answered / dailyGoal.target) * 100} 
                className="h-1.5"
              />
            </CardContent>
          </Card>
        </div>

        {/* Motivational Quote */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-relaxed mb-1">
                  {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
                </p>
                <p className="text-xs text-muted-foreground">Keep pushing! 🚀</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Recent Tests
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/performance-report')}
                className="text-xs h-8 text-primary hover:text-primary"
              >
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {recentResults.map((result) => (
                <Card
                  key={result.id}
                  onClick={() => navigate(`/results?attempt=${result.attempt_id}`)}
                  className="border-0 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{result.examTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        result.percentage >= 75 ? 'bg-success/20 text-success' :
                        result.percentage >= 50 ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {result.percentage}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="font-bold text-base mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleNavigation('/study-hub')}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-primary to-primary-hover shadow-lg hover:shadow-xl"
              size="lg"
            >
              <Library className="h-6 w-6" />
              <span className="text-sm font-semibold">Study Hub</span>
            </Button>
            
            <Button
              onClick={() => handleNavigation('/performance-report')}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-info to-info/80 shadow-lg hover:shadow-xl"
              size="lg"
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm font-semibold">Analytics</span>
            </Button>
            
            <Button
              onClick={() => handleNavigation('/forum')}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-secondary to-secondary/80 shadow-lg hover:shadow-xl"
              size="lg"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm font-semibold">Forum</span>
            </Button>
            
            <Button
              onClick={() => handleNavigation('/challenge-arena')}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-warning to-warning/80 shadow-lg hover:shadow-xl"
              size="lg"
            >
              <Award className="h-6 w-6" />
              <span className="text-sm font-semibold">Challenges</span>
            </Button>
          </div>
        </div>

        {/* Premium CTA */}
        {!isPremium && (
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-primary/20 flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-base mb-1">Upgrade to Premium</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unlock unlimited tests, AI tutor, and exclusive features
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => navigate('/payment')}
                    className="bg-primary hover:bg-primary-hover shadow-md"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Settings Sheet */}
      <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Profile Settings</SheetTitle>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto">
            <ProfileSettings />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Navigation */}
      <MobileNav activeTab="dashboard" onTabChange={(tab) => {
        if (tab === "profile") setShowProfileSheet(true);
      }} />

      {/* WhatsApp Support */}
      <WhatsAppButton />

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default MobileHome;
