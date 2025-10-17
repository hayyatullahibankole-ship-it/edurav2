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
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
import { StreakCard } from "@/components/dashboard/StreakCard";

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
      {/* Clean Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {userProfile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                  Hey, {userProfile?.first_name || user?.email?.split('@')[0]}! 
                  <span className="text-2xl">👋</span>
                </h2>
                <Badge variant={isPremium ? "default" : "secondary"} className="text-xs">
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
            {/* Quick Stats Grid */}
            <QuickStatsGrid stats={stats} loading={loading} />

            {/* Study Streak & Quick Actions Row */}
            <div className="grid md:grid-cols-3 gap-4">
              <StreakCard currentStreak={stats.testsTaken > 0 ? 5 : 0} bestStreak={7} />
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    Quick Start
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <ScheduleTestModal defaultExamType="jamb">
                      <Button className="w-full h-20 flex flex-col gap-2" size="lg">
                        <Play className="h-5 w-5" />
                        <span className="text-sm font-semibold">JAMB Practice</span>
                      </Button>
                    </ScheduleTestModal>
                    <ScheduleTestModal defaultExamType="waec">
                      <Button variant="outline" className="w-full h-20 flex flex-col gap-2" size="lg">
                        <BookOpen className="h-5 w-5" />
                        <span className="text-sm font-semibold">WAEC Practice</span>
                      </Button>
                    </ScheduleTestModal>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Explore Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Explore & Learn
                </CardTitle>
                <CardDescription>Unlock your full potential with these features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link to="/study-hub" className="group">
                    <div className="border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all hover:-translate-y-1">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <GraduationCap className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Study Hub</h3>
                          <p className="text-sm text-muted-foreground">Comprehensive learning materials</p>
                        </div>
                        <Badge>Popular</Badge>
                      </div>
                    </div>
                  </Link>

                  <Link to="/forum" className="group">
                    <div className="border border-border rounded-xl p-6 hover:shadow-lg hover:border-success/50 transition-all hover:-translate-y-1">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-4 bg-success/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <MessageSquare className="h-8 w-8 text-success" />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Ask Questions</h3>
                          <p className="text-sm text-muted-foreground">Get help from experts 24/7</p>
                        </div>
                        <Badge variant="outline">24/7 Support</Badge>
                      </div>
                    </div>
                  </Link>

                  <Link to="/challenge-arena" className="group">
                    <div className="border border-border rounded-xl p-6 hover:shadow-lg hover:border-warning/50 transition-all hover:-translate-y-1">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-4 bg-warning/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <Sword className="h-8 w-8 text-warning" />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Challenge Arena</h3>
                          <p className="text-sm text-muted-foreground">Compete & win prizes</p>
                        </div>
                        <Badge variant="destructive" className="animate-pulse">New!</Badge>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tests & Subject Progress Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Tests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest test results</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTests.length > 0 ? (
                    <div className="space-y-3">
                      {recentTests.map((test: any, index: number) => (
                        <Link key={index} to={`/results?attempt=${test.attemptId}`}>
                          <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{test.subject}</p>
                                <p className="text-xs text-muted-foreground">{test.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{test.score}%</p>
                              <p className="text-xs text-muted-foreground">{test.duration}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">No tests taken yet</p>
                      <ScheduleTestModal>
                        <Button size="sm">Start Your First Test</Button>
                      </ScheduleTestModal>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-success" />
                    Subject Progress
                  </CardTitle>
                  <CardDescription>Track your mastery</CardDescription>
                </CardHeader>
                <CardContent>
                  {subjectProgress.length > 0 ? (
                    <div className="space-y-4">
                      {subjectProgress.map((subject, index) => (
                        <SubjectProgressCard
                          key={index}
                          subject={subject.subject}
                          progress={subject.progress}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Complete tests to see progress</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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