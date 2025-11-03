import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Users, BookOpen, TrendingUp, DollarSign, LayoutDashboard, Settings, 
  LogOut, Copy, Building2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SchoolStudentsManager from "@/components/school/SchoolStudentsManager";
import SchoolReports from "@/components/school/SchoolReports";
import SchoolBilling from "@/components/school/SchoolBilling";
import SchoolSettings from "@/components/school/SchoolSettings";
import SchoolOverviewCharts from "@/components/school/SchoolOverviewCharts";
import RealtimeActivityFeed from "@/components/school/RealtimeActivityFeed";
import PerformanceTrends from "@/components/school/PerformanceTrends";
import StudentEngagement from "@/components/school/StudentEngagement";
import QuickActions from "@/components/school/QuickActions";
import TopPerformers from "@/components/school/TopPerformers";
import ComparisonAnalytics from "@/components/school/ComparisonAnalytics";
import AlertsCenter from "@/components/school/AlertsCenter";
import ExportTools from "@/components/school/ExportTools";

const menuItems = [
  { id: "overview", title: "Overview", icon: LayoutDashboard },
  { id: "students", title: "Students", icon: Users },
  { id: "reports", title: "Reports", icon: TrendingUp },
  { id: "billing", title: "Billing", icon: DollarSign },
  { id: "settings", title: "Settings", icon: Settings },
];

function SchoolSidebar({ activeTab, setActiveTab, schoolData }: any) {
  return (
    <Sidebar className="border-r bg-card">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base truncate">{schoolData?.name}</h2>
            <p className="text-xs text-muted-foreground truncate">{schoolData?.school_code}</p>
          </div>
        </div>
      </div>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const remainingSlots = (subscriptionData?.student_seats || schoolData?.max_students || 0) - (schoolData?.students_added || 0);
  const isSubscriptionActive = subscriptionData?.status?.toUpperCase() === 'ACTIVE';

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen w-full flex">
        <SchoolSidebar activeTab={activeTab} setActiveTab={setActiveTab} schoolData={schoolData} />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="h-16 border-b bg-background sticky top-0 z-40">
            <div className="h-full px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-lg font-semibold">
                  {menuItems.find(item => item.id === activeTab)?.title}
                </h1>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  toast.success("Logged out successfully");
                  navigate("/school-login");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30">
            <div className="container max-w-7xl mx-auto p-8">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* School Code Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>School Code</CardTitle>
                          <CardDescription className="mt-1">
                            Share this code with students for registration
                          </CardDescription>
                        </div>
                        <div className={`px-3 py-1 rounded-md text-xs font-medium ${
                          isSubscriptionActive 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isSubscriptionActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-4 bg-muted rounded-lg">
                          <p className="text-2xl font-mono font-bold tracking-wider">
                            {schoolData?.school_code}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(schoolData?.school_code || '');
                            toast.success('School code copied to clipboard');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Grid */}
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Total Seats</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tracking-tight break-words">
                          {subscriptionData?.student_seats || schoolData?.max_students || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Maximum capacity
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Students Added</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tracking-tight break-words">
                          {schoolData?.students_added || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Currently enrolled
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Available Slots</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tracking-tight break-words">
                          {remainingSlots}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Remaining capacity
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardDescription>Subscription Status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tracking-tight capitalize break-words">
                          {subscriptionData?.status || 'Inactive'}
                        </div>
                        {subscriptionData?.end_date && (
                          <p className="text-xs text-muted-foreground mt-2 break-words">
                            Until {new Date(subscriptionData.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alerts Center - Full Width */}
                  <AlertsCenter 
                    schoolId={schoolData?.id}
                    subscriptionData={subscriptionData}
                    schoolData={schoolData}
                  />

                  {/* Quick Actions + Engagement */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <QuickActions 
                      onAddStudent={() => setActiveTab("students")}
                      schoolId={schoolData?.id}
                    />
                    <StudentEngagement schoolId={schoolData?.id} />
                  </div>

                  {/* Performance Trends + Comparison Analytics */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <PerformanceTrends schoolId={schoolData?.id} />
                    <ComparisonAnalytics schoolId={schoolData?.id} />
                  </div>

                  {/* Charts + Activity/Leaderboard */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-6">
                      {schoolData?.id && <SchoolOverviewCharts schoolId={schoolData.id} />}
                    </div>
                    <div className="space-y-6">
                      <TopPerformers schoolId={schoolData?.id} />
                      <RealtimeActivityFeed schoolId={schoolData?.id} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "students" && schoolData && (
                <SchoolStudentsManager 
                  schoolId={schoolData.id}
                  schoolCode={schoolData.school_code}
                  remainingSlots={remainingSlots}
                  onStudentsUpdate={fetchSchoolData}
                />
              )}
              
              {activeTab === "reports" && schoolData && (
                <div className="space-y-6">
                  <ExportTools 
                    schoolId={schoolData.id}
                    schoolName={schoolData.name}
                  />
                  <SchoolReports schoolId={schoolData.id} />
                </div>
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
