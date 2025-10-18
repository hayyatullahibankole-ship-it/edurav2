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
  FileText,
  Brain,
  Bell,
  BellOff,
  TrendingDown,
  Flame,
  MessageSquare,
  Calendar
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

const MobileHome = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isPremium } = useSubscription();
  usePushNotifications(); // Initialize push notifications
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
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      fetchStats();
      fetchStreak();
      fetchLeaderboard();
      fetchDailyGoal();
      fetchPerformanceData();
      setRandomQuote();
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

  const fetchStreak = async () => {
    try {
      // Get user's test history to calculate streak
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

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if user tested today or yesterday for current streak
      const lastTest = new Date(attempts[0].submitted_at);
      lastTest.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        currentStreak = 1;
        
        // Calculate consecutive days
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
      // Get top performers based on average percentage
      const { data: topUsers } = await supabase
        .rpc('get_student_exam_progress');

      if (!topUsers) return;

      // Calculate average scores for each user
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

      // Calculate averages and sort
      const leaderboardData = Array.from(userScores.values())
        .map(u => ({ userId: u.userId, avgScore: Math.round(u.total / u.count), testCount: u.count }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 5);

      // Get user details
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
      
      // Update user's rank in stats
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
      
      // Count questions answered today
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

  const fetchPerformanceData = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: attempts } = await supabase
        .from('attempts')
        .select('id, submitted_at')
        .eq('user_id', userProfile?.id)
        .eq('status', 'SUBMITTED')
        .gte('submitted_at', sevenDaysAgo.toISOString())
        .order('submitted_at', { ascending: true });

      if (attempts) {
        const dailyScores = await Promise.all(
          attempts.map(async (attempt) => {
            const { data: result } = await supabase
              .from('results')
              .select('percentage')
              .eq('attempt_id', attempt.id)
              .maybeSingle();

            return {
              date: new Date(attempt.submitted_at).toLocaleDateString('en-US', { weekday: 'short' }),
              score: Math.round(result?.percentage || 0)
            };
          })
        );

        setPerformanceData(dailyScores);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const setRandomQuote = () => {
    const quotes = [
      "Success is the sum of small efforts repeated daily.",
      "The expert in anything was once a beginner.",
      "Study hard, stay focused, and achieve greatness!",
      "Every question you answer brings you closer to your goal.",
      "Consistency is the key to mastering any subject.",
      "Believe in yourself and all that you are capable of.",
      "Your future is created by what you do today, not tomorrow.",
      "Practice makes progress. Keep going!",
      "Knowledge is power. Keep learning every day.",
      "The harder you work, the luckier you get."
    ];
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
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
      {/* Clean Header */}
      <div className="bg-card border-b">
        <div className="p-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <img src={eduraLogo} alt="Edura" className="h-8 w-auto" />
            <div className="flex items-center gap-2">
              {isPremium && (
                <Badge variant="default" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
              <NotificationBell />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="h-9 w-9 p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Hello, {userProfile?.first_name || 'Student'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {stats.averageScore > 0 ? `Your average score: ${stats.averageScore}%` : 'Ready to start learning?'}
            </p>
          </div>

          {/* Clean Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border shadow-sm">
              <CardContent className="p-4 text-center">
                <Target className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{stats.testsTaken}</div>
                <div className="text-xs text-muted-foreground mt-1">Tests</div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 text-success mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{stats.averageScore}%</div>
                <div className="text-xs text-muted-foreground mt-1">Average</div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-4 text-center">
                <Flame className="h-5 w-5 text-warning mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">{streak.current}</div>
                <div className="text-xs text-muted-foreground mt-1">Streak</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Clean Design */}
      <div className="px-4 py-6 space-y-6">
        {/* Motivational Quote - Enhanced */}
        {motivationalQuote && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />
            <CardContent className="p-6 relative z-10">
              <Sparkles className="h-5 w-5 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground/90 text-center leading-relaxed">
                "{motivationalQuote}"
              </p>
            </CardContent>
          </Card>
        )}

      {/* Main Content - Clean Design */}
      <div className="px-4 py-6 space-y-6">
        {/* Motivational Quote - Minimal */}
        {motivationalQuote && (
          <Card className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {motivationalQuote}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Preview - Clean */}
        {leaderboard.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Performers</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/challenge-arena')}
                className="text-xs text-primary"
              >
                View All
              </Button>
            </div>
            <Card className="border shadow-sm">
              <CardContent className="p-3 space-y-2">
                {leaderboard.slice(0, 3).map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      entry.isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1 ? 'bg-warning/20 text-warning' :
                      entry.rank === 2 ? 'bg-muted text-foreground' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>
                      {entry.rank === 1 ? '🏆' : entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                        {entry.isCurrentUser ? 'You' : entry.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-foreground">{entry.score}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions - Clean Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          
          <Card 
            className="border-2 border-primary shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            onClick={() => setShowTestPanel(true)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary rounded-xl">
                <Play className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Take a Test</h3>
                <p className="text-xs text-muted-foreground">Choose your exam type</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card 
            className="border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            onClick={() => handleNavigation('/study-hub')}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Study Hub</h3>
                <p className="text-xs text-muted-foreground">Lessons & resources</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Feature Cards - Compact Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Card 
              className="border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/challenge-arena')}
            >
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-warning mx-auto mb-2" />
                <h3 className="font-medium text-sm">Challenges</h3>
                <p className="text-xs text-muted-foreground mt-1">Compete</p>
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/resources')}
            >
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 text-info mx-auto mb-2" />
                <h3 className="font-medium text-sm">Resources</h3>
                <p className="text-xs text-muted-foreground mt-1">Materials</p>
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/forum')}
            >
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-6 w-6 text-success mx-auto mb-2" />
                <h3 className="font-medium text-sm">Forum</h3>
                <p className="text-xs text-muted-foreground mt-1">Discuss</p>
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/consultation')}
            >
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-secondary mx-auto mb-2" />
                <h3 className="font-medium text-sm">Booking</h3>
                <p className="text-xs text-muted-foreground mt-1">Sessions</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Results - Clean Section */}
        {recentResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Tests</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/dashboard?tab=results')}
                className="text-xs text-primary"
              >
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {recentResults.map((result, index) => (
                <Card 
                  key={index} 
                  className="border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  onClick={() => handleNavigation(`/results?attempt=${result.attempt_id}`)}
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{result.examTitle}</h3>
                        <p className="text-xs text-muted-foreground">{result.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          result.percentage >= 70 ? 'text-success' : 
                          result.percentage >= 50 ? 'text-warning' : 'text-destructive'
                        }`}>{result.percentage}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subscription CTA - Clean */}
        {!isPremium && (
          <Card className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unlock unlimited tests, detailed analytics & expert support
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
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
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <GraduationCap className="h-6 w-6 text-primary" />
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
                    <div className="p-3 bg-success/10 rounded-xl">
                      <FileText className="h-6 w-6 text-success" />
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
                    <div className="p-3 bg-info/10 rounded-xl">
                      <BookOpen className="h-6 w-6 text-info" />
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
                    <div className="p-3 bg-accent/10 rounded-xl">
                      <Target className="h-6 w-6 text-accent" />
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
