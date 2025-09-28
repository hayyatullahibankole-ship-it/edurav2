import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  action_type: string;
  created_at: string;
  ip_address?: string;
  actor_email?: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical' | 'info';
  details: any;
}

export default function SecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchSecurityEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          action_type,
          created_at,
          ip_address,
          details,
          users!audit_logs_actor_user_id_fkey(email)
        `)
        .in('action_type', [
          'RATE_LIMIT_EXCEEDED',
          'AUTH_RATE_LIMIT_EXCEEDED', 
          'UNAUTHORIZED_ADMIN_ATTEMPT',
          'SUSPICIOUS_LOGIN_PATTERN',
          'PII_ACCESS',
          'ADMIN_PII_ACCESS',
          'SECURITY_VIOLATION'
        ])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching security events:', error);
        toast.error('Failed to load security events');
        return;
      }

      const formattedEvents: SecurityEvent[] = (data || []).map(event => ({
        id: event.id,
        action_type: event.action_type,
        created_at: event.created_at,
        ip_address: event.ip_address as string,
        actor_email: event.users?.email || '',
        details: event.details,
        severity_level: getSeverityLevel(event.action_type)
      }));

      setEvents(formattedEvents);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching security events');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLevel = (actionType: string): SecurityEvent['severity_level'] => {
    if (actionType.includes('RATE_LIMIT')) return 'high';
    if (actionType.includes('UNAUTHORIZED')) return 'critical';
    if (actionType.includes('SUSPICIOUS')) return 'medium';
    if (actionType.includes('PII_ACCESS')) return 'low';
    return 'info';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Eye className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchSecurityEvents();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const criticalEvents = events.filter(e => e.severity_level === 'critical').length;
  const highEvents = events.filter(e => e.severity_level === 'high').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Monitor</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchSecurityEvents}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{highEvents}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalEvents > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalEvents} critical security alert{criticalEvents > 1 ? 's' : ''} detected!</strong>
            <br />
            Immediate attention required - potential security breaches or unauthorized access attempts.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Loading security events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent security events detected</p>
              <p className="text-sm">Your system appears secure</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 20).map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className={`p-1 rounded-full text-white ${getSeverityColor(event.severity_level)}`}>
                    {getSeverityIcon(event.severity_level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {event.action_type.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {event.severity_level}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        <strong>Time:</strong> {new Date(event.created_at).toLocaleString()}
                      </div>
                      {event.actor_email && (
                        <div>
                          <strong>User:</strong> {event.actor_email}
                        </div>
                      )}
                      {event.ip_address && (
                        <div>
                          <strong>IP:</strong> {event.ip_address}
                        </div>
                      )}
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div>
                          <strong>Details:</strong> {JSON.stringify(event.details, null, 2).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}