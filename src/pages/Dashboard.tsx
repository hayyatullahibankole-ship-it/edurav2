import React, { useState } from "react";
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
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import ProfileSettings from "@/components/ProfileSettings";

const Dashboard = () => {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const recentTests = [
    { subject: "Mathematics", score: 85, date: "2024-01-15", duration: "1h 30m" },
    { subject: "English", score: 92, date: "2024-01-14", duration: "1h 45m" },
    { subject: "Physics", score: 78, date: "2024-01-13", duration: "2h 00m" }
  ];

  const subjectProgress = [
    { subject: "Mathematics", progress: 85, total: 100 },
    { subject: "English", progress: 92, total: 100 },
    { subject: "Physics", progress: 78, total: 100 },
    { subject: "Chemistry", progress: 65, total: 100 },
    { subject: "Biology", progress: 88, total: 100 }
  ];

  const upcomingTests = [
    { title: "JAMB Mathematics Mock", date: "Jan 20, 2024", time: "10:00 AM" },
    { title: "WAEC English Practice", date: "Jan 22, 2024", time: "2:00 PM" }
  ];

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
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="logout" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">+5% improvement</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42h</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rank</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#12</div>
                  <p className="text-xs text-muted-foreground">Out of 500 students</p>
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
                      <Link to="/practice">
                        <Button className="w-full h-20 flex-col gap-2">
                          <Play className="h-6 w-6" />
                          Start Practice Test
                        </Button>
                      </Link>
                      <Link to="/resources">
                        <Button variant="outline" className="w-full h-20 flex-col gap-2">
                          <FileText className="h-6 w-6" />
                          Browse Resources
                        </Button>
                      </Link>
                      <Link to="/videos">
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
                      {recentTests.map((test, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
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
                      ))}
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
                      {subjectProgress.map((subject, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{subject.subject}</span>
                            <span className="text-sm text-muted-foreground">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Tests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Tests</CardTitle>
                    <CardDescription>Scheduled practice sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingTests.map((test, index) => (
                        <div key={index} className="p-3 border border-border rounded-lg">
                          <h4 className="font-semibold text-sm">{test.title}</h4>
                          <p className="text-xs text-muted-foreground">{test.date}</p>
                          <p className="text-xs text-primary">{test.time}</p>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full">
                        Schedule New Test
                      </Button>
                    </div>
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
                      <div className="text-4xl font-bold text-accent mb-2">7</div>
                      <p className="text-sm text-muted-foreground">Days in a row</p>
                      <Button className="w-full mt-4">Continue Streak</Button>
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
                      <Button variant="outline" className="w-full">
                        Manage Subscription
                      </Button>
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