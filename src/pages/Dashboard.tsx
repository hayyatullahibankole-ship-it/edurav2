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
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileSettings from "@/components/ProfileSettings";
import ScheduleTestModal from "@/components/ScheduleTestModal";

const Dashboard = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
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
    }
  }, [userProfile?.id]);

  const fetchDashboardData = async () => {
    if (!userProfile?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's attempts and results
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select(`
          *,
          results(*)
        `)
        .eq('user_id', userProfile.id)
        .eq('status', 'SUBMITTED')
        .order('submitted_at', { ascending: false });

      if (attemptsError) {
        console.error('Error fetching attempts:', attemptsError);
        return;
      }

      // Calculate statistics
      const testsTaken = attempts?.length || 0;
      const resultsWithScores = attempts?.filter(a => a.results && Array.isArray(a.results) && a.results.length > 0) || [];
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

      setStats({
        testsTaken,
        averageScore,
        studyHours,
        rank: 0, // TODO: Implement ranking system
        totalStudents: 500 // TODO: Get from actual data
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
        if (typeof breakdown === 'object' && breakdown !== null) {
          Object.entries(breakdown).forEach(([subject, data]: [string, any]) => {
            if (!subjectScores[subject]) {
              subjectScores[subject] = [];
            }
            subjectScores[subject].push(data?.percentage || 0);
          });
        }
      });

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
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {userProfile?.first_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">Continue your exam preparation journey</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-accent text-accent-foreground">
                Premium Member
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">
              <Target className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <TabsContent value="dashboard" className="mt-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.testsTaken}</div>
                  <p className="text-xs text-muted-foreground">Total attempts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : `${stats.averageScore}%`}</div>
                  <p className="text-xs text-muted-foreground">Across all tests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : `${stats.studyHours}h`}</div>
                  <p className="text-xs text-muted-foreground">Time spent on tests</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "N/A"}</div>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>
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
                      <ScheduleTestModal>
                        <Button className="w-full h-20 flex-col gap-2">
                          <Play className="h-6 w-6" />
                          Start Test
                        </Button>
                      </ScheduleTestModal>
                      <Link to="/resources">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <FileText className="h-6 w-6" />
                          Browse Resources
                        </Button>
                      </Link>
                      <Link to="/resources">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <Video className="h-6 w-6" />
                          Watch Tutorials
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
                    <div className="space-y-6">
                      {loading ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                      ) : subjectProgress.length > 0 ? (
                        subjectProgress.map((subject, index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{subject.subject}</span>
                              <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                            </div>
                            <Progress value={subject.progress} className="h-2" />
                          </div>
                        ))
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
                    <CardDescription>Premium Plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge className="mb-4 bg-accent text-accent-foreground">Active</Badge>
                      <p className="text-sm text-muted-foreground mb-4">Expires on Mar 15, 2024</p>
                      <Link to="/pricing">
                        <Button variant="outline" className="w-full">
                          Manage Subscription
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
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Settings panel will be implemented here with notification preferences,
                  privacy settings, and account management options.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;