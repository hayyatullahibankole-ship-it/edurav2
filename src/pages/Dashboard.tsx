import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
  ChevronRight,
  Search,
  Bell,
  Mail,
  Settings2,
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
import { ServicesStrip } from "@/components/edura/ServicesStrip";
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
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SchoolAvailableExams from "@/components/school/SchoolAvailableExams";
import { PromoCodeActivation } from "@/components/dashboard/PromoCodeActivation";
import { FreeAccessBanner } from "@/components/dashboard/FreeAccessBanner";
import { InstallRequiredModal } from "@/components/InstallRequiredModal";
import MockResultChecker from "@/components/MockResultChecker";
import { ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const {
    subscription,
    loading: subscriptionLoading,
    isPremium,
    hasFreePromoAccess,
    freeAccessExpiry,
    freeAccessExpired,
  } = useSubscription();
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
    totalStudents: 0,
  });
  const [recentTests, setRecentTests] = useState([]);
  const [subjectProgress, setSubjectProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [blockedFeatureName, setBlockedFeatureName] = useState('');
  const [showMockResult, setShowMockResult] = useState(false);

  // Check if user is on mobile browser (not installed app)
  const isMobileBrowser = isMobile && !isInstalledApp;

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
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", userProfile.id)
        .single();

      if (error) throw error;

      // Show onboarding for new users who haven't completed it
      if (!data?.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const fetchDashboardData = async () => {
    if (!userProfile?.id) return;

    setLoading(true);
    try {
      // Check if student belongs to a school
      const { data: schoolStudent } = await supabase
        .from("school_students")
        .select("school_id, schools(name, logo_url, school_code)")
        .eq("user_id", userProfile.id)
        .maybeSingle();

      if (schoolStudent?.schools) {
        setSchoolInfo(schoolStudent.schools);
      }

      // Fetch user's attempts using secure RPC function
      const { data: allAttempts, error: attemptsError } = await supabase.rpc("get_student_exam_progress");

      const attempts = allAttempts
        ?.filter((a) => a.user_id === userProfile.id && a.status === "SUBMITTED")
        .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

      // Fetch all results at once instead of one by one for better performance
      const attemptIds = (attempts || []).map((a) => a.id);
      const { data: allResults } = await supabase.from("results").select("*").in("attempt_id", attemptIds);

      // Map results to attempts
      const resultsMap = new Map(allResults?.map((r) => [r.attempt_id, r]) || []);
      const attemptsWithResults = (attempts || []).map((attempt) => ({
        ...attempt,
        results: resultsMap.has(attempt.id) ? [resultsMap.get(attempt.id)] : [],
      }));

      if (attemptsError) {
        console.error("Error fetching attempts:", attemptsError);
        return;
      }

      // Calculate statistics
      const testsTaken = attemptsWithResults?.length || 0;
      const resultsWithScores =
        attemptsWithResults?.filter((a) => a.results && Array.isArray(a.results) && a.results.length > 0) || [];
      const averageScore =
        resultsWithScores.length > 0
          ? Math.round(
              resultsWithScores.reduce((sum, a) => {
                const result = Array.isArray(a.results) ? a.results[0] : a.results;
                return sum + (result?.percentage || 0);
              }, 0) / resultsWithScores.length,
            )
          : 0;

      // Calculate study hours (estimated from time taken in exams)
      const studyHours = Math.round(
        resultsWithScores.reduce((sum, a) => {
          const result = Array.isArray(a.results) ? a.results[0] : a.results;
          return sum + (result?.time_taken_minutes || 0);
        }, 0) / 60,
      );

      // Live rank via edge function based on your latest attempt
      let rank = 0;
      let totalStudents = 0;
      const latestAttemptId = resultsWithScores[0]?.id;
      if (latestAttemptId && resultsWithScores[0]?.results?.[0]) {
        try {
          const { data: rankData } = await supabase.functions.invoke("get-rank", {
            body: { attemptId: latestAttemptId },
          });
          if (rankData) {
            rank = rankData.rank || 0;
            totalStudents = rankData.total || 0;
          }
        } catch (e) {
          console.warn("Failed to fetch live rank", e);
          // Continue without rank data
        }
      }

      setStats({
        testsTaken,
        averageScore,
        studyHours,
        rank,
        totalStudents,
      });

      // Recent test results
      const recentTestsData = resultsWithScores.slice(0, 3).map((attempt: any) => {
        const result = Array.isArray(attempt.results) ? attempt.results[0] : attempt.results;
        const timeTaken = result?.time_taken_minutes || 0;

        // Get subject info from proctoring_data
        const proctoringData = (attempt.proctoring_data as any) || {};
        const testTitle = proctoringData.title || "Practice Test";

        return {
          attemptId: attempt.id,
          subject: testTitle,
          score: Math.round(result?.percentage || 0),
          date: new Date(attempt.submitted_at).toLocaleDateString(),
          duration: `${Math.floor(timeTaken / 60)}h ${timeTaken % 60}m`,
        };
      });
      setRecentTests(recentTestsData);

      // Subject progress (calculate from subject breakdown in results)
      const subjectScores: { [key: string]: number[] } = {};
      resultsWithScores.forEach((attempt) => {
        const result = Array.isArray(attempt.results) ? attempt.results[0] : attempt.results;
        const breakdown = result?.subject_breakdown || {};

        console.log("Processing breakdown:", breakdown); // Debug log

        if (typeof breakdown === "object" && breakdown !== null) {
          Object.entries(breakdown).forEach(([subject, data]: [string, any]) => {
            // Clean up subject name and ensure we capture it properly
            const cleanSubject = subject.trim();
            if (!subjectScores[cleanSubject]) {
              subjectScores[cleanSubject] = [];
            }

            // Handle both percentage and score data
            let percentage = 0;
            if (typeof data === "object" && data !== null) {
              percentage = data.percentage || data.score || 0;
            } else if (typeof data === "number") {
              percentage = data;
            }

            subjectScores[cleanSubject].push(percentage);
          });
        }
      });

      console.log("Subject scores calculated:", subjectScores); // Debug log

      const subjectProgressData = Object.entries(subjectScores).map(([subject, scores]) => ({
        subject,
        progress: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
        total: 100,
      }));
      setSubjectProgress(subjectProgressData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Show loading toast
      toast({
        title: "Logging out...",
        description: "Please wait",
      });

      await signOut();

      // Clear any cached data
      window.sessionStorage.clear();

      // Navigate to auth page
      navigate("/auth", { replace: true });

      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Force navigation even on error
      navigate("/auth", { replace: true });
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  // If on mobile, show the old layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingTour isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />

        {/* Modern Clean Header */}
        <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and User Info */}
              <div className="flex items-center gap-4">
                {schoolInfo?.logo_url ? (
                  <Avatar className="h-10 w-10 border-2">
                    <AvatarImage src={`${schoolInfo.logo_url}?t=${Date.now()}`} alt={schoolInfo.name} />
                    <AvatarFallback>
                      <img src={eduraLogo} alt="Edura" className="h-8 w-auto" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <img src={eduraLogo} alt="Edura" className="h-8 w-auto" />
                  </div>
                )}
                {schoolInfo && (
                  <div className="hidden md:block">
                    <p className="text-xs font-medium text-muted-foreground">{schoolInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{schoolInfo.school_code}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!subscriptionLoading && (
                  <Badge variant={isPremium ? "default" : "secondary"} className="hidden md:flex">
                    {isPremium ? (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      "Free Plan"
                    )}
                  </Badge>
                )}
                <NotificationBell />
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isInstalledApp ? "pb-24" : ""}`}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              console.log("Tab changed to:", value);
              setActiveTab(value);
            }}
          >
            <TabsList className={`w-full md:w-auto mb-6 ${isInstalledApp ? "hidden" : ""}`}>
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
              {/* Free Access Banner */}
              {hasFreePromoAccess && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} />}
              {freeAccessExpired && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} isExpired />}

              {/* Promo Code Activation - only show if no premium/free access */}
              {!isPremium && !hasFreePromoAccess && !subscriptionLoading && (
                <PromoCodeActivation onSuccess={() => window.location.reload()} />
              )}

              {/* Stats Overview */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Your Performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card className="border-border/50 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold">{loading ? "..." : stats.testsTaken}</div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Tests Taken</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:border-accent/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-accent" />
                        </div>
                        <div className="text-3xl font-bold">{loading ? "..." : `${stats.averageScore}%`}</div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:border-secondary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-secondary/10 rounded-lg">
                          <Clock className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="text-3xl font-bold">{loading ? "..." : `${stats.studyHours}h`}</div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Study Time</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 hover:border-warning/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <Trophy className="h-5 w-5 text-warning" />
                        </div>
                        <div className="text-3xl font-bold">
                          {loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "—"}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Your Rank</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Check Mock Result */}
              {showMockResult ? (
                <div className="space-y-4">
                  <Button variant="outline" onClick={() => setShowMockResult(false)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                  </Button>
                  <MockResultChecker />
                </div>
              ) : (
              <>
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">2026 Mock Examination</h3>
                      <p className="text-sm text-muted-foreground">Check your WAEC-style mock result</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowMockResult(true)} className="gap-2">
                    <FileText className="h-4 w-4" /> Check Mock Result
                  </Button>
                </CardContent>
              </Card>

              <ServicesStrip />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  {/* Quick Actions */}
                  {!isInstalledApp && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg md:text-xl">Start Practice</CardTitle>
                        <CardDescription>Choose your exam type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {isMobileBrowser ? (
                            <>
                              <Button 
                                size="lg" 
                                className="w-full h-auto py-4 flex-col gap-2"
                                onClick={() => {
                                  setBlockedFeatureName('JAMB CBT Practice');
                                  setShowInstallModal(true);
                                }}
                              >
                                <Play className="h-5 w-5" />
                                <span className="font-semibold">JAMB Practice</span>
                              </Button>
                              <Button 
                                size="lg" 
                                variant="outline" 
                                className="w-full h-auto py-4 flex-col gap-2"
                                onClick={() => {
                                  setBlockedFeatureName('WAEC CBT Practice');
                                  setShowInstallModal(true);
                                }}
                              >
                                <Play className="h-5 w-5" />
                                <span className="font-semibold">WAEC Practice</span>
                              </Button>
                              <Button 
                                size="lg" 
                                variant="outline" 
                                className="w-full h-auto py-4 flex-col gap-2"
                                onClick={() => {
                                  setBlockedFeatureName('NECO CBT Practice');
                                  setShowInstallModal(true);
                                }}
                              >
                                <Play className="h-5 w-5" />
                                <span className="font-semibold">NECO Practice</span>
                              </Button>
                              <Button 
                                size="lg" 
                                variant="outline" 
                                className="w-full h-auto py-4 flex-col gap-2"
                                onClick={() => {
                                  setBlockedFeatureName('Post-UTME CBT Practice');
                                  setShowInstallModal(true);
                                }}
                              >
                                <Play className="h-5 w-5" />
                                <span className="font-semibold">POST-UTME</span>
                              </Button>
                            </>
                          ) : (
                            <>
                              <ScheduleTestModal defaultExamType="jamb">
                                <Button size="lg" className="w-full h-auto py-4 flex-col gap-2">
                                  <Play className="h-5 w-5" />
                                  <span className="font-semibold">JAMB Practice</span>
                                </Button>
                              </ScheduleTestModal>
                              <ScheduleTestModal defaultExamType="waec">
                                <Button size="lg" variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                  <Play className="h-5 w-5" />
                                  <span className="font-semibold">WAEC Practice</span>
                                </Button>
                              </ScheduleTestModal>
                              <ScheduleTestModal defaultExamType="neco">
                                <Button size="lg" variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                  <Play className="h-5 w-5" />
                                  <span className="font-semibold">NECO Practice</span>
                                </Button>
                              </ScheduleTestModal>
                              <ScheduleTestModal defaultExamType="post-utme">
                                <Button size="lg" variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                  <Play className="h-5 w-5" />
                                  <span className="font-semibold">POST-UTME</span>
                                </Button>
                              </ScheduleTestModal>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Subscription Management - Mobile Only */}
                  {isMobile && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Subscription</h3>
                              <p className="text-xs text-muted-foreground">
                                {isPremium ? "Premium Active" : "Free Plan"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Link to="/payment">
                          <Button className="w-full" variant={isPremium ? "outline" : "default"}>
                            {isPremium ? "Manage Plan" : "Go Premium"}
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {/* Premium Features */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Explore Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {/* Study Hub */}
                      <Link to="/install-app">
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <GraduationCap className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1 flex items-center gap-2">
                                  Study Hub
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground">Lessons & tutorials</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Ask Tutor */}
                      <Link to="/install-app">
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="p-2.5 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                                <MessageSquare className="h-6 w-6 text-accent" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1 flex items-center gap-2">
                                  Ask Tutor
                                  <Badge variant="secondary" className="text-xs">
                                    24/7
                                  </Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground">Get instant help</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Challenge Arena */}
                      <Link to="/install-app">
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="p-2.5 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
                                <Sword className="h-6 w-6 text-warning" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1 flex items-center gap-2">
                                  Challenge Arena
                                  <Badge variant="secondary" className="text-xs">
                                    New
                                  </Badge>
                                </h3>
                                <p className="text-sm text-muted-foreground">Compete & win prizes</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-warning group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Resources */}
                      <Link to="/resources">
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="p-2.5 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                                <FileText className="h-6 w-6 text-secondary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1">Study Resources</h3>
                                <p className="text-sm text-muted-foreground">Past questions & materials</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>

                      {/* Consultation */}
                      <Link to="/consultation">
                        <Card className="group hover:shadow-md transition-shadow cursor-pointer h-full">
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="p-2.5 bg-info/10 rounded-lg group-hover:bg-info/20 transition-colors">
                                <Calendar className="h-6 w-6 text-info" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1">Expert Consultation</h3>
                                <p className="text-sm text-muted-foreground">Book tutor sessions</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-info group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </div>

                  {/* School Assigned Exams - Only show if student is part of a school */}
                  <div className="mb-8">
                    <SchoolAvailableExams />
                  </div>

                  {/* Recent Test Results */}
                  {isMobile ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Recent Tests</h2>
                      {loading ? (
                        <div className="text-center text-muted-foreground py-8">Loading...</div>
                      ) : recentTests.length > 0 ? (
                        <div className="space-y-3">
                          {recentTests.map((test: any, index: number) => (
                            <Card
                              key={index}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => navigate(`/results?attempt=${test.attemptId}`)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <BookOpen className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{test.subject}</h4>
                                      <p className="text-sm text-muted-foreground">{test.date}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold">{test.score}%</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                            <p className="text-muted-foreground">No tests yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Take your first test to see results</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Tests</CardTitle>
                        <CardDescription>Your latest performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {loading ? (
                            <div className="text-center text-muted-foreground py-4">Loading...</div>
                          ) : recentTests.length > 0 ? (
                            recentTests.map((test: any, index: number) => (
                              <Link key={index} to={`/results?attempt=${test.attemptId}`}>
                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
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
                                    <div className="text-2xl font-bold">{test.score}%</div>
                                    <p className="text-sm text-muted-foreground">{test.duration}</p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="text-center text-muted-foreground py-8">
                              No test results yet. Take your first test!
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Subject Progress */}
                  {isMobile ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Subject Progress</h2>
                      {loading ? (
                        <div className="text-center text-muted-foreground py-8">Loading...</div>
                      ) : subjectProgress.length > 0 ? (
                        <div className="space-y-3">
                          {subjectProgress.map((subject, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-semibold">{subject.subject}</h4>
                                  <span className="text-lg font-bold">{subject.progress}%</span>
                                </div>
                                <Progress value={subject.progress} className="h-2" />
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                            <p className="text-muted-foreground">No progress data yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Complete tests to track your progress</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Subject Progress</CardTitle>
                        <CardDescription>Track your improvement across subjects</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="text-center text-muted-foreground py-4">Loading...</div>
                        ) : subjectProgress.length > 0 ? (
                          <div className="space-y-6">
                            {subjectProgress.map((subject, index) => (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{subject.subject}</span>
                                  <span className="text-lg font-bold">{subject.progress}%</span>
                                </div>
                                <Progress value={subject.progress} className="h-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            Complete some tests to track your subject progress!
                          </div>
                        )}
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
                      {isMobileBrowser ? (
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setBlockedFeatureName('CBT Practice');
                            setShowInstallModal(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Test
                        </Button>
                      ) : (
                        <ScheduleTestModal>
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Start Test
                          </Button>
                        </ScheduleTestModal>
                      )}
                    </CardContent>
                  </Card>

                  {/* Subscription Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription</CardTitle>
                      <CardDescription>
                        {subscriptionLoading ? "Loading..." : subscription?.subscription_plans?.name || "Free Plan"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <Badge className="mb-4 bg-accent text-accent-foreground">
                          {subscriptionLoading ? "Loading..." : subscription?.status || "Free"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mb-4">
                          {subscription?.end_date
                            ? `Expires on ${new Date(subscription.end_date).toLocaleDateString()}`
                            : "No expiration"}
                        </p>
                        <Link to="/payment">
                          <Button variant="outline" className="w-full">
                            {subscription ? "Manage Subscription" : "Upgrade Plan"}
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
              </>
              )}
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
        
        {/* Install Required Modal for mobile browser users */}
        <InstallRequiredModal 
          open={showInstallModal} 
          onOpenChange={setShowInstallModal}
          featureName={blockedFeatureName}
        />
      </div>
    );
  }

  // Desktop Layout with Sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OnboardingTour isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />

        <DashboardSidebar onLogout={handleLogout} schoolInfo={schoolInfo} />

        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="border-b bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm sticky top-0 z-50">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back, {userProfile?.first_name || user?.email?.split("@")[0] || "Student"}!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {stats.testsTaken > 0
                      ? `You've taken ${stats.testsTaken} tests`
                      : "Ready to start your learning journey?"}
                  </p>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                  <NotificationBell />

                  {/* User Profile */}
                  <div className="flex items-center gap-3 pl-3 border-l">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {userProfile?.first_name || user?.email?.split("@")[0] || "User"}
                      </p>
                      <Badge variant={isPremium ? "default" : "secondary"} className="text-xs">
                        {isPremium ? "Premium" : "Free"}
                      </Badge>
                    </div>
                    <Avatar>
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(userProfile?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-background via-muted/30 to-background">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="dashboard" className="space-y-6 mt-0 animate-fade-in">
                {/* Free Access Banner */}
                {hasFreePromoAccess && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} />}
                {freeAccessExpired && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} isExpired />}

                {/* Promo Code Activation - only show if no premium/free access */}
                {!isPremium && !hasFreePromoAccess && !subscriptionLoading && (
                  <PromoCodeActivation onSuccess={() => window.location.reload()} />
                )}

                {/* Stats Cards Row */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Total Tests</p>
                          <p className="text-3xl font-bold">{stats.testsTaken}</p>
                          <p className="text-xs text-muted-foreground mt-1">Tests this Month</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <Target className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2 */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                          <p className="text-3xl font-bold">{stats.averageScore}%</p>
                          <p className="text-xs text-muted-foreground mt-1">Tests this Month</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3 - Highlighted */}
                  <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90 mb-1">Study Hours</p>
                          <p className="text-3xl font-bold">{stats.studyHours}h</p>
                          <p className="text-xs opacity-80 mt-1">Total Study Time</p>
                        </div>
                        <div className="p-3 bg-primary-foreground/20 rounded-lg">
                          <Clock className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Check Mock Result - Desktop */}
                {showMockResult ? (
                  <div className="space-y-4">
                    <Button variant="outline" onClick={() => setShowMockResult(false)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Button>
                    <MockResultChecker />
                  </div>
                ) : (
                <>
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">2026 Mock Examination</h3>
                        <p className="text-sm text-muted-foreground">Check your WAEC-style mock result</p>
                      </div>
                    </div>
                    <Button onClick={() => setShowMockResult(true)} className="gap-2">
                      <FileText className="h-4 w-4" /> Check Mock Result
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Start Practice</CardTitle>
                    <CardDescription>Choose your exam type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <ScheduleTestModal defaultExamType="jamb">
                        <Button size="lg" className="w-full h-auto py-4 flex-col gap-2">
                          <Play className="h-5 w-5" />
                          <span className="font-semibold">JAMB Practice</span>
                        </Button>
                      </ScheduleTestModal>
                      <ScheduleTestModal defaultExamType="waec">
                        <Button size="lg" variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                          <Play className="h-5 w-5" />
                          <span className="font-semibold">WAEC Practice</span>
                        </Button>
                      </ScheduleTestModal>
                    </div>
                  </CardContent>
                </Card>

                {/* School Assigned Exams (desktop) */}
                <div className="mb-8">
                  <SchoolAvailableExams />
                </div>

                {/* Recent Tests */}
                {recentTests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentTests.map((test: any, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{test.subject}</p>
                              <p className="text-sm text-muted-foreground">{test.date}</p>
                            </div>
                            <Badge variant={test.score >= 70 ? "default" : "secondary"}>{test.score}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                </>
                )}
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                <div className="space-y-6">
                  <ProfileSettings />
                  <AccountSettings />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <AIAssistant />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
