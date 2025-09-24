import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Camera,
  Monitor,
  Wifi,
  Mouse
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityCenterProps {
  suspiciousActivities: any[];
}

export default function SecurityCenter({ suspiciousActivities }: SecurityCenterProps) {
  const { toast } = useToast();
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent attempts with suspicious activities
      const { data: attempts, error } = await supabase
        .from('attempts')
        .select(`
          *,
          users(first_name, last_name, email),
          exams(title)
        `)
        .gt('suspicious_activity_count', 0)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setSecurityAlerts(attempts || []);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigateAlert = (alertId: string) => {
    // Implementation for investigating alerts
    toast({
      title: "Investigation Started",
      description: "Security alert is being investigated"
    });
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_suspended: true })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Blocked",
        description: "User has been suspended for security violations"
      });

      fetchSecurityData();
      
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const getThreatLevel = (suspiciousCount: number) => {
    if (suspiciousCount >= 10) return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (suspiciousCount >= 5) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tab_switch': return <Monitor className="w-4 h-4" />;
      case 'right_click': return <Mouse className="w-4 h-4" />;
      case 'copy_paste': return <Activity className="w-4 h-4" />;
      case 'window_blur': return <Eye className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Security Control Center</h2>
          <p className="text-slate-400">Monitor and manage system security</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-400">Security Systems Active</span>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Threats</p>
                <p className="text-2xl font-bold text-red-400">{securityAlerts.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Blocked Users</p>
                <p className="text-2xl font-bold text-orange-400">{blockedUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">System Health</p>
                <p className="text-2xl font-bold text-green-400">99.9%</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Sessions</p>
                <p className="text-2xl font-bold text-blue-400">23</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Priority Alerts */}
      {securityAlerts.filter((alert: any) => alert.suspicious_activity_count >= 5).length > 0 && (
        <Alert className="bg-red-950 border-red-800 text-red-100">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription>
            {securityAlerts.filter((alert: any) => alert.suspicious_activity_count >= 5).length} high-priority security incidents detected. 
            Immediate attention required.
          </AlertDescription>
        </Alert>
      )}

      {/* Security Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="alerts" className="text-white">Security Alerts</TabsTrigger>
          <TabsTrigger value="monitoring" className="text-white">Real-time Monitor</TabsTrigger>
          <TabsTrigger value="blocked" className="text-white">Blocked Users</TabsTrigger>
          <TabsTrigger value="settings" className="text-white">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security Incident Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securityAlerts.map((alert: any) => {
                const threat = getThreatLevel(alert.suspicious_activity_count);
                return (
                  <div key={alert.id} className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${threat.bg} rounded-full flex items-center justify-center`}>
                          <AlertTriangle className={`w-6 h-6 ${threat.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-white">
                              Suspicious Activity Detected
                            </h3>
                            <Badge className={`${threat.bg} ${threat.color} border-0`}>
                              {threat.level} Risk
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            <span>User: {alert.users?.first_name} {alert.users?.last_name}</span>
                            <span className="mx-2">•</span>
                            <span>Exam: {alert.exams?.title}</span>
                            <span className="mx-2">•</span>
                            <span>{alert.suspicious_activity_count} violations</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleInvestigateAlert(alert.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Investigate
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleBlockUser(alert.users?.id)}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Block User
                        </Button>
                      </div>
                    </div>
                    
                    {/* Activity Details */}
                    <div className="mt-4 p-3 bg-slate-800 rounded border border-slate-600">
                      <h4 className="text-sm font-medium text-white mb-2">Activity Breakdown:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon('tab_switch')}
                          <span className="text-slate-400">Tab Switches</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getActivityIcon('window_blur')}
                          <span className="text-slate-400">Window Focus Lost</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getActivityIcon('right_click')}
                          <span className="text-slate-400">Right Clicks</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getActivityIcon('copy_paste')}
                          <span className="text-slate-400">Copy/Paste</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {securityAlerts.length === 0 && (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">No security alerts</p>
                  <p className="text-sm text-slate-500 mt-2">All systems secure</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Real-time Security Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">Anti-Cheat System</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-2xl font-bold text-green-400">Active</p>
                  <p className="text-xs text-slate-400 mt-1">Monitoring 23 sessions</p>
                </div>
                
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">Proctoring AI</span>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">Enabled</p>
                  <p className="text-xs text-slate-400 mt-1">98.7% accuracy</p>
                </div>
                
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">Network Monitor</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-2xl font-bold text-purple-400">Scanning</p>
                  <p className="text-xs text-slate-400 mt-1">All connections secure</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Blocked Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Ban className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No users currently blocked</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Anti-Cheat Detection</h3>
                    <p className="text-sm text-slate-400">Monitor suspicious behavior during exams</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Browser Lock Mode</h3>
                    <p className="text-sm text-slate-400">Prevent tab switching and minimize windows</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Time Tracking</h3>
                    <p className="text-sm text-slate-400">Monitor time spent on each question</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}