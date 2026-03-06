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
  Gift,
  Newspaper,
  MessageCircle,
  GraduationCap,
  Sword,
  Palette,
  Briefcase,
  CalendarDays,
  Mail,
  GraduationCap as TutorialIcon,
  ClipboardList,
  CheckCircle
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
import WelcomeEmailSender from '@/components/admin/WelcomeEmailSender';
import StudyHubManager from '@/components/admin/StudyHubManager';
import ForumManager from '@/components/admin/ForumManager';
import SchoolManagement from '@/components/admin/SchoolManagement';
import ChallengeManager from '@/components/admin/ChallengeManager';
import { CouponManager } from '@/components/admin/CouponManager';
import { AkboyServicesManager } from '@/components/admin/AkboyServicesManager';
import { AkboyPortfolioManager } from '@/components/admin/AkboyPortfolioManager';
import { AkboyEventsManager } from '@/components/admin/AkboyEventsManager';
import { AkboyInquiriesManager } from '@/components/admin/AkboyInquiriesManager';
import { AkboyTutorialsManager } from '@/components/admin/AkboyTutorialsManager';
import { AkboyRegistrationsManager } from '@/components/admin/AkboyRegistrationsManager';
import MockExamManager from '@/components/admin/MockExamManager';
import SubjectManager from '@/components/admin/SubjectManager';
import { MockExamDashboard } from '@/components/admin/MockExamDashboard';
import { ExamDayVerification } from '@/components/admin/ExamDayVerification';
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
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

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
        <div className="min-h-screen lg:w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          <div className="p-2">
            <nav className="flex flex-wrap lg:flex-col gap-2">
              <Button
                variant={activeSection === 'dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('dashboard')}
              >
                <Monitor className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">System Overview</span>
                <span className="sm:hidden">Overview</span>
              </Button>
              <Button
                variant={activeSection === 'users' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('users')}
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">User Management</span>
                <span className="sm:hidden">Users</span>
              </Button>
              <Button
                variant={activeSection === 'exams' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('exams')}
              >
                <BookOpen className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Exam Control</span>
                <span className="sm:hidden">Exams</span>
              </Button>
              <Button
                variant={activeSection === 'questions' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('questions')}
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Question Bank</span>
                <span className="sm:hidden">Questions</span>
              </Button>
              <Button
                variant={activeSection === 'subjects' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('subjects')}
              >
                <BookOpen className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Subject Management</span>
                <span className="sm:hidden">Subjects</span>
              </Button>
              <Button
                variant={activeSection === 'resources' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('resources')}
              >
                <Upload className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Resources</span>
                <span className="sm:hidden">Resources</span>
              </Button>
              <Button
                variant={activeSection === 'security' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('security')}
              >
                <Lock className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Security Center</span>
                <span className="sm:hidden">Security</span>
              </Button>
              <Button
                variant={activeSection === 'analytics' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Analytics Hub</span>
                <span className="sm:hidden">Analytics</span>
              </Button>
              <Button
                variant={activeSection === 'pricing' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('pricing')}
              >
                <DollarSign className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Pricing Management</span>
                <span className="sm:hidden">Pricing</span>
              </Button>
              <Button
                variant={activeSection === 'promos' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('promos')}
              >
                <Gift className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Promo Codes</span>
                <span className="sm:hidden">Promos</span>
              </Button>
              <Button
                variant={activeSection === 'schools' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('schools')}
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">School Management</span>
                <span className="sm:hidden">Schools</span>
              </Button>
              <Button
                variant={activeSection === 'blog' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('blog')}
              >
                <Newspaper className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Blog Management</span>
                <span className="sm:hidden">Blog</span>
              </Button>
              <Button
                variant={activeSection === 'communications' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('communications')}
              >
                <MessageCircle className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Communications</span>
                <span className="sm:hidden">Messages</span>
              </Button>
              <Button
                variant={activeSection === 'study-hub' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('study-hub')}
              >
                <GraduationCap className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Study Hub</span>
                <span className="sm:hidden">Study</span>
              </Button>
              <Button
                variant={activeSection === 'forum' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('forum')}
              >
                <MessageCircle className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Forum</span>
                <span className="sm:hidden">Forum</span>
              </Button>
              <Button
                variant={activeSection === 'challenges' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('challenges')}
              >
                <Sword className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Challenges</span>
                <span className="sm:hidden">Arena</span>
              </Button>
              <Button
                variant={activeSection === 'akboy-services' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('akboy-services')}
              >
                <Palette className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">AKBOY Services</span>
                <span className="sm:hidden">Services</span>
              </Button>
              <Button
                variant={activeSection === 'akboy-portfolio' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('akboy-portfolio')}
              >
                <Briefcase className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">AKBOY Portfolio</span>
                <span className="sm:hidden">Portfolio</span>
              </Button>
              <Button
                variant={activeSection === 'akboy-events' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('akboy-events')}
              >
                <CalendarDays className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">AKBOY Events</span>
                <span className="sm:hidden">Events</span>
              </Button>
              <Button
                variant={activeSection === 'akboy-inquiries' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('akboy-inquiries')}
              >
                <Mail className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">AKBOY Inquiries</span>
                <span className="sm:hidden">Inquiries</span>
              </Button>
              <Button
                variant={activeSection === 'akboy-tutorials' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('akboy-tutorials')}
              >
                <TutorialIcon className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">AKBOY Tutorials</span>
                <span className="sm:hidden">Tutorials</span>
              </Button>
              <Button
                variant={activeSection === 'akboy-registrations' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('akboy-registrations')}
              >
                <ClipboardList className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">AKBOY Registrations</span>
                <span className="sm:hidden">Registrations</span>
              </Button>
              <Button
                variant={activeSection === 'mock-exam' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('mock-exam')}
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Mock Exam</span>
                <span className="sm:hidden">Mock</span>
              </Button>
              <Button
                variant={activeSection === 'mock-dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('mock-dashboard')}
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Student Batches</span>
                <span className="sm:hidden">Batches</span>
              </Button>
              <Button
                variant={activeSection === 'exam-verification' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('exam-verification')}
              >
                <CheckCircle className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Verify Students</span>
                <span className="sm:hidden">Verify</span>
              </Button>
              <Button
                variant={activeSection === 'mock-dashboard' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('mock-dashboard')}
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Student Batches</span>
                <span className="sm:hidden">Batches</span>
              </Button>
              <Button
                variant={activeSection === 'exam-verification' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setActiveSection('exam-verification')}
              >
                <CheckCircle className="w-4 h-4 mr-2 lg:mr-3" />
                <span className="hidden sm:inline">Verify Students</span>
                <span className="sm:hidden">Verify</span>
              </Button>
              <Button
                variant={activeSection === 'settings' ? 'secondary' : 'ghost'}
                className="w-full justify-start text-left text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-slate-800"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
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
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400">Active Exams</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400">{stats.activeExams}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400">Total Attempts</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-400">{stats.totalAttempts}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-400">Security Alerts</p>
                        <p className="text-2xl sm:text-3xl font-bold text-red-400">{stats.suspiciousActivities}</p>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
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
          {activeSection === 'subjects' && <SubjectManager />}
          
          {activeSection === 'security' && <SecurityCenter suspiciousActivities={recentActivities} />}

          {activeSection === 'analytics' && <AnalyticsHub />}

          {activeSection === 'pricing' && <PricingManager />}
          {activeSection === 'promos' && <CouponManager />}
          {activeSection === 'schools' && <SchoolManagement />}
          {activeSection === 'blog' && <BlogManager />}

          {activeSection === 'communications' && (
            <div className="space-y-6">
              <WelcomeEmailSender />
              <CustomerCommunications users={users} />
            </div>
          )}

          {activeSection === 'study-hub' && <StudyHubManager />}

          {activeSection === 'forum' && <ForumManager />}

          {activeSection === 'challenges' && <ChallengeManager />}

          {activeSection === 'settings' && <SystemConfig />}

          {activeSection === 'akboy-services' && <AkboyServicesManager />}
          {activeSection === 'akboy-portfolio' && <AkboyPortfolioManager />}
          {activeSection === 'akboy-events' && <AkboyEventsManager />}
          {activeSection === 'akboy-inquiries' && <AkboyInquiriesManager />}
          {activeSection === 'akboy-tutorials' && <AkboyTutorialsManager />}
          {activeSection === 'akboy-registrations' && <AkboyRegistrationsManager />}

          {activeSection === 'mock-exam' && <MockExamManager />}
          {activeSection === 'mock-dashboard' && <MockExamDashboard />}
          {activeSection === 'exam-verification' && <ExamDayVerification />}

          {!['dashboard', 'users', 'exams', 'questions', 'resources', 'subjects', 'security', 'analytics', 'pricing', 'promos', 'blog', 'communications', 'study-hub', 'forum', 'challenges', 'settings', 'akboy-services', 'akboy-portfolio', 'akboy-events', 'akboy-inquiries', 'akboy-tutorials', 'akboy-registrations', 'schools', 'mock-exam', 'mock-dashboard', 'exam-verification'].includes(activeSection) && (
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
