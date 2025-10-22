import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock,
  ChevronRight,
  Flame,
  LogOut,
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
  Calendar,
  Video,
  Gift
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

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 pb-24 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Modern Dark Header with Tabs */}
      <header className="relative px-4 pt-6 pb-4 animate-fade-in">
        <div 
          className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1d3a] via-[#252847] to-[#1a1d3a] p-6 shadow-2xl"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}
        >
          {/* Animated gradient orbs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between mb-6">
            {/* Avatar with online status */}
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white/20 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary-glow to-secondary text-white font-bold text-lg">
                  {userProfile?.first_name?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-[#1a1d3a]" />
            </div>

            {/* App Branding */}
            <div className="flex-1 flex flex-col items-center">
              <h1 className="text-white font-black text-xl tracking-tight">EduRa</h1>
              <p className="text-white/60 text-xs font-semibold">Learning Platform</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-xl hover:bg-white/10 w-10 h-10 group text-white/80 hover:text-white"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="relative z-10 mb-4">
            <p className="text-white/60 text-xs font-semibold mb-0.5">Welcome back</p>
            <h2 className="text-white font-black text-2xl">
              {userProfile?.first_name || 'Student'} 👋
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="relative z-10 flex gap-2 p-1.5 rounded-[20px] bg-white/10 backdrop-blur-xl border border-white/20">
            <button 
              className="flex-1 py-3 px-4 rounded-[16px] bg-gradient-to-br from-primary to-primary-glow text-white font-bold text-sm shadow-lg transition-all"
              style={{ boxShadow: '0 4px 12px rgba(var(--primary), 0.4)' }}
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/study-hub')}
              className="flex-1 py-3 px-4 rounded-[16px] text-white/70 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
            >
              Study
            </button>
            <button 
              onClick={() => navigate('/practice')}
              className="flex-1 py-3 px-4 rounded-[16px] text-white/70 hover:text-white hover:bg-white/5 font-semibold text-sm transition-all"
            >
              Practice
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-4 space-y-6">
        {/* Hero Stats Card - Modern Glassmorphic */}
        <div 
          className="relative overflow-hidden rounded-[32px] p-6 backdrop-blur-2xl bg-gradient-to-br from-white/40 via-white/30 to-white/20 dark:from-white/10 dark:via-white/5 dark:to-transparent border border-white/20 shadow-2xl animate-fade-in"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}
        >
          {/* Gradient Orb */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-foreground/60 font-medium mb-1">Your Journey</p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                  {stats.testsTaken} Tests
                </h3>
              </div>
              <div 
                className="p-4 rounded-[24px] bg-gradient-to-br from-primary to-secondary shadow-xl relative overflow-hidden group"
                style={{ boxShadow: '0 10px 30px rgba(var(--primary), 0.3)' }}
              >
                <Trophy className="h-8 w-8 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="relative group">
                <div 
                  className="p-4 rounded-[20px] bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/40 shadow-lg hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.06)' }}
                >
                  <p className="text-3xl font-black text-primary mb-1">{stats.averageScore}%</p>
                  <p className="text-[10px] text-foreground/60 font-semibold uppercase tracking-wide">Score</p>
                </div>
              </div>
              
              <div className="relative group">
                <div 
                  className="p-4 rounded-[20px] bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/40 shadow-lg hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.06)' }}
                >
                  <p className="text-3xl font-black text-success mb-1">{stats.studyHours}h</p>
                  <p className="text-[10px] text-foreground/60 font-semibold uppercase tracking-wide">Study</p>
                </div>
              </div>
              
              <div className="relative group">
                <div 
                  className="p-4 rounded-[20px] bg-white/60 dark:bg-white/10 backdrop-blur-xl border border-white/40 shadow-lg hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.06)' }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="h-5 w-5 text-warning" />
                    <p className="text-3xl font-black text-warning">{streak.current}</p>
                  </div>
                  <p className="text-[10px] text-foreground/60 font-semibold uppercase tracking-wide">Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Goal Progress - Modern Circular */}
        <div 
          className="relative overflow-hidden rounded-[28px] p-5 bg-gradient-to-br from-success/20 via-success/10 to-transparent border border-success/20 shadow-lg animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(hsl(var(--success)) ${(dailyGoal.answered / dailyGoal.target) * 360}deg, rgba(255,255,255,0.3) 0deg)`,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <Target className="h-6 w-6 text-success" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-success mb-0.5">{dailyGoal.answered}/{dailyGoal.target}</p>
                <p className="text-xs text-foreground/60 font-semibold">Questions Today</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Subjects - Modern Grid */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="mb-5">
            <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Explore Subjects
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Choose a subject to begin your journey</p>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: 'Math', icon: Calculator, color: 'from-blue-500 to-blue-600', bg: 'from-blue-500/20 to-blue-500/10', subject: 'Mathematics' },
              { name: 'Physics', icon: Sparkles, color: 'from-purple-500 to-purple-600', bg: 'from-purple-500/20 to-purple-500/10', subject: 'Physics' },
              { name: 'Chem', icon: Beaker, color: 'from-green-500 to-green-600', bg: 'from-green-500/20 to-green-500/10', subject: 'Chemistry' },
              { name: 'Biology', icon: Microscope, color: 'from-teal-500 to-teal-600', bg: 'from-teal-500/20 to-teal-500/10', subject: 'Biology' },
              { name: 'English', icon: BookOpen, color: 'from-orange-500 to-orange-600', bg: 'from-orange-500/20 to-orange-500/10', subject: 'English' },
              { name: 'Geo', icon: Globe, color: 'from-cyan-500 to-cyan-600', bg: 'from-cyan-500/20 to-cyan-500/10', subject: 'Geography' },
              { name: 'Econ', icon: TrendingUp, color: 'from-indigo-500 to-indigo-600', bg: 'from-indigo-500/20 to-indigo-500/10', subject: 'Economics' },
              { name: 'More', icon: GraduationCap, color: 'from-pink-500 to-pink-600', bg: 'from-pink-500/20 to-pink-500/10', subject: null },
            ].map((subject, index) => (
              <div
                key={subject.name}
                onClick={() => subject.subject ? handleNavigation(`/study-hub?subject=${subject.subject}`) : handleNavigation('/study-hub')}
                className="group relative cursor-pointer flex flex-col items-center"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className={`relative overflow-hidden rounded-[24px] p-3 w-full aspect-square bg-gradient-to-br ${subject.bg} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl active:scale-95 transition-all duration-300 flex items-center justify-center mb-2`}>
                  <div 
                    className={`w-12 h-12 rounded-[18px] bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative overflow-hidden`}
                    style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.3)' }}
                  >
                    <subject.icon className="h-6 w-6 text-white relative z-10" strokeWidth={2.5} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  </div>
                </div>
                <p className="font-bold text-[11px] text-center text-foreground/80">{subject.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Modern Cards */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="mb-5">
            <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Quick Actions
            </h3>
            <p className="text-sm text-muted-foreground font-medium">Access key features instantly</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Study Planner', icon: Calendar, color: 'from-blue-500 to-cyan-500', path: '/study-planner' },
              { label: 'Arena', icon: Trophy, color: 'from-purple-500 to-pink-500', path: '/challenge-arena' },
              { label: 'Analytics', icon: TrendingUp, color: 'from-green-500 to-emerald-500', path: '/performance-report' },
              { label: 'Resources', icon: Library, color: 'from-indigo-500 to-violet-500', path: '/resources' },
              { label: 'Consultation', icon: Video, color: 'from-rose-500 to-pink-500', path: '/consultation' },
              { label: 'Referral', icon: Gift, color: 'from-orange-500 to-amber-500', path: '/referral' },
            ].map((action, index) => (
              <button
                key={action.label}
                onClick={() => handleNavigation(action.path)}
                className="group relative"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div 
                  className={`relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br ${action.color} shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-300 flex flex-col items-center justify-center`}
                  style={{ boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div 
                      className="p-4 rounded-[20px] bg-white/25 backdrop-blur-sm shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex items-center justify-center"
                      style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.3)' }}
                    >
                      <action.icon className="h-7 w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-white text-center">{action.label}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Tests - Compact Modern Cards */}
        {recentResults.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Recent Performance
                </h3>
                <p className="text-sm text-muted-foreground font-medium">Track your progress</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/performance-report')}
                className="text-xs font-semibold text-primary hover:bg-primary/10"
              >
                View All
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentResults.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => navigate(`/results?attempt=${result.attempt_id}`)}
                  className="w-full group"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <div 
                    className="relative overflow-hidden rounded-[24px] p-5 bg-card/80 backdrop-blur-sm border border-border/40 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
                    style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="p-4 rounded-[20px] bg-gradient-to-br from-primary/15 to-primary/5 shadow-md group-hover:scale-110 transition-transform duration-300"
                        style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.2)' }}
                      >
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-bold text-sm truncate mb-1">{result.examTitle}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {new Date(result.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div 
                        className={`px-4 py-2 rounded-[16px] font-black text-base shadow-lg ${
                          result.percentage >= 75 ? 'bg-gradient-to-r from-success to-success-glow text-white' :
                          result.percentage >= 50 ? 'bg-gradient-to-r from-warning to-warning text-white' :
                          'bg-gradient-to-r from-destructive to-destructive text-white'
                        }`}
                        style={{ boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)' }}
                      >
                        {result.percentage}%
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Motivational Quote - Modern Bubble */}
        <div 
          className="relative overflow-hidden rounded-[28px] p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-lg animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-start gap-4">
            <div 
              className="p-3 rounded-[20px] bg-primary/20 backdrop-blur-sm shadow-md flex-shrink-0"
              style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.2)' }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-relaxed mb-2 text-foreground/90">
                {motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Keep pushing forward! 🚀</p>
            </div>
          </div>
        </div>

        {/* Premium CTA - Eye-catching */}
        {!isPremium && (
          <div 
            className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-2xl animate-fade-in"
            style={{ 
              animationDelay: '0.6s',
              boxShadow: '0 20px 60px rgba(var(--primary), 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="p-4 rounded-[20px] bg-white/25 backdrop-blur-sm shadow-xl"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(255, 255, 255, 0.4)' }}
                >
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-xl text-white mb-2">Go Premium</p>
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    Unlock unlimited tests, AI tutor, and exclusive study materials
                  </p>
                </div>
              </div>
              <Button 
                size="lg"
                onClick={() => navigate('/payment')}
                className="w-full bg-white hover:bg-white/90 text-primary font-bold shadow-xl rounded-[20px] h-14"
              >
                Upgrade Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-6" />
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
