import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock,
  Zap,
  ChevronRight,
  Award,
  Sparkles,
  LogOut,
  GraduationCap,
  FileText,
  Flame,
  Calendar,
  Settings,
  Bell,
  Calculator,
  Beaker,
  Microscope,
  Library,
  MessageCircle
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
    rank: 0
  });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [dailyGoal, setDailyGoal] = useState({ answered: 0, target: 20 });
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);

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
      fetchLeaderboard();
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

      setStats({ testsTaken, averageScore, studyHours, rank: 0 });

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

  const fetchLeaderboard = async () => {
    try {
      const { data: topUsers } = await supabase
        .rpc('get_student_exam_progress');

      if (!topUsers) return;

      const userScores = new Map();
      
      for (const attempt of topUsers) {
        if (attempt.status === 'SUBMITTED') {
          const { data: result } = await supabase
            .from('results')
            .select('percentage')
            .eq('attempt_id', attempt.id)
            .maybeSingle();

          if (result) {
            const userId = attempt.user_id;
            if (!userScores.has(userId)) {
              userScores.set(userId, { total: 0, count: 0, userId });
            }
            const userData = userScores.get(userId);
            userData.total += result.percentage;
            userData.count += 1;
          }
        }
      }

      const leaderboardData = Array.from(userScores.values())
        .map(u => ({ userId: u.userId, avgScore: Math.round(u.total / u.count), testCount: u.count }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5);

      const enrichedLeaderboard = await Promise.all(
        leaderboardData.map(async (entry, index) => {
          const { data: user } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', entry.userId)
            .single();
          
          return {
            rank: index + 1,
            name: user ? `${user.first_name} ${user.last_name}` : 'Anonymous',
            score: entry.avgScore,
            isCurrentUser: entry.userId === userProfile?.id
          };
        })
      );

      setLeaderboard(enrichedLeaderboard);
      
      const userRank = enrichedLeaderboard.find(u => u.isCurrentUser)?.rank || 0;
      setStats(prev => ({ ...prev, rank: userRank }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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

  const handleLogout = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Vibrant Header with Gradient */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-glow to-secondary text-white p-6 pb-10 rounded-b-[2.5rem] shadow-2xl">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-3 border-white/30 shadow-xl ring-2 ring-white/20">
                <AvatarFallback className="bg-white text-primary font-bold text-lg">
                  {userProfile?.first_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs opacity-90 font-medium">Welcome back,</p>
                <h2 className="font-bold text-xl">{userProfile?.first_name || 'Student'}</h2>
                <p className="text-xs opacity-80">{isPremium ? '✨ Premium' : 'Free'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfileSheet(true)}
                className="text-white hover:bg-white/20 rounded-xl h-10 w-10 backdrop-blur-sm"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <NotificationBell />
            </div>
          </div>

          {/* Greeting Message */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <p className="text-sm font-medium mb-1">Hi, what would you learn today?</p>
            <div className="flex items-center gap-2 text-xs opacity-90">
              <Calendar className="h-3 w-3" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-6 -mt-6 relative z-20 animate-fade-in">
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#FF6B9D] to-[#FF8FAB] rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stats.testsTaken}</p>
            <p className="text-xs opacity-90">Tests Taken</p>
          </div>
          <div className="bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stats.averageScore}%</p>
            <p className="text-xs opacity-90">Average Score</p>
          </div>
        </div>

        {/* Subject Grid */}
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Your Subjects
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/cbt-exam?subject=Mathematics')}
              className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] rounded-2xl p-4 text-white text-left shadow-lg active:scale-95 transition-transform"
            >
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3 backdrop-blur-sm">
                <Calculator className="h-6 w-6" />
              </div>
              <p className="font-bold text-sm mb-1">Mathematics</p>
              <p className="text-xs opacity-90">35 Topics</p>
            </button>
            
            <button
              onClick={() => navigate('/cbt-exam?subject=Physics')}
              className="bg-gradient-to-br from-[#5B7FD9] to-[#7B9EF5] rounded-2xl p-4 text-white text-left shadow-lg active:scale-95 transition-transform"
            >
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3 backdrop-blur-sm">
                <Zap className="h-6 w-6" />
              </div>
              <p className="font-bold text-sm mb-1">Physics</p>
              <p className="text-xs opacity-90">28 Topics</p>
            </button>
            
            <button
              onClick={() => navigate('/cbt-exam?subject=Chemistry')}
              className="bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] rounded-2xl p-4 text-white text-left shadow-lg active:scale-95 transition-transform"
            >
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3 backdrop-blur-sm">
                <Beaker className="h-6 w-6" />
              </div>
              <p className="font-bold text-sm mb-1">Chemistry</p>
              <p className="text-xs opacity-90">32 Topics</p>
            </button>
            
            <button
              onClick={() => navigate('/cbt-exam?subject=Biology')}
              className="bg-gradient-to-br from-[#95E1D3] to-[#70C9B0] rounded-2xl p-4 text-white text-left shadow-lg active:scale-95 transition-transform"
            >
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3 backdrop-blur-sm">
                <Microscope className="h-6 w-6" />
              </div>
              <p className="font-bold text-sm mb-1">Biology</p>
              <p className="text-xs opacity-90">30 Topics</p>
            </button>
          </div>
        </div>

        {/* Study Streak */}
        {streak.current > 0 && (
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-warning/10 via-warning/5 to-transparent">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-warning to-warning/80 shadow-lg">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Study Streak</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-warning to-warning-glow bg-clip-text text-transparent">
                      {streak.current} days
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Best Streak</p>
                  <p className="text-lg font-bold">{streak.longest} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Goal Progress */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-success/10 via-success/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success/20">
                  <Target className="h-4 w-4 text-success" />
                </div>
                <h4 className="font-bold text-sm">Daily Goal</h4>
              </div>
              <span className="text-xs font-semibold text-success">
                {dailyGoal.answered}/{dailyGoal.target}
              </span>
            </div>
            <Progress 
              value={(dailyGoal.answered / dailyGoal.target) * 100} 
              className="h-2.5 bg-success/20"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {dailyGoal.answered >= dailyGoal.target 
                ? '🎉 Goal achieved!' 
                : `${dailyGoal.target - dailyGoal.answered} more to reach your goal!`}
            </p>
          </CardContent>
        </Card>

        {/* Motivational Quote */}
        <Card className="border-0 shadow-lg overflow-hidden relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
          <CardContent className="p-5 relative">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/20 flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1 leading-relaxed">
                  {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
                </p>
                <p className="text-xs text-muted-foreground">Keep pushing forward! 🚀</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        {recentResults.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Recent Results
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/performance-report')}
                className="text-primary hover:text-primary h-8 text-xs"
              >
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentResults.slice(0, 3).map((result) => (
                <div
                  key={result.id}
                  onClick={() => navigate(`/results?attempt=${result.attempt_id}`)}
                  className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{result.examTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className={`px-3 py-1.5 rounded-full font-bold text-sm text-white ${
                        result.percentage >= 75 ? 'bg-gradient-to-r from-success to-success-glow' :
                        result.percentage >= 50 ? 'bg-gradient-to-r from-warning to-warning' :
                        'bg-gradient-to-r from-destructive to-destructive'
                      }`}>
                        {Math.round(result.percentage)}%
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowTestPanel(true)}
              className="h-auto py-5 px-4 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary text-white shadow-lg active:scale-95 transition-transform text-left"
            >
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3 backdrop-blur-sm">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold block">Practice Test</span>
              <span className="text-xs opacity-90">Start practicing</span>
            </button>
            
            <button
              onClick={() => navigate('/challenge-arena')}
              className="h-auto py-5 px-4 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FF8FAB] text-white shadow-lg active:scale-95 transition-transform text-left"
            >
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3 backdrop-blur-sm">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold block">Challenge</span>
              <span className="text-xs opacity-90">Compete now</span>
            </button>
            
            <button
              onClick={() => navigate('/resources')}
              className="h-auto py-5 px-4 rounded-2xl bg-card border-2 border-border hover:border-primary/30 hover:bg-primary/5 shadow-md active:scale-95 transition-all text-left"
            >
              <div className="p-2 bg-primary/10 rounded-xl w-fit mb-3">
                <Library className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-bold block">Resources</span>
              <span className="text-xs text-muted-foreground">Study materials</span>
            </button>
            
            <button
              onClick={() => navigate('/consultation')}
              className="h-auto py-5 px-4 rounded-2xl bg-card border-2 border-border hover:border-primary/30 hover:bg-primary/5 shadow-md active:scale-95 transition-all text-left"
            >
              <div className="p-2 bg-primary/10 rounded-xl w-fit mb-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-bold block">Get Help</span>
              <span className="text-xs text-muted-foreground">Ask expert</span>
            </button>
          </div>
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

      {/* WhatsApp Support Button */}
      <WhatsAppButton />

      {/* AI Assistant */}
      <AIAssistant />

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

      {/* Profile Settings Sheet */}
      <Sheet open={showProfileSheet} onOpenChange={setShowProfileSheet}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <ProfileSettings />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileHome;
