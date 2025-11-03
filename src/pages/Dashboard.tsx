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
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { ModernQuickAction } from "@/components/dashboard/ModernQuickAction";
import { MobileStatCard } from "@/components/dashboard/MobileStatCard";
import { MobileTestCard } from "@/components/dashboard/MobileTestCard";
import { MobileSubjectCard } from "@/components/dashboard/MobileSubjectCard";
import NotificationBell from "@/components/NotificationBell";
import OnboardingTour from "@/components/OnboardingTour";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import eduraLogo from "@/assets/edura-logo.png";
import { AIAssistant } from "@/components/AIAssistant";

const Dashboard = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const { subscription, loading: subscriptionLoading, isPremium } = useSubscription();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isInstalledApp } = useInstalledApp();

  // Update active tab when URL parameter changes
  useEffect(() => {
    const urlTab = searchParams.get("tab") || "dashboard";
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]);
  
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
    return <LoadingAnimation />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <OnboardingTour 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />
      
      {/* Clean Modern Header */}
      <div className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Welcome */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl shadow-lg">
                <img src={eduraLogo} alt="Edura" className="h-8 w-auto" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-foreground">
                  Welcome, {userProfile?.first_name || user?.email?.split('@')[0]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {stats.testsTaken > 0 ? `${stats.testsTaken} tests • ${stats.averageScore}% avg` : 'Start your learning journey'}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {!subscriptionLoading && (
                <Badge variant={isPremium ? "default" : "secondary"} className="hidden md:flex">
                  {isPremium ? (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Premium
                    </>
                  ) : (
                    'Free Plan'
                  )}
                </Badge>
              )}
              <NotificationBell />
              <Button 
                variant="outline" 
                size={isMobile ? "sm" : "default"}
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {!isMobile && "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isInstalledApp ? 'pb-24' : ''}`}>
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('Tab changed to:', value);
          setActiveTab(value);
        }}>
          <TabsList className={`w-full md:w-auto mb-6 ${isInstalledApp ? 'hidden' : ''}`}>
            <TabsTrigger value="dashboard" className="gap-2">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                icon={Target}
                label="Tests Taken"
                value={loading ? "..." : stats.testsTaken}
                subtext="Total attempts"
                gradient="from-primary to-secondary"
              />
              <StatCard 
                icon={TrendingUp}
                label="Average Score"
                value={loading ? "..." : `${stats.averageScore}%`}
                subtext={stats.averageScore >= 70 ? "Great job!" : "Keep practicing"}
                gradient="from-info to-primary"
              />
              <StatCard 
                icon={Clock}
                label="Study Time"
                value={loading ? "..." : `${stats.studyHours}h`}
                subtext="Time invested"
                gradient="from-secondary to-accent"
              />
              <StatCard 
                icon={Trophy}
                label="Your Rank"
                value={loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "N/A"}
                subtext={stats.totalStudents > 0 ? `of ${stats.totalStudents}` : "Start testing"}
                gradient="from-warning to-primary"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                {!isInstalledApp && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Rocket className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Quick Actions</CardTitle>
                          <CardDescription>Start practicing for your exams</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-3">
                        <ScheduleTestModal defaultExamType="jamb">
                          <Button className="w-full h-20 text-base font-semibold">
                            <Play className="h-5 w-5 mr-2" />
                            JAMB Practice
                          </Button>
                        </ScheduleTestModal>
                        <ScheduleTestModal defaultExamType="waec">
                          <Button variant="outline" className="w-full h-20 text-base font-semibold border-2">
                            <Play className="h-5 w-5 mr-2" />
                            WAEC Practice
                          </Button>
                        </ScheduleTestModal>
                        <ScheduleTestModal defaultExamType="neco">
                          <Button variant="outline" className="w-full h-20 text-base font-semibold border-2">
                            <Play className="h-5 w-5 mr-2" />
                            NECO Practice
                          </Button>
                        </ScheduleTestModal>
                        <ScheduleTestModal defaultExamType="post-utme">
                          <Button variant="outline" className="w-full h-20 text-base font-semibold border-2">
                            <Play className="h-5 w-5 mr-2" />
                            POST-UTME
                          </Button>
                        </ScheduleTestModal>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Subscription Management - Mobile Only */}
                {!isMobile && <div className="h-4" />}
                
                {isMobile && (
                  <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 animate-fade-in">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2.5 bg-primary/20 rounded-xl">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">Subscription</h3>
                          <p className="text-xs text-muted-foreground">{isPremium ? 'Premium Active' : 'Free Plan'}</p>
                        </div>
                      </div>
                      
                      <Link to="/payment">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg active:scale-[0.98] transition-all">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-semibold">{isPremium ? 'Manage Plan' : 'Go Premium'}</span>
                          </div>
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Premium Features - Compact Row */}
                <div>
                  <div className="mb-3">
                    <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold flex items-center gap-2`}>
                      <Rocket className="h-5 w-5 text-primary" />
                      Premium Features
                    </h2>
                  </div>
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                    {/* Study Hub Card */}
                    <Link to="/study-hub" className="group">
                      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                        <CardContent className="relative p-5">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-md group-hover:scale-105 transition-transform">
                              <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                Study Hub
                                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-2 py-0.5">Popular</Badge>
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">Lessons & tutorials</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Ask Tutor Card */}
                    <Link to="/forum" className="group">
                      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-success/5 to-accent/5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-success/10 rounded-full blur-2xl" />
                        <CardContent className="relative p-5">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-success to-accent rounded-xl shadow-md group-hover:scale-105 transition-transform">
                              <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                Ask Tutor
                                <Badge className="bg-success/20 text-success border-success/30 text-xs px-2 py-0.5">24/7</Badge>
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">Get instant help</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-success group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Challenge Arena Card */}
                    <Link to="/challenge-arena" className="group">
                      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-warning/5 to-destructive/5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full blur-2xl" />
                        <CardContent className="relative p-5">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-warning to-destructive rounded-xl shadow-md group-hover:scale-105 transition-transform">
                              <Sword className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                Challenge Arena
                                <Badge className="bg-warning/20 text-warning border-warning/30 text-xs px-2 py-0.5">New</Badge>
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">Compete & win prizes</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-warning group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Resources Card */}
                    <Link to="/resources" className="group">
                      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-info/5 to-secondary/5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-info/10 rounded-full blur-2xl" />
                        <CardContent className="relative p-5">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-info to-secondary rounded-xl shadow-md group-hover:scale-105 transition-transform">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1">Study Resources</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">Past questions & materials</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-info group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    {/* Consultation Card */}
                    <Link to="/consultation" className="group">
                      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-accent/5 to-primary/5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl" />
                        <CardContent className="relative p-5">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-accent to-primary rounded-xl shadow-md group-hover:scale-105 transition-transform">
                              <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1">Expert Consultation</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">Book tutor sessions</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-accent group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </div>

                {/* Recent Test Results - Mobile Optimized */}
                {isMobile ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold">Recent Tests</h2>
                        <p className="text-xs text-muted-foreground">Your latest performance</p>
                      </div>
                    </div>
                    
                    {loading ? (
                      <div className="text-center text-muted-foreground py-8">Loading...</div>
                    ) : recentTests.length > 0 ? (
                      <div className="space-y-2">
                        {recentTests.map((test: any, index: number) => (
                          <MobileTestCard
                            key={index}
                            title={test.subject}
                            score={test.score}
                            date={test.date}
                            icon={BookOpen}
                            onClick={() => navigate(`/results?attempt=${test.attemptId}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 rounded-2xl bg-muted/50 border border-dashed border-border">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">No tests yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Take your first test to see results!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Test Results</CardTitle>
                      <CardDescription>Your latest performance overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {loading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : recentTests.length > 0 ? (
                          recentTests.map((test: any, index: number) => (
                            <Link key={index} to={`/results?attempt=${test.attemptId}`} className="block">
                              <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                  <div className="bg-primary/10 p-2 rounded-lg">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{test.subject}</h4>
                                    <p className="text-sm text-muted-foreground">{test.date}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-accent">{test.score}%</div>
                                  <p className="text-sm text-muted-foreground">{test.duration}</p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground">
                            No test results yet. Take your first test to see results here!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Subject Progress - Mobile Optimized */}
                {isMobile ? (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <h2 className="text-lg font-bold">Subject Progress</h2>
                      <p className="text-xs text-muted-foreground">Track your improvement</p>
                    </div>
                    
                    {loading ? (
                      <div className="text-center text-muted-foreground py-8">Loading...</div>
                    ) : subjectProgress.length > 0 ? (
                      <div className="space-y-2">
                        {subjectProgress.map((subject, index) => (
                          <MobileSubjectCard
                            key={index}
                            subject={subject.subject}
                            progress={subject.progress}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 rounded-2xl bg-muted/50 border border-dashed border-border">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-muted-foreground">No progress data yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Complete tests to track your progress</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Progress</CardTitle>
                      <CardDescription>Track your improvement across subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6">
                        {loading ? (
                          <div className="text-center text-muted-foreground">Loading...</div>
                        ) : subjectProgress.length > 0 ? (
                          <div className="grid gap-6">
                            {subjectProgress.map((subject, index) => (
                              <SubjectProgressCard
                                key={index}
                                subject={subject.subject}
                                progress={subject.progress}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            Complete some tests to track your subject progress!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Start Test */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Test</CardTitle>
                    <CardDescription>Jump into practice mode</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScheduleTestModal>
                      <Button className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </Button>
                    </ScheduleTestModal>
                  </CardContent>
                </Card>

                {/* Subscription Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>
                      {subscriptionLoading ? 'Loading...' : (subscription?.subscription_plans?.name || 'Free Plan')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge className="mb-4 bg-accent text-accent-foreground">
                        {subscriptionLoading ? 'Loading...' : (subscription?.status || 'Free')}
                      </Badge>
                      <p className="text-sm text-muted-foreground mb-4">
                        {subscription?.end_date 
                          ? `Expires on ${new Date(subscription.end_date).toLocaleDateString()}`
                          : 'No expiration'
                        }
                      </p>
                      <Link to="/payment">
                        <Button variant="outline" className="w-full">
                          {subscription ? 'Manage Subscription' : 'Upgrade Plan'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Study Planner */}
                <Link to="/study-planner">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-success" />
                        Study Planner
                      </CardTitle>
                      <CardDescription>Schedule study sessions</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Performance Reports */}
                <Link to="/performance-report">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-info" />
                        Reports
                      </CardTitle>
                      <CardDescription>View & print reports</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>

                {/* Referral Program */}
                <Link to="/referral-program">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-warning" />
                        Referrals
                      </CardTitle>
                      <CardDescription>Earn rewards</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <div className="space-y-8">
              <ProfileSettings />
              <AccountSettings />
            </div>
          </TabsContent>

        </Tabs>
      </div>
      <AIAssistant />
    </div>
  );
};

export default Dashboard;