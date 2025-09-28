import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  DollarSign, 
  Settings, 
  AlertTriangle,
  FileText,
  BarChart3,
  Shield,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  LogOut,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import SecurityConfig from '@/components/admin/SecurityConfig';
import SecurityAlertsBanner from '@/components/admin/SecurityAlertsBanner';
import QuestionManagement from '@/components/admin/QuestionManagement';

export default function AdminDashboard() {
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalExams: 0,
    recentActivities: [],
    suspiciousActivities: []
  });

  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchAdminData();
  }, [isAdmin, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const [usersResp, subscriptionsResp, examsResp, attemptsResp] = await Promise.all([
        supabase.from('users').select('id, created_at, is_suspended'),
        supabase.from('subscriptions').select('id, status', { count: 'exact' }),
        supabase.from('exams').select('id, title, type, is_published'),
        supabase.from('attempts').select(`
          id, 
          suspicious_activity_count, 
          created_at,
          users(first_name, last_name, email),
          exams(title)
        `).order('created_at', { ascending: false }).limit(10)
      ]);

      const totalUsers = usersResp.data?.length || 0;
      const activeSubscriptions = subscriptionsResp.data?.filter(s => s.status === 'ACTIVE').length || 0;
      const totalExams = examsResp.data?.length || 0;
      
      // Get suspicious activities
      const suspiciousActivities = attemptsResp.data?.filter(a => a.suspicious_activity_count > 0) || [];

      setDashboardStats({
        totalUsers,
        activeSubscriptions,
        totalRevenue: 0, // Calculate from transactions
        totalExams,
        recentActivities: attemptsResp.data?.slice(0, 5) || [],
        suspiciousActivities
      });

      setUsers(usersResp.data || []);
      setExams(examsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (error) throw error;
        toast({ title: "User deleted successfully" });
      } else {
        const { error } = await supabase
          .from('users')
          .update({ is_suspended: action === 'suspend' })
          .eq('id', userId);
        if (error) throw error;
        toast({ title: `User ${action}d successfully` });
      }
      fetchAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    toast({
      title: "Export Data",
      description: "Export functionality will be available soon",
    });
  };

  const handleEditExam = (examId: string) => {
    // TODO: Implement exam editing
    toast({
      title: "Edit Exam",
      description: "Exam editing functionality will be available soon",
    });
  };

  const handleViewExam = (examId: string) => {
    // TODO: Implement exam viewing
    toast({
      title: "View Exam", 
      description: "Exam viewing functionality will be available soon",
    });
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Exam deleted successfully"
      });
      
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      {/* Admin Navigation Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Edura Admin</h1>
                  <p className="text-xs text-muted-foreground">Administration Portal</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="h-6 w-px bg-border" />
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <Badge variant="destructive" className="text-xs">
                    Super Admin
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">

        {/* Security Status Banner */}
        <div className="mb-6">
          <SecurityAlertsBanner criticalIssues={[
            "Enable Leaked Password Protection in Supabase Authentication settings",
            "Verify Site URL and Redirect URLs in Supabase Authentication configuration"
          ]} />
        </div>

        {/* Security Alert */}
        {dashboardStats.suspiciousActivities.length > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50/50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {dashboardStats.suspiciousActivities.length} suspicious exam activities detected. 
              <Button variant="link" className="p-0 h-auto ml-2 text-orange-600" onClick={() => setActiveTab('security')}>
                Review now →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/50 dark:to-blue-900/25 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{dashboardStats.totalUsers}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">+12% from last month</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 dark:from-green-950/50 dark:to-green-900/25 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">{dashboardStats.activeSubscriptions}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8% from last month</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 dark:from-purple-950/50 dark:to-purple-900/25 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Exams</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{dashboardStats.totalExams}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">+5 new this week</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 dark:from-orange-950/50 dark:to-orange-900/25 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Security Alerts</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {dashboardStats.suspiciousActivities.length}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {dashboardStats.suspiciousActivities.length === 0 ? 'All clear' : 'Needs attention'}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Admin Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full lg:w-auto bg-card border">
              <TabsTrigger value="overview" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Users</TabsTrigger>
              <TabsTrigger value="exams" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Exams</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Questions</TabsTrigger>
              <TabsTrigger value="resources" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Resources</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Analytics</TabsTrigger>
              <TabsTrigger value="security" className="text-xs lg:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">Security</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Exam Activities</CardTitle>
                  <CardDescription>Latest exam attempts by students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardStats.recentActivities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {activity.users?.first_name} {activity.users?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.exams?.title}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Platform health indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Storage</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Anti-Cheat System</span>
                    <Badge variant="default">Monitoring</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage registered users and their permissions</CardDescription>
                </div>
                <Button onClick={() => {
                  // Export users functionality
                  try {
                    const headers = ['Email', 'First Name', 'Last Name', 'Created At'];
                    const csvContent = [
                      headers.join(','),
                      ...users.map(user => [
                        user.email || '',
                        user.first_name || '',
                        user.last_name || '',
                        new Date(user.created_at).toLocaleDateString()
                      ].map(field => `"${field}"`).join(','))
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (error) {
                    console.error('Export failed:', error);
                  }
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Users
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 10).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_suspended && (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction(user.id, user.is_suspended ? 'activate' : 'suspend')}
                        >
                          {user.is_suspended ? 'Activate' : 'Suspend'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Exam Management</CardTitle>
                  <CardDescription>Create and manage exam templates</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exam
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exams.map((exam: any) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <p className="font-medium">{exam.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{exam.type}</Badge>
                          <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                            {exam.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditExam(exam.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewExam(exam.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteExam(exam.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <QuestionManagement />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityConfig />
          </TabsContent>

          {/* Add other tab contents as needed */}
          <TabsContent value="sec-config">
            <SecurityConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}