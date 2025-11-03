import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Users, BookOpen, TrendingUp, DollarSign, LayoutDashboard, Settings, 
  LogOut, Copy, CheckCircle2, XCircle, GraduationCap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SchoolStudentsManager from "@/components/school/SchoolStudentsManager";
import SchoolAvailableExams from "@/components/school/SchoolAvailableExams";
import SchoolReports from "@/components/school/SchoolReports";
import SchoolBilling from "@/components/school/SchoolBilling";
import SchoolSettings from "@/components/school/SchoolSettings";
import SchoolOverviewCharts from "@/components/school/SchoolOverviewCharts";

const menuItems = [
  { id: "overview", title: "Overview", icon: LayoutDashboard },
  { id: "students", title: "Students", icon: Users },
  { id: "exams", title: "Available Exams", icon: BookOpen },
  { id: "reports", title: "Reports", icon: TrendingUp },
  { id: "billing", title: "Billing", icon: DollarSign },
  { id: "settings", title: "Settings", icon: Settings },
];

function SchoolSidebar({ activeTab, setActiveTab, schoolData }: any) {
  return (
    <Sidebar className="border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{schoolData?.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{schoolData?.school_code}</p>
          </div>
        </div>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to continue");
      navigate("/auth");
      return;
    }

    fetchSchoolData();
  }, [user]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user?.id)
        .maybeSingle();

      if (!userData) {
        toast.error("User not found");
        return;
      }

      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("admin_user_id", userData.id)
        .maybeSingle();

      if (schoolError) throw schoolError;

      if (!school) {
        setSchoolData(null);
        setSubscriptionData(null);
        toast.error("No school account found. Please complete registration.");
        navigate("/school-registration");
        return;
      }

      if (!school.is_active) {
        toast.error("School account is not active. Please complete subscription.");
        navigate("/school-subscription");
        return;
      }

      setSchoolData(school);

      const { data: subscriptions } = await (supabase as any)
        .from("school_subscriptions")
        .select("*")
        .eq("school_id", school.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
      setSubscriptionData(subscription);

    } catch (error: any) {
      console.error("Error fetching school data:", error);
      toast.error("Failed to load school data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const remainingSlots = (subscriptionData?.student_seats || schoolData?.max_students || 0) - (schoolData?.students_added || 0);
  const isSubscriptionActive = subscriptionData?.status?.toUpperCase() === 'ACTIVE';

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-background via-background to-primary/5">
        <SchoolSidebar activeTab={activeTab} setActiveTab={setActiveTab} schoolData={schoolData} />
        
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="h-full px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {menuItems.find(item => item.id === activeTab)?.title}
                  </h1>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Logged out successfully");
                  navigate("/school-login");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
              {activeTab === "overview" && (
                <>
                  {/* School Code Banner */}
                  <Card className="border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">School Code</p>
                          <div className="flex items-center gap-3">
                            <p className="text-3xl font-bold text-primary">{schoolData?.school_code}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(schoolData?.school_code || '');
                                toast.success('Copied!');
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Share this code with students for registration
                          </p>
                        </div>
                        <Badge 
                          variant={isSubscriptionActive ? "default" : "secondary"}
                          className="h-fit"
                        >
                          {isSubscriptionActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active Subscription
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{subscriptionData?.student_seats || schoolData?.max_students || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Maximum capacity</p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students Added</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{schoolData?.students_added || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Active students</p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{remainingSlots}</div>
                        <p className="text-xs text-muted-foreground mt-1">Remaining capacity</p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                        <div className={`h-8 w-8 rounded-full ${isSubscriptionActive ? 'bg-green-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
                          <DollarSign className={`h-4 w-4 ${isSubscriptionActive ? 'text-green-500' : 'text-orange-500'}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${isSubscriptionActive ? 'text-green-600' : 'text-orange-600'}`}>
                          {subscriptionData?.status || 'Inactive'}
                        </div>
                        {subscriptionData?.end_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Until {new Date(subscriptionData.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* School Info Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>School Information</CardTitle>
                      <CardDescription>Manage your students and monitor their performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">School Name</p>
                          <p className="text-base font-medium">{schoolData?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="text-base font-medium">{schoolData?.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone</p>
                          <p className="text-base font-medium">{schoolData?.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">School Code</p>
                          <p className="text-base font-medium">{schoolData?.school_code}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Charts */}
                  {schoolData?.id && <SchoolOverviewCharts schoolId={schoolData.id} />}
                </>
              )}

              {activeTab === "students" && schoolData && (
                <SchoolStudentsManager 
                  schoolId={schoolData.id}
                  schoolCode={schoolData.school_code}
                  remainingSlots={remainingSlots}
                  onStudentsUpdate={fetchSchoolData}
                />
              )}

              {activeTab === "exams" && <SchoolAvailableExams />}
              
              {activeTab === "reports" && schoolData && (
                <SchoolReports schoolId={schoolData.id} />
              )}

              {activeTab === "billing" && schoolData && (
                <SchoolBilling 
                  schoolId={schoolData.id}
                  currentStudentLimit={schoolData.student_limit}
                />
              )}

              {activeTab === "settings" && schoolData && (
                <SchoolSettings schoolData={schoolData} onUpdate={fetchSchoolData} />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
