import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Shield, Users, BookOpen, Settings, BarChart3, LogOut, FileText, DollarSign,
  Gift, Newspaper, MessageCircle, GraduationCap, Sword, Palette, Briefcase,
  CalendarDays, Mail, ClipboardList, CheckCircle, Lock, Upload, Search, Menu,
  Home, ChevronRight, Activity, AlertTriangle, School,
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
import StudyHubManager from '@/components/admin/StudyHubManager';
import ForumManager from '@/components/admin/ForumManager';
import SchoolManagement from '@/components/admin/SchoolManagement';
import ChallengeManager from '@/components/admin/ChallengeManager';
import { CouponManager } from '@/components/admin/CouponManager';
import { AkboyServicesManager } from '@/components/admin/AkboyServicesManager';
import { AkboyPortfolioManager } from '@/components/admin/AkboyPortfolioManager';
import { AkboyEventsManager } from '@/components/admin/AkboyEventsManager';
import EbooksManager from '@/components/admin/EbooksManager';
import { AkboyInquiriesManager } from '@/components/admin/AkboyInquiriesManager';
import { AkboyTutorialsManager } from '@/components/admin/AkboyTutorialsManager';
import { AkboyRegistrationsManager } from '@/components/admin/AkboyRegistrationsManager';
import { AkboyNewsletterSubscribersManager } from '@/components/admin/AkboyNewsletterSubscribersManager';
import ServiceCatalogManager from '@/components/admin/ServiceCatalogManager';
import MockExamManager from '@/components/admin/MockExamManager';
import MockResultsManager from '@/components/admin/MockResultsManager';
import SubjectManager from '@/components/admin/SubjectManager';
import { MockExamDashboard } from '@/components/admin/MockExamDashboard';
import { ExamDayVerification } from '@/components/admin/ExamDayVerification';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type NavItem = { key: string; label: string; icon: any };
type NavSection = { label: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: Home },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Edura CBT',
    items: [
      { key: 'users', label: 'Users', icon: Users },
      { key: 'schools', label: 'Schools', icon: School },
      { key: 'exams', label: 'Exams', icon: BookOpen },
      { key: 'questions', label: 'Question Bank', icon: FileText },
      { key: 'subjects', label: 'Subjects', icon: BookOpen },
      { key: 'resources', label: 'Resources', icon: Upload },
      { key: 'study-hub', label: 'Study Hub', icon: GraduationCap },
      { key: 'forum', label: 'Forum', icon: MessageCircle },
      { key: 'challenges', label: 'Challenges', icon: Sword },
    ],
  },
  {
    label: 'Mock Exams',
    items: [
      { key: 'mock-exam', label: 'Mock Exam', icon: FileText },
      { key: 'mock-results', label: 'Results', icon: GraduationCap },
      { key: 'mock-dashboard', label: 'Student Batches', icon: Users },
      { key: 'exam-verification', label: 'Verify Students', icon: CheckCircle },
    ],
  },
  {
    label: 'Akboy',
    items: [
      { key: 'akboy-services', label: 'Services', icon: Palette },
      { key: 'akboy-portfolio', label: 'Portfolio', icon: Briefcase },
      { key: 'akboy-events', label: 'Events', icon: CalendarDays },
      { key: 'akboy-ebooks', label: 'Ebooks', icon: BookOpen },
      { key: 'akboy-tutorials', label: 'Tutorials', icon: GraduationCap },
      { key: 'akboy-registrations', label: 'Registrations', icon: ClipboardList },
      { key: 'akboy-inquiries', label: 'Inquiries', icon: Mail },
      { key: 'akboy-newsletter', label: 'Subscribers', icon: Mail },
    ],
  },
  {
    label: 'Commerce & Content',
    items: [
      { key: 'edu-services', label: 'Educational Services', icon: Briefcase },
      { key: 'pricing', label: 'Pricing', icon: DollarSign },
      { key: 'promos', label: 'Promo Codes', icon: Gift },
      { key: 'blog', label: 'Blog', icon: Newspaper },
      { key: 'communications', label: 'Communications', icon: MessageCircle },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'security', label: 'Security', icon: Lock },
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminPortal() {
  const { user, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeExams: 0,
    totalAttempts: 0,
    suspiciousActivities: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) fetchAdminData();
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const [usersResp, examsResp, attemptsResp] = await Promise.all([
        supabase.rpc('get_users_masked'),
        supabase.from('exams').select('*'),
        supabase.from('attempts').select(`*, users(first_name, last_name, email), exams(title)`)
          .order('created_at', { ascending: false }).limit(8),
      ]);
      setStats({
        totalUsers: usersResp.data?.length || 0,
        activeExams: examsResp.data?.filter((e: any) => e.is_published).length || 0,
        totalAttempts: attemptsResp.data?.length || 0,
        suspiciousActivities: attemptsResp.data?.filter((a: any) => a.suspicious_activity_count > 0).length || 0,
      });
      setUsers(usersResp.data || []);
      setRecentActivities(attemptsResp.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({ title: 'Error', description: 'Failed to load admin data', variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate('/admin/login'); } catch (e) { console.error(e); }
  };

  const filteredNav = useMemo(() => {
    if (!search.trim()) return NAV;
    const q = search.toLowerCase();
    return NAV.map(s => ({ ...s, items: s.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(s => s.items.length);
  }, [search]);

  const activeMeta = useMemo(() => {
    for (const s of NAV) {
      const m = s.items.find(i => i.key === activeKey);
      if (m) return { section: s.label, item: m };
    }
    return { section: 'Overview', item: NAV[0].items[0] };
  }, [activeKey]);

  const renderContent = () => {
    switch (activeKey) {
      case 'dashboard': return <DashboardOverview stats={stats} activities={recentActivities} />;
      case 'users': return <UserManagement users={users} onRefresh={fetchAdminData} />;
      case 'exams': return <ExamControl />;
      case 'questions': return <QuestionManagement />;
      case 'subjects': return <SubjectManager />;
      case 'resources': return <ResourceManagement />;
      case 'security': return <SecurityCenter suspiciousActivities={recentActivities.filter((a: any) => a.suspicious_activity_count > 0)} />;
      case 'analytics': return <AnalyticsHub />;
      case 'edu-services': return <ServiceCatalogManager />;
      case 'pricing': return <PricingManager />;
      case 'promos': return <CouponManager />;
      case 'schools': return <SchoolManagement />;
      case 'communications': return <CustomerCommunications users={users} />;
      case 'study-hub': return <StudyHubManager />;
      case 'forum': return <ForumManager />;
      case 'challenges': return <ChallengeManager />;
      case 'settings': return <SystemConfig />;
      case 'akboy-services': return <AkboyServicesManager />;
      case 'akboy-portfolio': return <AkboyPortfolioManager />;
      case 'akboy-events': return <AkboyEventsManager />;
      case 'akboy-ebooks': return <EbooksManager />;
      case 'akboy-inquiries': return <AkboyInquiriesManager />;
      case 'akboy-newsletter': return <AkboyNewsletterSubscribersManager />;
      case 'akboy-tutorials': return <AkboyTutorialsManager />;
      case 'akboy-registrations': return <AkboyRegistrationsManager />;
      case 'mock-exam': return <MockExamManager />;
      case 'mock-results': return <MockResultsManager />;
      case 'mock-dashboard': return <MockExamDashboard />;
      case 'exam-verification': return <ExamDayVerification />;
      case 'blog': return <BlogManager />;
      default: return null;
    }
  };

  if (!isAdmin) return null;

  const SidebarBody = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-white grid place-items-center">
          <Shield className="w-4 h-4 text-slate-950" />
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-tight">Edura Admin</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Control Center</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-9 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-600 text-sm focus-visible:ring-slate-700"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {filteredNav.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveKey(item.key); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                      active
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 grid place-items-center text-xs font-bold text-white">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-500">Administrator</p>
          </div>
          <Button
            onClick={handleSignOut}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 sticky top-0 h-screen">
        <SidebarBody />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-0 bg-slate-950">
          <SidebarBody />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <div className="flex items-center gap-1.5 text-sm min-w-0">
                <span className="text-slate-500 hidden sm:inline">{activeMeta.section}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                <span className="font-semibold text-slate-900 truncate">{activeMeta.item.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Online
              </Badge>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

/* ====================== Dashboard Overview (clean, no gradients) ====================== */
function DashboardOverview({ stats, activities }: { stats: any; activities: any[] }) {
  const metrics = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, accent: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Exams', value: stats.activeExams, icon: BookOpen, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Attempts (recent)', value: stats.totalAttempts, icon: Activity, accent: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Security Alerts', value: stats.suspiciousActivities, icon: AlertTriangle, accent: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">A quick look at your platform health.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border-slate-200 shadow-none hover:border-slate-300 transition-colors">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</p>
                  <div className={`w-8 h-8 rounded-md ${m.bg} grid place-items-center`}>
                    <Icon className={`w-4 h-4 ${m.accent}`} />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">{m.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-xs text-slate-500">Latest exam attempts across the platform</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">No recent activity</div>
            )}
            {activities.map((a: any) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center text-xs font-semibold text-slate-700 shrink-0">
                    {a.users?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-900 truncate">
                      <span className="font-medium">{a.users?.first_name} {a.users?.last_name}</span>
                      <span className="text-slate-500"> attempted </span>
                      <span className="font-medium">{a.exams?.title || 'Exam'}</span>
                    </p>
                    <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {a.suspicious_activity_count > 0 && (
                  <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 text-[10px]">
                    Flagged
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
