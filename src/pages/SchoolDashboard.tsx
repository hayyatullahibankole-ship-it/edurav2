import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, BookOpen, TrendingUp, DollarSign, LayoutDashboard, Settings } from "lucide-react";
import SchoolStudentsManager from "@/components/school/SchoolStudentsManager";
import SchoolAvailableExams from "@/components/school/SchoolAvailableExams";
import SchoolReports from "@/components/school/SchoolReports";
import SchoolBilling from "@/components/school/SchoolBilling";
import SchoolSettings from "@/components/school/SchoolSettings";

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

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

      // Get user record
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user?.id)
        .maybeSingle();

      if (!userData) {
        toast.error("User not found");
        return;
      }

      // Get school record
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

      // Get active subscription (temporarily using any to bypass type issues)
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const remainingSlots = (subscriptionData?.student_seats || schoolData?.max_students || 0) - (schoolData?.students_added || 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{schoolData?.name}</h1>
              <p className="text-muted-foreground">School Code: {schoolData?.school_code}</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Logged out successfully");
                navigate("/school-login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* School Code Banner */}
        <Card className="mb-8 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">School Code (Share with Students)</h3>
                <p className="text-3xl font-bold text-primary">{schoolData?.school_code}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Students will use this code in their email: username@{schoolData?.school_code}.edu.ng
                </p>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(schoolData?.school_code || '');
                  toast.success('School code copied to clipboard!');
                }}
              >
                Copy Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students Allowed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptionData?.student_seats || schoolData?.max_students || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Added</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schoolData?.students_added || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Slots</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remainingSlots}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${subscriptionData?.status?.toUpperCase() === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
                {subscriptionData?.status || 'Inactive'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" disabled={!schoolData}>
              <Users className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="exams" disabled={!schoolData}>
              <BookOpen className="h-4 w-4 mr-2" />
              Available Exams
            </TabsTrigger>
            <TabsTrigger value="reports" disabled={!schoolData}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="billing" disabled={!schoolData}>
              <DollarSign className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!schoolData}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {!schoolData ? (
              <Card>
                <CardHeader>
                  <CardTitle>No school account found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Complete your school registration to get started.
                  </p>
                  <Button onClick={() => navigate('/school-registration')}>Finish Registration</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Your School Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Manage your students, monitor their performance, and access Edura's comprehensive CBT platform.
                  </p>
                  <div className="space-y-2">
                    <p><strong>School Code:</strong> {schoolData?.school_code}</p>
                    <p><strong>Email:</strong> {schoolData?.email}</p>
                    <p><strong>Phone:</strong> {schoolData?.phone}</p>
                    {subscriptionData && (
                      <p><strong>Subscription Expires:</strong> {new Date(subscriptionData.end_date).toLocaleDateString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="students">
            <SchoolStudentsManager 
              schoolId={schoolData?.id}
              schoolCode={schoolData?.school_code}
              remainingSlots={remainingSlots}
              onStudentsUpdate={fetchSchoolData}
            />
          </TabsContent>

          <TabsContent value="exams">
            <SchoolAvailableExams />
          </TabsContent>

          <TabsContent value="reports">
            <SchoolReports schoolId={schoolData?.id} />
          </TabsContent>

          <TabsContent value="billing">
            <SchoolBilling 
              schoolId={schoolData?.id}
              currentStudentLimit={schoolData?.student_limit}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SchoolSettings schoolData={schoolData} onUpdate={fetchSchoolData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}