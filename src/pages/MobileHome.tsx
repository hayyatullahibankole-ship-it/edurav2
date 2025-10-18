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
  Flame
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 pb-24">
      {/* Header with Premium Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/95 via-secondary/90 to-accent/85 p-6 pb-10 rounded-b-[2rem]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
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
              <NotificationBell />
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

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              Hey {userProfile?.first_name || 'Student'}! 👋
            </h1>
            <p className="text-white/90 text-base font-medium">
              {stats.averageScore > 0 ? `You're averaging ${stats.averageScore}% - Keep crushing it!` : 'Ready to ace your exams?'}
            </p>
          </div>

          {/* Quick Stats - Enhanced */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-xl hover:bg-white/20 transition-all">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 p-2 rounded-xl w-fit mx-auto mb-2">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.testsTaken}</div>
                <div className="text-xs text-white/90 font-medium">Tests Taken</div>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-xl hover:bg-white/20 transition-all">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 p-2 rounded-xl w-fit mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stats.averageScore}%</div>
                <div className="text-xs text-white/80">Average</div>
              </CardContent>
            </Card>
            <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-xl hover:bg-white/20 transition-all">
              <CardContent className="p-4 text-center">
                <div className="bg-white/20 p-2 rounded-xl w-fit mx-auto mb-2">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{streak.current}</div>
                <div className="text-xs text-white/90 font-medium">Day Streak</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Better Organized */}
      <div className="px-5 py-8 space-y-8">
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

        {/* Leaderboard Preview */}
        {leaderboard.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold">Top Performers</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleNavigation('/challenge-arena')}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-2">
                {leaderboard.slice(0, 3).map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      entry.isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1 ? 'bg-warning text-white' :
                      entry.rank === 2 ? 'bg-muted-foreground/20 text-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {entry.rank === 1 ? '👑' : entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                        {entry.isCurrentUser ? 'You' : entry.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{entry.score}%</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions - More Prominent */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold">Start Learning</h2>
            <Badge variant="secondary" className="text-xs">Quick Access</Badge>
          </div>
          <Card 
            className="border-2 border-primary/20 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all active:scale-[0.97] cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
            onClick={() => setShowTestPanel(true)}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-primary via-primary-glow to-secondary rounded-2xl shadow-lg">
                <Play className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-0.5">Take a Test</h3>
                <p className="text-sm text-muted-foreground">JAMB, WAEC, NECO & more</p>
              </div>
              <ChevronRight className="h-6 w-6 text-primary" />
            </CardContent>
          </Card>

          <Card 
            className="border border-accent/30 shadow-md hover:shadow-lg hover:border-accent/50 transition-all active:scale-[0.97] cursor-pointer"
            onClick={() => handleNavigation('/study-hub')}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-accent to-info rounded-2xl shadow-md">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base">Study Companion</h3>
                <p className="text-sm text-muted-foreground">Lessons & topic guides</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Feature Cards */}
          <div className="space-y-3 mt-6">
            <h3 className="text-lg font-semibold px-1">More Features</h3>
          
            {/* Challenge Arena */}
            <Card 
              className="border border-warning/30 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/challenge-arena')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-warning to-destructive rounded-xl">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Challenge Arena</h3>
                  <p className="text-xs text-muted-foreground">Compete & win prizes</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Resources */}
            <Card 
              className="border-0 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/resources')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-info to-secondary rounded-xl">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Study Resources</h3>
                  <p className="text-xs text-muted-foreground">Past questions & materials</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>

            {/* Consultation */}
            <Card 
              className="border-0 shadow-md hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer"
              onClick={() => handleNavigation('/consultation')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-accent to-primary rounded-xl">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Expert Tutors</h3>
                  <p className="text-xs text-muted-foreground">Book consultation sessions</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Results - Better Section */}
        {recentResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-bold">Your Results</h2>
                <p className="text-xs text-muted-foreground">Recent test performance</p>
              </div>
              <Button 
                variant="outline" 
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
