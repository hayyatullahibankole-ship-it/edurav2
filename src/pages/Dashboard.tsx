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
  Layers,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useWallet } from "@/hooks/useWallet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileSettings from "@/components/ProfileSettings";
import AccountSettings from "@/components/AccountSettings";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import SubjectProgressCard from "@/components/SubjectProgressCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { ModernQuickAction } from "@/components/dashboard/ModernQuickAction";

import { SideSwitcher } from "@/components/edura/SideSwitcher";

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
import { DashboardThemeMenu } from "@/components/DashboardThemeMenu";

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
  const { balance: walletBalance, loading: walletLoading } = useWallet();

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

  const examTypes = [
    { type: "jamb", label: "JAMB", subtitle: "UTME Practice", letter: "J" },
    { type: "waec", label: "WAEC", subtitle: "SSCE Practice", letter: "W" },
    { type: "neco", label: "NECO", subtitle: "Senior Secondary", letter: "N" },
    { type: "post-utme", label: "POST-UTME", subtitle: "University Practice", letter: "P" },
  ];

  const renderBentoContent = () => {
    if (showMockResult) {
      return (
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setShowMockResult(false)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <MockResultChecker />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Free Access Banner */}
        {hasFreePromoAccess && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} />}
        {freeAccessExpired && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} isExpired />}

        {/* Promo Code Activation */}
        {!isPremium && !hasFreePromoAccess && !subscriptionLoading && (
          <PromoCodeActivation onSuccess={() => window.location.reload()} />
        )}

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 auto-rows-min">
          {/* Row 1: Stats */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between col-span-2 md:col-span-3">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Tests</span>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">{loading ? "..." : stats.testsTaken}</h3>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between col-span-2 md:col-span-3">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Average Score</span>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">{loading ? "..." : `${stats.averageScore}%`}</h3>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between col-span-2 md:col-span-3">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Study Hours</span>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold">{loading ? "..." : `${stats.studyHours}h`}</h3>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between col-span-2 md:col-span-3">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Global Rank</span>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-bold text-primary">
                {loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "—"}
              </h3>
            </div>
          </div>

          {/* Row 2: Practice + Wallet */}
          <div className="bg-card border border-border rounded-2xl p-6 col-span-2 md:col-span-8">
            <h2 className="text-lg font-bold mb-4">Start Practice</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {examTypes.map((exam) =>
                isMobileBrowser ? (
                  <button
                    key={exam.type}
                    onClick={() => {
                      setBlockedFeatureName(`${exam.label} Practice`);
                      setShowInstallModal(true);
                    }}
                    className="bg-background border border-border rounded-xl p-4 text-center hover:border-primary transition-colors group"
                  >
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto mb-3 font-bold">
                      {exam.letter}
                    </div>
                    <span className="text-sm font-semibold block">{exam.label}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{exam.subtitle}</span>
                  </button>
                ) : (
                  <ScheduleTestModal key={exam.type} defaultExamType={exam.type}>
                    <button className="bg-background border border-border rounded-xl p-4 text-center hover:border-primary transition-colors group w-full">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mx-auto mb-3 font-bold">
                        {exam.letter}
                      </div>
                      <span className="text-sm font-semibold block">{exam.label}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{exam.subtitle}</span>
                    </button>
                  </ScheduleTestModal>
                ),
              )}
            </div>
          </div>

          {/* Wallet + Subscription */}
          <div className="col-span-2 md:col-span-4 flex flex-col gap-3 md:gap-4">
            <Link
              to="/wallet"
              className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col justify-between flex-1 hover:opacity-90 transition-opacity"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">Wallet Balance</span>
                <h2 className="text-2xl md:text-3xl font-black mt-1">
                  {walletLoading
                    ? "..."
                    : `₦${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </h2>
              </div>
              <div className="w-full bg-primary-foreground/10 text-primary-foreground py-2.5 rounded-xl font-bold text-sm text-center mt-4 border border-primary-foreground/20">
                Fund Wallet
              </div>
            </Link>

            <Link
              to="/payment"
              className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div>
                <span className="text-xs text-muted-foreground block">Subscription</span>
                <span className="text-sm font-bold">
                  {subscriptionLoading
                    ? "Loading..."
                    : subscription?.subscription_plans?.name || "Free Plan"}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                  isPremium ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {subscriptionLoading ? "..." : subscription?.status || "Free"}
              </span>
            </Link>
          </div>

          {/* Row 3: Quick Access + School Exams */}
          <div className="bg-card border border-border rounded-2xl p-6 col-span-2 md:col-span-5">
            <h2 className="text-lg font-bold mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/services"
                className="p-3 bg-background border border-border rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium">Edu Services</span>
              </Link>
              <Link
                to="/study-planner"
                className="p-3 bg-background border border-border rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium">Study Planner</span>
              </Link>
              <Link
                to="/resources"
                className="p-3 bg-background border border-border rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium">Past Questions</span>
              </Link>
              <Link
                to="/referral-program"
                className="p-3 bg-background border border-border rounded-xl flex items-center gap-3 hover:border-primary/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-medium">Referrals</span>
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 col-span-2 md:col-span-7">
            <h2 className="text-lg font-bold mb-4">School Exams</h2>
            <SchoolAvailableExams />
          </div>

          {/* Row 4: Subject Progress + Recent Results + Mock Checker */}
          <div className="bg-card border border-border rounded-2xl p-6 col-span-2 md:col-span-4">
            <h2 className="text-lg font-bold mb-4">Subject Progress</h2>
            {loading ? (
              <div className="text-center text-muted-foreground py-4 text-sm">Loading...</div>
            ) : subjectProgress.length > 0 ? (
              <div className="space-y-4">
                {subjectProgress.slice(0, 5).map((subject: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-muted-foreground">{subject.subject}</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4 text-sm">
                Complete tests to track progress
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 col-span-2 md:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Results</h2>
              <Link
                to="/performance-report"
                className="text-primary text-xs font-semibold hover:underline"
              >
                View All
              </Link>
            </div>
            {loading ? (
              <div className="text-center text-muted-foreground py-4 text-sm">Loading...</div>
            ) : recentTests.length > 0 ? (
              <div className="space-y-3">
                {recentTests.map((test: any, index: number) => (
                  <Link key={index} to={`/results?attempt=${test.attemptId}`} className="block">
                    <div className="p-3 bg-background rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="text-xs font-bold">{test.subject}</p>
                        <p className="text-[10px] text-muted-foreground">{test.date}</p>
                      </div>
                      <p className="text-xs font-black text-primary">{test.score}%</p>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/performance-report"
                  className="block w-full py-2 mt-2 text-[10px] text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors text-center"
                >
                  View Detailed Reports
                </Link>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4 text-sm">
                No tests yet. Start practicing!
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 col-span-2 md:col-span-4 flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Mock Checker</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Check your official JAMB/WAEC mock examination results.
              </p>
              <Button onClick={() => setShowMockResult(true)} className="w-full gap-2">
                <FileText className="h-4 w-4" /> Check Result
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    );
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
                <SideSwitcher compact />

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
              {renderBentoContent()}
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
          <header className="border-b bg-background sticky top-0 z-50">
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
                  <SideSwitcher compact />
                  <DashboardThemeMenu />
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
          <div className="flex-1 p-8 overflow-auto bg-background">
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
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Study Hours</p>
                          <p className="text-3xl font-bold">{stats.studyHours}h</p>
                          <p className="text-xs text-muted-foreground mt-1">Total Study Time</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <Clock className="h-6 w-6 text-muted-foreground" />
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
                <Card className="border">
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
