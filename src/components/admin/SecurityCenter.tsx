import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  Ban,
  Activity,
  RefreshCw,
  Loader2,
  UserCheck,
  ScrollText,
  Search,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityCenterProps {
  suspiciousActivities?: any[];
}

type FlaggedAttempt = {
  id: string;
  user_id: string | null;
  suspicious_activity_count: number | null;
  status: string | null;
  created_at: string;
  users?: { id: string; first_name: string | null; last_name: string | null; email: string | null } | null;
  exams?: { title: string | null } | null;
};

type SuspendedUser = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string | null;
};

type AuditRow = {
  id: string;
  action_type: string;
  actor_user_id: string | null;
  target_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
};

const fullName = (u?: { first_name?: string | null; last_name?: string | null } | null) =>
  [u?.first_name, u?.last_name].filter(Boolean).join(' ') || 'Unknown user';

const threatOf = (count: number) => {
  if (count >= 10) return { label: 'High', cls: 'bg-red-50 text-red-700 border-red-200' };
  if (count >= 5) return { label: 'Medium', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { label: 'Low', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
};

export default function SecurityCenter(_props: SecurityCenterProps) {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<FlaggedAttempt[]>([]);
  const [suspended, setSuspended] = useState<SuspendedUser[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [attemptsRes, suspendedRes, auditRes] = await Promise.all([
      supabase
        .from('attempts')
        .select('id, user_id, suspicious_activity_count, status, created_at, users(id, first_name, last_name, email), exams(title)')
        .gt('suspicious_activity_count', 0)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('users')
        .select('id, first_name, last_name, email, created_at')
        .eq('is_suspended', true)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('audit_logs')
        .select('id, action_type, actor_user_id, target_id, details, ip_address, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (attemptsRes.error) console.error('flagged attempts', attemptsRes.error);
    if (suspendedRes.error) console.error('suspended users', suspendedRes.error);
    if (auditRes.error) console.error('audit logs', auditRes.error);

    if (attemptsRes.error && suspendedRes.error && auditRes.error) {
      toast.error('Could not load security data');
    }

    setFlagged((attemptsRes.data as any) || []);
    setSuspended((suspendedRes.data as any) || []);
    setAudit((auditRes.data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setSuspension = async (userId: string | null | undefined, suspend: boolean) => {
    if (!userId) {
      toast.error('No user linked to this record');
      return;
    }
    setWorking(userId);
    const { error } = await supabase.from('users').update({ is_suspended: suspend }).eq('id', userId);
    setWorking(null);

    if (error) {
      console.error('suspension failed', error);
      toast.error(suspend ? 'Could not suspend user' : 'Could not restore user');
      return;
    }

    try {
      await supabase.rpc('log_admin_action', {
        action_type: suspend ? 'USER_SUSPENDED' : 'USER_RESTORED',
        admin_id: null,
        target_id: userId,
      });
    } catch (e) {
      console.warn('audit log failed', e);
    }

    toast.success(suspend ? 'User suspended' : 'User restored');
    load();
  };

  const filteredSuspended = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return suspended;
    return suspended.filter(
      (u) => fullName(u).toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    );
  }, [suspended, search]);

  const highRisk = flagged.filter((f) => (f.suspicious_activity_count || 0) >= 5).length;

  const stats = [
    { label: 'Flagged attempts', value: flagged.length, icon: AlertTriangle },
    { label: 'High risk', value: highRisk, icon: Shield },
    { label: 'Suspended users', value: suspended.length, icon: Ban },
    { label: 'Audit events (7d)', value: audit.length, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Security</h2>
          <p className="text-sm text-slate-500">Flagged exam activity, suspended accounts and the admin audit trail.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '—' : s.value}</p>
                </div>
                <s.icon className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="flagged">Flagged activity</TabsTrigger>
          <TabsTrigger value="suspended">Suspended users</TabsTrigger>
          <TabsTrigger value="audit">Audit log</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">Exam sessions with suspicious activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <p className="py-6 text-center text-sm text-slate-500">Loading…</p>}
              {!loading && flagged.length === 0 && (
                <div className="py-10 text-center">
                  <Shield className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No flagged activity</p>
                </div>
              )}
              {flagged.map((a) => {
                const threat = threatOf(a.suspicious_activity_count || 0);
                return (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">{fullName(a.users)}</p>
                        <Badge variant="outline" className={threat.cls}>{threat.label} risk</Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {a.users?.email || 'no email'} • {a.exams?.title || 'Exam'} • {a.suspicious_activity_count} violations
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      disabled={working === a.users?.id || !a.users?.id}
                      onClick={() => setSuspension(a.users?.id, true)}
                    >
                      {working === a.users?.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="mr-2 h-4 w-4" />
                      )}
                      Suspend
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspended">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">Suspended accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="h-9 pl-8"
                />
              </div>

              {loading && <p className="py-6 text-center text-sm text-slate-500">Loading…</p>}
              {!loading && filteredSuspended.length === 0 && (
                <div className="py-10 text-center">
                  <UserCheck className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No suspended users</p>
                </div>
              )}

              {filteredSuspended.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{fullName(u)}</p>
                    <p className="truncate text-xs text-slate-500">{u.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={working === u.id}
                    onClick={() => setSuspension(u.id, false)}
                  >
                    {working === u.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserCheck className="mr-2 h-4 w-4" />
                    )}
                    Restore access
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-900">Admin audit trail (last 7 days)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <p className="py-6 text-center text-sm text-slate-500">Loading…</p>}
              {!loading && audit.length === 0 && (
                <div className="py-10 text-center">
                  <ScrollText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No audit events recorded</p>
                </div>
              )}
              {audit.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                      {log.action_type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                    {log.ip_address && <span className="text-xs text-slate-400">IP {log.ip_address}</span>}
                  </div>
                  {log.target_id && (
                    <p className="mt-1 break-all text-xs text-slate-500">Target: {log.target_id}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
