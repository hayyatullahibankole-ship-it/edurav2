import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Bell,
  Activity,
  Database,
  Monitor,
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
  CheckCircle,
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
import { AkboyNewsletterSubscribersManager } from '@/components/admin/AkboyNewsletterSubscribersManager';
import MockExamManager from '@/components/admin/MockExamManager';
import MockResultsManager from '@/components/admin/MockResultsManager';
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
  const [activeMainTab, setActiveMainTab] = useState('edura');
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
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

  // Set default sub-tab when main tab changes
  useEffect(() => {
    const defaultSubTab = navGroups[activeMainTab as keyof typeof navGroups]?.[0]?.key || 'dashboard';
    if (activeSubTab !== defaultSubTab) {
      setActiveSubTab(defaultSubTab);
    }
  }, [activeMainTab]);

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

  const navGroups = {
    edura: [
      { key: 'dashboard', label: 'System Overview', icon: Monitor },
      { key: 'users', label: 'User Management', icon: Users },
      { key: 'exams', label: 'Exam Control', icon: BookOpen },
      { key: 'questions', label: 'Question Bank', icon: FileText },
      { key: 'subjects', label: 'Subject Management', icon: BookOpen },
      { key: 'resources', label: 'Resources', icon: Upload },
      { key: 'security', label: 'Security Center', icon: Lock },
      { key: 'analytics', label: 'Analytics Hub', icon: BarChart3 },
      { key: 'pricing', label: 'Pricing Management', icon: DollarSign },
      { key: 'promos', label: 'Promo Codes', icon: Gift },
      { key: 'schools', label: 'School Management', icon: Users },
      { key: 'communications', label: 'Communications', icon: MessageCircle },
      { key: 'study-hub', label: 'Study Hub', icon: GraduationCap },
      { key: 'forum', label: 'Forum', icon: MessageCircle },
      { key: 'challenges', label: 'Challenges', icon: Sword },
      { key: 'settings', label: 'System Config', icon: Settings },
    ],
    akboy: [
      { key: 'akboy-services', label: 'AKBOY Services', icon: Palette },
      { key: 'akboy-portfolio', label: 'AKBOY Portfolio', icon: Briefcase },
      { key: 'akboy-events', label: 'AKBOY Events', icon: CalendarDays },
      { key: 'akboy-inquiries', label: 'AKBOY Inquiries', icon: Mail },
      { key: 'akboy-newsletter', label: 'Newsletter Subscribers', icon: Mail },
      { key: 'akboy-tutorials', label: 'AKBOY Tutorials', icon: TutorialIcon },
      { key: 'akboy-registrations', label: 'AKBOY Registrations', icon: ClipboardList },
    ],
    mock: [
      { key: 'mock-exam', label: 'Mock Exam', icon: FileText },
      { key: 'mock-results', label: 'Mock Results', icon: GraduationCap },
      { key: 'mock-dashboard', label: 'Student Batches', icon: Users },
      { key: 'exam-verification', label: 'Verify Students', icon: CheckCircle },
    ],
    blog: [
      { key: 'blog', label: 'Blog Management', icon: Newspaper },
    ],
  };

  const handleNavClick = (mainTab: string, subTab: string) => {
    setActiveMainTab(mainTab);
    setActiveSubTab(subTab);
  };

  const renderTabContent = (section: string) => {
    switch (section) {
      case 'dashboard':
        return (
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
                            {activity.users?.first_name} {activity.users?.last_name} attempted {activity.exams?.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'users':
        return <UserManagement users={users} onRefresh={fetchAdminData} />;
      case 'exams':
        return <ExamControl />;
      case 'questions':
        return <QuestionManagement />;
      case 'subjects':
        return <SubjectManager />;
      case 'resources':
        return <ResourceManagement />;
      case 'security':
        return <SecurityCenter />;
      case 'analytics':
        return <AnalyticsHub />;
      case 'pricing':
        return <PricingManager />;
      case 'promos':
        return <CouponManager />;
      case 'schools':
        return <SchoolManagement />;
      case 'communications':
        return <CustomerCommunications />;
      case 'study-hub':
        return <StudyHubManager />;
      case 'forum':
        return <ForumManager />;
      case 'challenges':
        return <ChallengeManager />;
      case 'settings':
        return <SystemConfig />;
      case 'akboy-services':
        return <AkboyServicesManager />;
      case 'akboy-portfolio':
        return <AkboyPortfolioManager />;
      case 'akboy-events':
        return <AkboyEventsManager />;
      case 'akboy-inquiries':
        return <AkboyInquiriesManager />;
      case 'akboy-newsletter':
        return <AkboyNewsletterSubscribersManager />;
      case 'akboy-tutorials':
        return <AkboyTutorialsManager />;
      case 'akboy-registrations':
        return <AkboyRegistrationsManager />;
      case 'mock-exam':
        return <MockExamManager />;
      case 'mock-results':
        return <MockResultsManager />;
      case 'mock-dashboard':
        return <MockExamDashboard />;
      case 'exam-verification':
        return <ExamDayVerification />;
      case 'blog':
        return <BlogManager />;
      default:
        return <div className="text-white">Section not found</div>;
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Admin Portal Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Edura Control Center</h1>
                <p className="text-xs sm:text-sm text-slate-400">Administrator Portal</p>
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

      {/* Main Content with Tabs */}
      <div className="p-3 sm:p-4 md:p-6">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
          {/* Main Tab List */}
          <TabsList className="bg-slate-800 border-slate-700 w-full justify-start">
            <TabsTrigger value="edura" className="text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Edura CBT
            </TabsTrigger>
            <TabsTrigger value="akboy" className="text-sm font-medium data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              AKBOY
            </TabsTrigger>
            <TabsTrigger value="mock" className="text-sm font-medium data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Mock Exams
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-sm font-medium data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Blog
            </TabsTrigger>
          </TabsList>

          {/* Edura Tab Content */}
          <TabsContent value="edura" className="space-y-6">
            <Tabs value={activeSubTab} onValueChange={(value) => handleNavClick('edura', value)} className="space-y-6">
              <TabsList className="bg-slate-700 border-slate-600 w-full justify-start overflow-x-auto">
                {navGroups.edura.map(item => (
                  <TabsTrigger key={item.key} value={item.key} className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="space-y-6">
                {renderTabContent(activeSubTab)}
              </div>
            </Tabs>
          </TabsContent>

          {/* AKBOY Tab Content */}
          <TabsContent value="akboy" className="space-y-6">
            <Tabs value={activeSubTab} onValueChange={(value) => handleNavClick('akboy', value)} className="space-y-6">
              <TabsList className="bg-slate-700 border-slate-600 w-full justify-start overflow-x-auto">
                {navGroups.akboy.map(item => (
                  <TabsTrigger key={item.key} value={item.key} className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="space-y-6">
                {renderTabContent(activeSubTab)}
              </div>
            </Tabs>
          </TabsContent>

          {/* Mock Tab Content */}
          <TabsContent value="mock" className="space-y-6">
            <Tabs value={activeSubTab} onValueChange={(value) => handleNavClick('mock', value)} className="space-y-6">
              <TabsList className="bg-slate-700 border-slate-600 w-full justify-start overflow-x-auto">
                {navGroups.mock.map(item => (
                  <TabsTrigger key={item.key} value={item.key} className="text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="space-y-6">
                {renderTabContent(activeSubTab)}
              </div>
            </Tabs>
          </TabsContent>

          {/* Blog Tab Content */}
          <TabsContent value="blog" className="space-y-6">
            <Tabs value={activeSubTab} onValueChange={(value) => handleNavClick('blog', value)} className="space-y-6">
              <TabsList className="bg-slate-700 border-slate-600 w-full justify-start">
                {navGroups.blog.map(item => (
                  <TabsTrigger key={item.key} value={item.key} className="text-sm data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="space-y-6">
                {renderTabContent(activeSubTab)}
              </div>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
