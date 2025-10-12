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

  useEffect(() => {
    if (userProfile?.id) {
      fetchDashboardData();
    } else if (userProfile !== undefined) {
      // If userProfile is loaded but has no id, stop loading
      setLoading(false);
    }
  }, [userProfile]);

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
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {subscriptionLoading ? 'Loading...' : (isPremium ? '✨ Premium Member' : 'Free Member')}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                Welcome back, {userProfile?.first_name || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-white/90 text-lg">Ready to ace your exams? Let's continue your journey to success!</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button 
                variant="secondary" 
                onClick={handleLogout}
                className="flex items-center gap-2 shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => {
          console.log('Tab changed to:', value);
          setActiveTab(value);
        }}>
          <TabsList className="grid w-full grid-cols-3 relative z-50">
            <TabsTrigger value="dashboard" className="pointer-events-auto cursor-pointer">
              <Target className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="profile" className="pointer-events-auto cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="pointer-events-auto cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 animate-scale-in">
              <StatCard 
                icon={Target}
                label="Tests Taken"
                value={loading ? "..." : stats.testsTaken}
                subtext="Total attempts"
                gradient="from-primary to-primary-glow"
                iconColor="text-primary"
              />
              <StatCard 
                icon={TrendingUp}
                label="Average Score"
                value={loading ? "..." : `${stats.averageScore}%`}
                subtext="Across all tests"
                gradient="from-success to-success-glow"
                iconColor="text-success"
              />
              <StatCard 
                icon={Clock}
                label="Study Hours"
                value={loading ? "..." : `${stats.studyHours}h`}
                subtext="Time invested"
                gradient="from-info to-secondary"
                iconColor="text-info"
              />
              <StatCard 
                icon={Trophy}
                label="Rank"
                value={loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "N/A"}
                subtext={`Out of ${stats.totalStudents} students`}
                gradient="from-warning to-warning"
                iconColor="text-warning"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Jump back into your studies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ScheduleTestModal defaultExamType="jamb">
                        <Button className="w-full h-20 flex-col gap-2">
                          <Play className="h-6 w-6" />
                          JAMB Practice
                        </Button>
                      </ScheduleTestModal>
                      <ScheduleTestModal defaultExamType="waec">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <Play className="h-6 w-6" />
                          WAEC Practice
                        </Button>
                      </ScheduleTestModal>
                      <ScheduleTestModal defaultExamType="neco">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <Play className="h-6 w-6" />
                          NECO Practice
                        </Button>
                      </ScheduleTestModal>
                      <ScheduleTestModal defaultExamType="post-utme">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <Play className="h-6 w-6" />
                          Post-UTME Practice
                        </Button>
                      </ScheduleTestModal>
                    </div>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      <Link to="/resources">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <FileText className="h-6 w-6" />
                          Browse Resources
                        </Button>
                      </Link>
                      <Link to="/consultation">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <Calendar className="h-6 w-6" />
                          Book Session
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Hub - Mad Features! */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                      <Rocket className="h-6 w-6 text-primary animate-bounce-slow" />
                      Unlock Your Potential
                    </h2>
                    <p className="text-muted-foreground">Explore our amazing features designed to help you succeed</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard 
                      icon={GraduationCap}
                      title="Study Hub"
                      description="Access comprehensive lessons, video tutorials, and study materials curated by experts"
                      href="/study-hub"
                      gradient="from-primary to-secondary"
                      badge="Popular"
                    />
                    <FeatureCard 
                      icon={MessageSquare}
                      title="Ask Tutor"
                      description="Get instant help from tutors and peers. Ask questions, share knowledge, and learn together"
                      href="/forum"
                      gradient="from-success to-accent"
                      badge="24/7"
                    />
                    <FeatureCard 
                      icon={Sword}
                      title="Challenge Arena"
                      description="Compete with students nationwide! Earn points, climb leaderboards, and win amazing prizes"
                      href="/challenge-arena"
                      gradient="from-warning to-destructive"
                      badge="New"
                    />
                  </div>
                </div>

                {/* Recent Test Results */}
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

                {/* Subject Progress */}
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
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
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

                {/* Study Streak */}
                <Card>
                  <CardHeader>
                    <CardTitle>Study Streak</CardTitle>
                    <CardDescription>Keep the momentum going!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-accent mb-2">{loading ? "..." : stats.testsTaken}</div>
                      <p className="text-sm text-muted-foreground">Tests completed</p>
                      <ScheduleTestModal>
                        <Button className="w-full mt-4">Take Another Test</Button>
                      </ScheduleTestModal>
                    </div>
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
              </div>
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
    </div>
  );
};

export default Dashboard;