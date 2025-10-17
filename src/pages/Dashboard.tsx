import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp,
  Play,
  FileText,
  Video,
  Calendar,
  Trophy,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Sword,
  GraduationCap,
  Zap,
  Award,
  Rocket,
  Sparkles
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileSettings from "@/components/ProfileSettings";
import AccountSettings from "@/components/AccountSettings";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import SubjectProgressCard from "@/components/SubjectProgressCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { QuickActionButton } from "@/components/dashboard/QuickActionButton";
import { NotificationBell } from "@/components/NotificationBell";
import OnboardingTour from "@/components/OnboardingTour";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingAnimation from "@/components/LoadingAnimation";
import { MobileStatCard } from "@/components/dashboard/MobileStatCard";
import { ActionCard } from "@/components/dashboard/ActionCard";

const Dashboard = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const { subscription, loading: subscriptionLoading, isPremium } = useSubscription();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for dashboard statistics
  const [stats, setStats] = useState({
    testsTaken: 0,
    averageScore: 0,
    studyHours: 0,
    rank: 0,
    totalStudents: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      fetchDashboardData();
      checkOnboardingStatus();
    } else if (userProfile !== undefined) {
      // If userProfile is loaded but has no id, stop loading
      setLoading(false);
    }
  }, [userProfile]);

  const checkOnboardingStatus = async () => {
    if (!userProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', userProfile.id)
        .single();

      if (error) throw error;

      // Show onboarding for new users who haven't completed it
      if (!data?.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's attempts using secure RPC function
      const { data: allAttempts, error: attemptsError } = await supabase
        .rpc('get_student_exam_progress');
      
      const attempts = allAttempts?.filter(a => 
        a.user_id === userProfile.id && a.status === 'SUBMITTED'
      ).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      
      // Fetch results for each attempt with auto-recompute if missing/zero
      const attemptsWithResults = await Promise.all(
        (attempts || []).map(async (attempt) => {
          // Try fetch existing result
          let { data: result } = await supabase
            .from("results")
            .select("*")
            .eq("attempt_id", attempt.id)
            .maybeSingle();

          // If missing or suspiciously zero, recompute server-side once
          if (!result || result.percentage === 0) {
            try {
              await supabase.rpc('recompute_results_for_attempt', { attempt_uuid: attempt.id });
              const { data: recomputed } = await supabase
                .from("results")
                .select("*")
                .eq("attempt_id", attempt.id)
                .maybeSingle();
              if (recomputed) result = recomputed;
            } catch (e) {
              console.warn('Recompute failed for attempt', attempt.id, e);
            }
          }

          return { ...attempt, results: result ? [result] : [] };
        })
      );

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        return;
      }

      // Calculate statistics
      const testsTaken = attemptsWithResults?.length || 0;
      const resultsWithScores = attemptsWithResults?.filter(a => a.results && Array.isArray(a.results) && a.results.length > 0) || [];
      const averageScore = resultsWithScores.length > 0 
        ? Math.round(resultsWithScores.reduce((sum, a) => {
            const result = Array.isArray(a.results) ? a.results[0] : a.results;
            return sum + (result?.percentage || 0);
          }, 0) / resultsWithScores.length)
        : 0;

      // Calculate study hours (estimated from time taken in exams)
      const studyHours = Math.round(
        resultsWithScores.reduce((sum, a) => {
          const result = Array.isArray(a.results) ? a.results[0] : a.results;
          return sum + (result?.time_taken_minutes || 0);
        }, 0) / 60
      );

      // Live rank via edge function based on your latest attempt
      let rank = 0;
      let totalStudents = 0;
      const latestAttemptId = resultsWithScores[0]?.id;
      if (latestAttemptId) {
        try {
          const { data: rankData, error: rankError } = await supabase.functions.invoke('get-rank', {
            body: { attemptId: latestAttemptId },
          });
          if (!rankError && rankData) {
            rank = rankData.rank || 0;
            totalStudents = rankData.total || 0;
          }
        } catch (e) {
          console.error('Failed to fetch live rank', e);
        }
      }

      setStats({
        testsTaken,
        averageScore,
        studyHours,
        rank,
        totalStudents
      });

      // Recent test results
      const recentTestsData = resultsWithScores.slice(0, 3).map((attempt: any) => {
        const result = Array.isArray(attempt.results) ? attempt.results[0] : attempt.results;
        const timeTaken = result?.time_taken_minutes || 0;
        
        // Get subject info from proctoring_data
        const proctoringData = attempt.proctoring_data as any || {};
        const testTitle = proctoringData.title || 'Practice Test';
        
        return {
          attemptId: attempt.id,
          subject: testTitle,
          score: Math.round(result?.percentage || 0),
          date: new Date(attempt.submitted_at).toLocaleDateString(),
          duration: `${Math.floor(timeTaken / 60)}h ${timeTaken % 60}m`
        };
      });
      setRecentTests(recentTestsData);

      // Subject progress (calculate from subject breakdown in results)
      const subjectScores: { [key: string]: number[] } = {};
      resultsWithScores.forEach(attempt => {
        const result = Array.isArray(attempt.results) ? attempt.results[0] : attempt.results;
        const breakdown = result?.subject_breakdown || {};
        
        console.log('Processing breakdown:', breakdown); // Debug log
        
        if (typeof breakdown === 'object' && breakdown !== null) {
          Object.entries(breakdown).forEach(([subject, data]: [string, any]) => {
            // Clean up subject name and ensure we capture it properly
            const cleanSubject = subject.trim();
            if (!subjectScores[cleanSubject]) {
              subjectScores[cleanSubject] = [];
            }
            
            // Handle both percentage and score data
            let percentage = 0;
            if (typeof data === 'object' && data !== null) {
              percentage = data.percentage || data.score || 0;
            } else if (typeof data === 'number') {
              percentage = data;
            }
            
            subjectScores[cleanSubject].push(percentage);
          });
        }
      });

      console.log('Subject scores calculated:', subjectScores); // Debug log

      const subjectProgressData = Object.entries(subjectScores).map(([subject, scores]) => ({
        subject,
        progress: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
        total: 100
      }));
      setSubjectProgress(subjectProgressData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/auth", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingAnimation message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <OnboardingTour 
          isOpen={showOnboarding} 
          onComplete={() => setShowOnboarding(false)} 
        />
      {/* Sleek Mobile Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-4 ring-white/30">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {userProfile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-white font-bold text-lg">
                  Hey, {userProfile?.first_name || user?.email?.split('@')[0]}! 👋
                </h2>
                <Badge className="bg-white/20 text-white border-white/30 text-xs mt-1">
                  {isPremium ? (
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Premium
                    </span>
                  ) : (
                    'Free Plan'
                  )}
                </Badge>
              </div>
            </div>
            <NotificationBell />
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Target, value: stats.testsTaken, label: "Tests" },
              { icon: TrendingUp, value: `${stats.averageScore}%`, label: "Score" },
              { icon: Clock, value: `${stats.studyHours}h`, label: "Hours" },
              { icon: Trophy, value: stats.rank > 0 ? `#${stats.rank}` : "-", label: "Rank" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-2 text-center">
                  <Icon className="h-4 w-4 text-white mx-auto mb-1" />
                  <div className="text-white font-bold text-sm">{stat.value}</div>
                  <div className="text-white/70 text-[10px]">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 md:hidden">
            <TabsTrigger value="dashboard">
              <Target className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Action Cards - Modern Design */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                Start Practicing
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <ScheduleTestModal defaultExamType="jamb">
                  <div className="relative overflow-hidden rounded-2xl h-36 bg-gradient-to-br from-primary to-primary-glow cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-white h-full">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <Play className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-base">JAMB</h3>
                        <p className="text-xs text-white/80">Full Mock</p>
                      </div>
                    </div>
                  </div>
                </ScheduleTestModal>
                
                <ScheduleTestModal defaultExamType="waec">
                  <div className="relative overflow-hidden rounded-2xl h-36 bg-gradient-to-br from-secondary to-accent cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-white h-full">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <BookOpen className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-base">WAEC</h3>
                        <p className="text-xs text-white/80">Practice</p>
                      </div>
                    </div>
                  </div>
                </ScheduleTestModal>
                
                <ScheduleTestModal defaultExamType="neco">
                  <div className="relative overflow-hidden rounded-2xl h-36 bg-gradient-to-br from-info to-info-glow cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-white h-full">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <FileText className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-base">NECO</h3>
                        <p className="text-xs text-white/80">Test Mode</p>
                      </div>
                    </div>
                  </div>
                </ScheduleTestModal>
                
                <ScheduleTestModal defaultExamType="post-utme">
                  <div className="relative overflow-hidden rounded-2xl h-36 bg-gradient-to-br from-warning to-destructive cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-white h-full">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <Award className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-base">POST-UTME</h3>
                        <p className="text-xs text-white/80">Prepare</p>
                      </div>
                    </div>
                  </div>
                </ScheduleTestModal>
              </div>
            </div>

            {/* Performance Stats - Enhanced */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Your Performance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <MobileStatCard
                  icon={Target}
                  label="Tests Completed"
                  value={stats.testsTaken}
                  gradient="from-primary to-primary-glow"
                  trend={{ value: "+12%", isPositive: true }}
                />
                <MobileStatCard
                  icon={TrendingUp}
                  label="Average Score"
                  value={`${stats.averageScore}%`}
                  gradient="from-success to-success-glow"
                  trend={stats.averageScore >= 70 ? { value: "Excellent", isPositive: true } : undefined}
                />
                <MobileStatCard
                  icon={Clock}
                  label="Study Time"
                  value={`${stats.studyHours}h`}
                  gradient="from-info to-info-glow"
                />
                <MobileStatCard
                  icon={Trophy}
                  label="Your Rank"
                  value={stats.rank > 0 ? `#${stats.rank}` : "N/A"}
                  gradient="from-warning to-destructive"
                  trend={stats.rank > 0 && stats.rank <= 10 ? { value: "Top 10!", isPositive: true } : undefined}
                />
              </div>
            </div>

            {/* Feature Cards */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Explore Features
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/study-hub">
                  <div className="relative group overflow-hidden rounded-2xl h-28 bg-gradient-to-r from-primary to-secondary cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
                    <div className="relative z-10 flex items-center gap-4 p-6 h-full">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <GraduationCap className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white">
                        <h4 className="font-bold text-lg mb-1">Study Hub</h4>
                        <p className="text-sm text-white/80">Video lessons & study materials</p>
                      </div>
                      <Badge className="ml-auto bg-white/20 text-white border-white/30">Popular</Badge>
                    </div>
                  </div>
                </Link>

                <Link to="/forum">
                  <div className="relative group overflow-hidden rounded-2xl h-28 bg-gradient-to-r from-success to-accent cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
                    <div className="relative z-10 flex items-center gap-4 p-6 h-full">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white">
                        <h4 className="font-bold text-lg mb-1">Ask Tutor</h4>
                        <p className="text-sm text-white/80">Get help from experts 24/7</p>
                      </div>
                      <Badge className="ml-auto bg-white/20 text-white border-white/30">24/7</Badge>
                    </div>
                  </div>
                </Link>

                <Link to="/challenge-arena">
                  <div className="relative group overflow-hidden rounded-2xl h-28 bg-gradient-to-r from-warning to-destructive cursor-pointer transform transition-all hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
                    <div className="relative z-10 flex items-center gap-4 p-6 h-full">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Sword className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white">
                        <h4 className="font-bold text-lg mb-1">Challenge Arena</h4>
                        <p className="text-sm text-white/80">Compete & win prizes</p>
                      </div>
                      <Badge className="ml-auto bg-white/20 text-white border-white/30 animate-pulse">New</Badge>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                Recent Tests
              </h3>
              {recentTests.length > 0 ? (
                <div className="space-y-2">
                  {recentTests.map((test: any, index: number) => (
                    <Link key={index} to={`/results?attempt=${test.attemptId}`}>
                      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-98">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{test.subject}</h4>
                              <p className="text-xs text-muted-foreground">{test.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">{test.score}%</div>
                            <p className="text-xs text-muted-foreground">{test.duration}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No tests yet. Let's get started!</p>
                    <ScheduleTestModal>
                      <Button size="sm">Take Your First Test</Button>
                    </ScheduleTestModal>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Subject Progress */}
            {subjectProgress.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  Subject Progress
                </h3>
                <div className="space-y-3">
                  {subjectProgress.map((subject, index) => (
                    <SubjectProgressCard
                      key={index}
                      subject={subject.subject}
                      progress={subject.progress}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                Recent Tests
              </h3>
              {recentTests.length > 0 ? (
                <div className="space-y-2">
                  {recentTests.map((test: any, index: number) => (
                    <Link key={index} to={`/results?attempt=${test.attemptId}`}>
                      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-98">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{test.subject}</h4>
                              <p className="text-xs text-muted-foreground">{test.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">{test.score}%</div>
                            <p className="text-xs text-muted-foreground">{test.duration}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Trophy className="h-12 w-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">No tests yet. Let's get started!</p>
                    <ScheduleTestModal>
                      <Button size="sm">Take Your First Test</Button>
                    </ScheduleTestModal>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="settings">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNav />
    </div>
    </>
  );
};

export default Dashboard;