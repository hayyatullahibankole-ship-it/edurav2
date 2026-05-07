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
      { key: 'akboy-tutorials', label: 'Tutorials', icon: GraduationCap },
      { key: 'akboy-registrations', label: 'Registrations', icon: ClipboardList },
      { key: 'akboy-inquiries', label: 'Inquiries', icon: Mail },
      { key: 'akboy-newsletter', label: 'Subscribers', icon: Mail },
    ],
  },
  {
    label: 'Commerce & Content',
    items: [
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
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-slate-200 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-slate-900 grid place-items-center">
          <Shield className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 tracking-tight leading-tight">Edura</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin Portal</p>
        </div>
        <kbd className="hidden lg:inline-flex h-5 px-1.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200 items-center">⌘K</kbd>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="pl-8 h-8 bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 text-[13px] focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:border-slate-300"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {filteredNav.map((section) => (
          <div key={section.label} className="mb-3">
            <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {section.label}
            </p>
            <div className="space-y-px">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveKey(item.key); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-all relative ${
                      active
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 p-2.5">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-slate-50">
          <div className="w-8 h-8 rounded-full bg-slate-900 grid place-items-center text-xs font-semibold text-white shrink-0">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-emerald-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-emerald-500 rounded-full"/> Online
            </p>
          </div>
          <Button onClick={handleSignOut} size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-rose-600">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex w-60 shrink-0 sticky top-0 h-screen">
        <SidebarBody />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-0 bg-white">
          <SidebarBody />
        </SheetContent>
      </Sheet>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
              <div className="flex items-center gap-1.5 text-[13px] min-w-0">
                <Home className="w-3.5 h-3.5 text-slate-400"/>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-500 hidden sm:inline">{activeMeta.section}</span>
                <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:inline" />
                <span className="font-semibold text-slate-900 truncate">{activeMeta.item.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All systems operational
              </span>
              <Button variant="outline" size="sm" className="h-7 text-[11px] font-medium border-slate-200">
                <Activity className="w-3 h-3 mr-1"/> Live
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

/* ====================== Dashboard Overview ====================== */
function DashboardOverview({ stats, activities }: { stats: any; activities: any[] }) {
  const metrics = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, delta: '+12%', positive: true },
    { label: 'Active Exams', value: stats.activeExams, icon: BookOpen, delta: '+3', positive: true },
    { label: 'Recent Attempts', value: stats.totalAttempts, icon: Activity, delta: 'last 24h', positive: true },
    { label: 'Security Flags', value: stats.suspiciousActivities, icon: AlertTriangle, delta: stats.suspiciousActivities > 0 ? 'review' : 'clean', positive: stats.suspiciousActivities === 0 },
  ];

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold">{today}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mt-1">Welcome back, admin</h1>
          <p className="text-sm text-slate-500 mt-1">Here's what's happening across Edura, Akboy & Mock Exams.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200">Export</Button>
          <Button size="sm" className="h-8 text-xs bg-slate-900 hover:bg-slate-800">View reports</Button>
        </div>
      </div>

      {/* Metrics — flat with delta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${m.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {m.delta}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1">{m.label}</p>
              <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{m.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two column: activity + side panel */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-[11px] text-slate-500">Latest exam attempts</p>
            </div>
            <Badge variant="outline" className="text-[10px] h-5 border-slate-200 text-slate-600">{activities.length}</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {activities.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
                <p className="text-sm text-slate-500">No recent activity</p>
              </div>
            )}
            {activities.map((a: any) => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-900 grid place-items-center text-[10px] font-semibold text-white shrink-0">
                    {a.users?.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-slate-900 truncate">
                      <span className="font-medium">{a.users?.first_name} {a.users?.last_name}</span>
                      <span className="text-slate-500"> · </span>
                      <span className="text-slate-700">{a.exams?.title || 'Exam'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {a.suspicious_activity_count > 0 ? (
                  <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 text-[10px] h-5">Flagged</Badge>
                ) : (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-[10px] h-5">OK</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 text-white rounded-xl p-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">Health</div>
            <p className="text-2xl font-bold">All systems normal</p>
            <p className="text-xs text-slate-400 mt-1">Database, Edge functions & Auth responding within SLA.</p>
            <div className="mt-4 flex gap-1">
              {Array.from({length:24}).map((_,i)=>(
                <div key={i} className={`flex-1 h-6 rounded-sm ${i > 21 ? 'bg-emerald-500' : 'bg-emerald-500/40'}`} />
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">Uptime · 24h</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h4 className="text-[13px] font-semibold text-slate-900 mb-3">Quick actions</h4>
            <div className="space-y-1.5">
              {[
                { label: 'Add new admin', icon: Users },
                { label: 'Publish blog post', icon: Newspaper },
                { label: 'Create exam', icon: BookOpen },
                { label: 'Send announcement', icon: MessageCircle },
              ].map((q) => (
                <button key={q.label} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-slate-700 hover:bg-slate-50 transition-colors text-left">
                  <q.icon className="w-3.5 h-3.5 text-slate-400"/>
                  <span className="flex-1">{q.label}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300"/>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

