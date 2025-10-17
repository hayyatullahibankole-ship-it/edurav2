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

  return (
    <div className="min-h-screen bg-background">
      <OnboardingTour 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
      {/* Modern Mobile-First Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-shift bg-[length:200%_200%]">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        
        {/* Floating Orbs */}
        <div className="absolute top-10 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {/* Top Bar - Profile & Actions */}
          <div className="flex items-center justify-between mb-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-4 ring-white/30 shadow-2xl">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold backdrop-blur-sm">
                  {userProfile?.first_name?.[0] || user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2 text-xs">
                  {subscriptionLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    isPremium ? (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 animate-pulse" />
                        Premium
                      </span>
                    ) : (
                      'Free'
                    )
                  )}
                </Badge>
                <h2 className="text-white font-bold text-xl md:text-2xl">
                  {userProfile?.first_name || user?.email?.split('@')[0]}
                </h2>
                <p className="text-white/80 text-sm">Keep crushing it! 🔥</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="hidden md:flex bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats Row - Compact for Mobile */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 text-center border border-white/20">
              <Target className="h-5 w-5 md:h-6 md:w-6 text-white mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-lg md:text-2xl">{loading ? "..." : stats.testsTaken}</div>
              <div className="text-white/70 text-xs">Tests</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 text-center border border-white/20">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-lg md:text-2xl">{loading ? "..." : `${stats.averageScore}%`}</div>
              <div className="text-white/70 text-xs">Score</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 text-center border border-white/20">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-white mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-lg md:text-2xl">{loading ? "..." : `${stats.studyHours}h`}</div>
              <div className="text-white/70 text-xs">Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 text-center border border-white/20">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white mx-auto mb-1 md:mb-2" />
              <div className="text-white font-bold text-lg md:text-2xl">{loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "N/A"}</div>
              <div className="text-white/70 text-xs">Rank</div>
            </div>
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

            {/* Quick Actions - Mobile Optimized Cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 animate-fade-in-up">
              <ScheduleTestModal defaultExamType="jamb">
                <Card className="bg-gradient-to-br from-primary to-primary-glow text-white border-0 cursor-pointer hover-lift active:scale-95 transition-all">
                  <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-2 h-32 md:h-40">
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <Play className="h-5 w-5 md:h-7 md:w-7" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-center">JAMB</span>
                  </CardContent>
                </Card>
              </ScheduleTestModal>
              
              <ScheduleTestModal defaultExamType="waec">
                <Card className="bg-gradient-to-br from-secondary to-accent border-0 cursor-pointer hover-lift active:scale-95 transition-all">
                  <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-2 h-32 md:h-40">
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <BookOpen className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-center text-white">WAEC</span>
                  </CardContent>
                </Card>
              </ScheduleTestModal>
              
              <ScheduleTestModal defaultExamType="neco">
                <Card className="bg-gradient-to-br from-info to-info-glow border-0 cursor-pointer hover-lift active:scale-95 transition-all">
                  <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-2 h-32 md:h-40">
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <FileText className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-center text-white">NECO</span>
                  </CardContent>
                </Card>
              </ScheduleTestModal>
              
              <ScheduleTestModal defaultExamType="post-utme">
                <Card className="bg-gradient-to-br from-warning to-destructive border-0 cursor-pointer hover-lift active:scale-95 transition-all">
                  <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-2 h-32 md:h-40">
                    <div className="p-2 md:p-3 bg-white/20 rounded-full">
                      <Award className="h-5 w-5 md:h-7 md:w-7 text-white" />
                    </div>
                    <span className="text-sm md:text-lg font-bold text-center text-white">POST-UTME</span>
                  </CardContent>
                </Card>
              </ScheduleTestModal>
            </div>

            {/* Feature Cards - Mad UI */}
            <div className="grid md:grid-cols-3 gap-4">
              <FeatureCard 
                icon={GraduationCap}
                title="Study Hub"
                description="Learn with expert content"
                href="/study-hub"
                gradient="from-primary to-secondary"
                badge="Popular"
              />
              <FeatureCard 
                icon={MessageSquare}
                title="Ask Tutor"
                description="Get instant help 24/7"
                href="/forum"
                gradient="from-success to-accent"
                badge="24/7"
              />
              <FeatureCard 
                icon={Sword}
                title="Challenge Arena"
                description="Compete & win prizes"
                href="/challenge-arena"
                gradient="from-warning to-destructive"
                badge="New"
              />
            </div>

            {/* Recent Tests & Progress */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Test Results */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Recent Tests
                  </CardTitle>
                  <CardDescription>Your latest performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center text-muted-foreground py-8">Loading...</div>
                    ) : recentTests.length > 0 ? (
                      recentTests.map((test: any, index: number) => (
                        <Link key={index} to={`/results?attempt=${test.attemptId}`} className="block">
                          <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted/50 hover-lift active:scale-98 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-lg">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{test.subject}</h4>
                                <p className="text-xs text-muted-foreground">{test.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">{test.score}%</div>
                              <p className="text-xs text-muted-foreground">{test.duration}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No tests yet. Start practicing! 🚀
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Progress */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-success" />
                    Subject Progress
                  </CardTitle>
                  <CardDescription>Track your improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center text-muted-foreground py-8">Loading...</div>
                    ) : subjectProgress.length > 0 ? (
                      subjectProgress.map((subject, index) => (
                        <SubjectProgressCard
                          key={index}
                          subject={subject.subject}
                          progress={subject.progress}
                        />
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        Complete tests to track progress! 📊
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="settings" className="mt-8">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;