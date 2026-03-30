import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BookOpen, Clock, Target, TrendingUp, Play, Trophy, User, LogOut, Zap, GraduationCap, MessageSquare, Sword, ChevronRight, FileText, Calendar } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileSettings from "@/components/ProfileSettings";
import AccountSettings from "@/components/AccountSettings";
import ScheduleTestModal from "@/components/ScheduleTestModal";
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
import { SchoolReportSheet } from '@/components/reports/SchoolReportSheet';

const Dashboard = () => {
  const { userProfile, signOut } = useAuth();
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
  const [showReportSheet, setShowReportSheet] = useState(false);

  function getGrade(score: number) {
    if (score >= 75) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  }

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!userProfile?.id) return;
      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("onboarding_completed")
          .eq("user_id", userProfile.id)
          .single();
        if (error) throw error;
        if (!data?.onboarding_completed) setShowOnboarding(true);
      } catch (error) {}
    }
    if (userProfile?.id) checkOnboardingStatus();
  }, [userProfile]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: schoolStudent } = await supabase
          .from("school_students")
          .select("school_id, schools(name, logo_url, school_code, session, term)")
          .eq("user_id", userProfile.id)
          .maybeSingle();
        if (schoolStudent?.schools) setSchoolInfo(schoolStudent.schools);

        const { data: allAttempts } = await supabase.rpc("get_student_exam_progress");
        const attempts = allAttempts
          ?.filter((a) => a.user_id === userProfile.id && a.status === "SUBMITTED")
          .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
        const attemptIds = (attempts || []).map((a) => a.id);
        const { data: allResults } = await supabase.from("results").select("*").in("attempt_id", attemptIds);
        const resultsMap = new Map(allResults?.map((r) => [r.attempt_id, r]) || []);
        const attemptsWithResults = (attempts || []).map((attempt) => ({
          ...attempt,
          results: resultsMap.has(attempt.id) ? [resultsMap.get(attempt.id)] : [],
        }));
        const resultsWithScores = attemptsWithResults?.filter((a) => a.results && Array.isArray(a.results) && a.results.length > 0) || [];
        const averageScore = resultsWithScores.length > 0
          ? Math.round(resultsWithScores.reduce((sum, a) => {
              const result = Array.isArray(a.results) ? a.results[0] : a.results;
              return sum + (result?.percentage || 0);
            }, 0) / resultsWithScores.length)
          : 0;
        const studyHours = Math.round(resultsWithScores.reduce((sum, a) => {
          const result = Array.isArray(a.results) ? a.results[0] : a.results;
          return sum + (result?.time_taken_minutes || 0);
        }, 0) / 60);
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
          } catch (e) {}
        }
        setStats({
          testsTaken: resultsWithScores.length,
          averageScore,
          studyHours,
          rank,
          totalStudents,
        });
        const recentTestsData = resultsWithScores.slice(0, 3).map((attempt: any) => {
          const result = Array.isArray(attempt.results) ? attempt.results[0] : attempt.results;
          const timeTaken = result?.time_taken_minutes || 0;
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
        const subjectScores: { [key: string]: number[] } = {};
        resultsWithScores.forEach((attempt) => {
          const result = Array.isArray(attempt.results) ? attempt.results[0] : attempt.results;
          const breakdown = result?.subject_breakdown || {};
          if (typeof breakdown === "object" && breakdown !== null) {
            Object.entries(breakdown).forEach(([subject, data]: [string, any]) => {
              const cleanSubject = subject.trim();
              if (!subjectScores[cleanSubject]) subjectScores[cleanSubject] = [];
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
        const subjectProgressData = Object.entries(subjectScores).map(([subject, scores]) => ({
          subject,
          progress: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
          total: 100,
        }));
        setSubjectProgress(subjectProgressData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [userProfile]);

  useEffect(() => {
    const urlTab = searchParams.get("tab") || "dashboard";
    if (urlTab !== activeTab) setActiveTab(urlTab);
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      toast({ title: "Logging out...", description: "Please wait" });
      await signOut();
      window.sessionStorage.clear();
      navigate("/auth", { replace: true });
      toast({ title: "Logged out successfully", description: "See you next time!" });
    } catch {
      navigate("/auth", { replace: true });
    }
  };

  if (loading) return <LoadingAnimation />;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingTour isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
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
                  <>
                    <div className="hidden md:block">
                      <p className="text-xs font-medium text-muted-foreground">{schoolInfo.name}</p>
                      <p className="text-xs text-muted-foreground">{schoolInfo.school_code}</p>
                    </div>
                    <Button className="mb-4 w-full bg-primary text-white font-bold" onClick={() => setShowReportSheet(true)}>
                      Check School Mock Result
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!subscriptionLoading && (
                  <Badge variant={isPremium ? "default" : "secondary"} className="hidden md:flex">
                    {isPremium ? (<><Zap className="h-3 w-3 mr-1" />Premium</>) : "Free Plan"}
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
        {/* ...existing mobile dashboard content... */}
        {/* Modal for report sheet */}
        {showReportSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-2xl mx-auto">
              <div className="absolute top-2 right-2 z-10">
                <Button variant="ghost" size="icon" onClick={() => setShowReportSheet(false)}>
                  ✕
                </Button>
              </div>
              <SchoolReportSheet
                studentName={userProfile?.first_name + ' ' + userProfile?.last_name}
                schoolName={schoolInfo?.name}
                schoolLogoUrl={schoolInfo?.logo_url}
                eduraLogoUrl={eduraLogo}
                subjects={subjectProgress.map(s => ({ subject: s.subject, score: s.progress, grade: getGrade(s.progress) }))}
                average={stats.averageScore}
                overallGrade={getGrade(stats.averageScore)}
                session={schoolInfo?.session}
                term={schoolInfo?.term}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OnboardingTour isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />
        <DashboardSidebar onLogout={handleLogout} schoolInfo={schoolInfo} />
        <main className="flex-1 flex flex-col min-h-screen">
          {/* ...existing desktop dashboard content... */}
        </main>
        {/* Modal for report sheet */}
        {showReportSheet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-2xl mx-auto">
              <div className="absolute top-2 right-2 z-10">
                <Button variant="ghost" size="icon" onClick={() => setShowReportSheet(false)}>
                  ✕
                </Button>
              </div>
              <SchoolReportSheet
                studentName={userProfile?.first_name + ' ' + userProfile?.last_name}
                schoolName={schoolInfo?.name}
                schoolLogoUrl={schoolInfo?.logo_url}
                eduraLogoUrl={eduraLogo}
                subjects={subjectProgress.map(s => ({ subject: s.subject, score: s.progress, grade: getGrade(s.progress) }))}
                average={stats.averageScore}
                overallGrade={getGrade(stats.averageScore)}
                session={schoolInfo?.session}
                term={schoolInfo?.term}
              />
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;




