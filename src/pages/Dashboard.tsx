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
import AppShell from "@/components/edura/AppShell";

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

  return (
    <AppShell
      side="cbt"
      title={`Welcome back, ${userProfile?.first_name || user?.email?.split("@")[0] || "Student"}`}
      subtitle={
        stats.testsTaken > 0
          ? `You've taken ${stats.testsTaken} test${stats.testsTaken === 1 ? "" : "s"} so far.`
          : "Ready to start your learning journey?"
      }
      meta={
        <>
          {!subscriptionLoading && (
            <Badge variant={isPremium ? "default" : "secondary"} className="text-[11px]">
              {isPremium ? "Premium" : "Free plan"}
            </Badge>
          )}
          {schoolInfo && (
            <Badge variant="outline" className="text-[11px]">{schoolInfo.name}</Badge>
          )}
        </>
      }
      action={
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("dashboard")}
            className="gap-1.5"
          >
            <Target className="h-4 w-4" /> Overview
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("profile")}
            className="gap-1.5"
          >
            <User className="h-4 w-4" /> Profile
          </Button>
        </div>
      }
    >
      <OnboardingTour isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />

      {activeTab === "dashboard" ? (
        <div className="space-y-6 animate-fade-in">{renderBentoContent()}</div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <ProfileSettings />
          <AccountSettings />
        </div>
      )}

      <AIAssistant />

      <InstallRequiredModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
        featureName={blockedFeatureName}
      />
    </AppShell>
  );
};


export default Dashboard;
