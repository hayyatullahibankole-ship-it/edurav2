import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  LogOut,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Bell,
  Activity,
  Lock,
  Database,
  Monitor,
  Zap,
  FileText,
  DollarSign,
  Newspaper,
  MessageCircle
} from 'lucide-react';
import UserManagement from '@/components/admin/UserManagement';
import ExamControl from '@/components/admin/ExamControl';
import QuestionManagement from '@/components/admin/QuestionManagement';
import ResourceManagement from '@/components/admin/ResourceManagement';
import SecurityCenter from '@/components/admin/SecurityCenter';
import AnalyticsHub from '@/components/admin/AnalyticsHub';
import SystemConfig from '@/components/admin/SystemConfig';
import PricingManager from '@/components/admin/PricingManager';
import BlogManager from '@/components/admin/BlogManager';
import CustomerCommunications from '@/components/admin/CustomerCommunications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminPortal() {
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeExams: 0,
    totalAttempts: 0,
    suspiciousActivities: 0,
    systemHealth: 'optimal'
  });

  const [users, setUsers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

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
      
      const [usersResp, examsResp, attemptsResp] = await Promise.all([
        supabase.rpc('get_users_masked'),
        supabase.from('exams').select('*'),
        supabase.from('attempts').select(`
          *,
          users(first_name, last_name, email),
          exams(title)
        `).order('created_at', { ascending: false }).limit(5)
      ]);

      setStats({
        totalUsers: usersResp.data?.length || 0,
        activeExams: examsResp.data?.filter(e => e.is_published).length || 0,
        totalAttempts: attemptsResp.data?.length || 0,
        suspiciousActivities: attemptsResp.data?.filter(a => a.suspicious_activity_count > 0).length || 0,
        systemHealth: 'optimal'
      });

      setUsers(usersResp.data || []);
      setRecentActivities(attemptsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAllQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_delete_all_questions');
      if (error) throw error;
      const result = data as { questions_deleted: number; attempt_answers_deleted: number };
      toast({ 
        title: 'Success', 
        description: `Deleted ${result.questions_deleted} questions and ${result.attempt_answers_deleted} related answers.` 
      });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Delete failed', description: e.message || 'Unable to delete', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Admin Portal Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Edura Control Center</h1>
                  <p className="text-xs sm:text-sm text-slate-400">Administrator Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                  <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs">
                    System Administrator
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-slate-300 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 bg-slate-900 border-r border-slate-800 lg:min-h-screen">
          <div className="p-4">
            <nav className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-2 lg:grid-cols-none">
              <Button
                variant={activeSection === 'dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('dashboard')}
              >
                <Monitor className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">System Overview</span>
                <span className="sm:hidden">Overview</span>
              </Button>
              <Button
                variant={activeSection === 'users' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('users')}
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </Button>
              <Button
                variant={activeSection === 'exams' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('exams')}
              >
                <BookOpen className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Exam Control</span>
                <span className="sm:hidden">Exams</span>
              </Button>
              <Button
                variant={activeSection === 'questions' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('questions')}
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Question Bank</span>
                <span className="sm:hidden">Questions</span>
              </Button>
              <Button
                variant={activeSection === 'resources' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('resources')}
              >
                <Upload className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Resources</span>
                <span className="sm:hidden">Resources</span>
              </Button>
              <Button
                variant={activeSection === 'security' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('security')}
              >
                <Lock className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Security Center</span>
                <span className="sm:hidden">Security</span>
              </Button>
              <Button
                variant={activeSection === 'analytics' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Analytics Hub</span>
                <span className="sm:hidden">Analytics</span>
              </Button>
              <Button
                variant={activeSection === 'pricing' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('pricing')}
              >
                <DollarSign className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Pricing Management</span>
                <span className="sm:hidden">Pricing</span>
              </Button>
              <Button
                variant={activeSection === 'blog' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('blog')}
              >
                <Newspaper className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Blog Management</span>
                <span className="sm:hidden">Blog</span>
              </Button>
              <Button
                variant={activeSection === 'communications' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm"
                onClick={() => setActiveSection('communications')}
              >
                <MessageCircle className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Communications</span>
                <span className="sm:hidden">Messages</span>
              </Button>
              <Button
                variant={activeSection === 'settings' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm col-span-2 lg:col-span-1"
                onClick={() => setActiveSection('settings')}
              >
                <Settings className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">System Config</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 lg:p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">System Overview</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400">System Online</span>
                </div>
              </div>

              {/* System Health Alert */}
              {stats.suspiciousActivities > 0 && (
                <Alert className="bg-red-950 border-red-800 text-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription>
                    {stats.suspiciousActivities} suspicious activities detected. 
                    <Button variant="link" className="p-0 h-auto ml-2 text-red-300">
                      Investigate →
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* System Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400">Total Users</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-400">{stats.totalUsers}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Active Exams</p>
                        <p className="text-3xl font-bold text-green-400">{stats.activeExams}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Total Attempts</p>
                        <p className="text-3xl font-bold text-purple-400">{stats.totalAttempts}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Security Alerts</p>
                        <p className="text-3xl font-bold text-red-400">{stats.suspiciousActivities}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activities */}
              <div className="grid grid-cols-1 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent System Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivities.map((activity: any) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              {activity.users?.first_name} {activity.users?.last_name} started exam
                            </p>
                            <p className="text-xs text-slate-400">{activity.exams?.title}</p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(activity.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Health Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Database Connection</span>
                        <Badge className="bg-green-600 text-white">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Authentication Service</span>
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Anti-Cheat System</span>
                        <Badge className="bg-green-600 text-white">Monitoring</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Backup Status</span>
                        <Badge className="bg-yellow-600 text-white">Scheduled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'users' && <UserManagement users={users} onRefresh={fetchAdminData} />}
          
          {activeSection === 'exams' && <ExamControl />}
          
          {activeSection === 'questions' && (
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-sm text-slate-300">Permanently delete all questions from the database.</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Database className="w-4 h-4 mr-2" />
                        Delete All Questions
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm delete all</AlertDialogTitle>
                        <AlertDialogDesc>
                          This action cannot be undone. All questions will be permanently deleted.
                        </AlertDialogDesc>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllQuestions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
              <QuestionManagement />
            </div>
          )}
          
          {activeSection === 'resources' && <ResourceManagement />}
          
          {activeSection === 'security' && <SecurityCenter suspiciousActivities={recentActivities} />}
          
          {activeSection === 'analytics' && <AnalyticsHub />}
          
          {activeSection === 'pricing' && <PricingManager />}
          
          {activeSection === 'blog' && <BlogManager />}
          
          {activeSection === 'communications' && <CustomerCommunications users={users} />}
          
          {activeSection === 'settings' && <SystemConfig />}

          {/* Other sections can be implemented similarly */}
          {!['dashboard', 'users', 'exams', 'questions', 'resources', 'security', 'analytics', 'pricing', 'blog', 'communications', 'settings'].includes(activeSection) && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Zap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Panel
                </h3>
                <p className="text-slate-500">This section is under development</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
