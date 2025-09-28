import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecuritySettings {
  enable_rate_limiting: boolean;
  max_requests_per_minute: number;
  enable_device_fingerprinting: boolean;
  enable_audit_logging: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
}

export default function SecurityConfig() {
  const [settings, setSettings] = useState<SecuritySettings>({
    enable_rate_limiting: true,
    max_requests_per_minute: 60,
    enable_device_fingerprinting: true,
    enable_audit_logging: true,
    session_timeout_minutes: 30,
    max_login_attempts: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          'enable_rate_limiting',
          'max_requests_per_minute', 
          'enable_device_fingerprinting',
          'enable_audit_logging',
          'session_timeout_minutes',
          'max_login_attempts'
        ]);

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {} as Record<string, any>);

        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        description: getSettingDescription(key)
      }));

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'key' });
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Security settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions = {
      enable_rate_limiting: "Controls API request rate limiting",
      max_requests_per_minute: "Maximum API requests per minute per user",
      enable_device_fingerprinting: "Track user devices for security",
      enable_audit_logging: "Log all administrative actions",
      session_timeout_minutes: "User session timeout in minutes",
      max_login_attempts: "Maximum failed login attempts before lockout"
    };
    return descriptions[key as keyof typeof descriptions] || "Security setting";
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Security Configuration</h2>
      </div>

      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Security Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Please enable "Leaked Password Protection" in your Supabase 
              Authentication settings to strengthen password security.
            </AlertDescription>
          </Alert>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span>RLS Policies</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span>Audit Logging</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span>Input Validation</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span>Password Protection</span>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limiting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="rate-limiting">Enable Rate Limiting</Label>
            <Switch
              id="rate-limiting"
              checked={settings.enable_rate_limiting}
              onCheckedChange={(checked) => updateSetting('enable_rate_limiting', checked)}
            />
          </div>
          
          {settings.enable_rate_limiting && (
            <div className="space-y-2">
              <Label htmlFor="max-requests">Maximum Requests per Minute</Label>
              <Input
                id="max-requests"
                type="number"
                min="10"
                max="1000"
                value={settings.max_requests_per_minute}
                onChange={(e) => updateSetting('max_requests_per_minute', parseInt(e.target.value))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Security */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="device-fingerprinting">Enable Device Fingerprinting</Label>
            <Switch
              id="device-fingerprinting"
              checked={settings.enable_device_fingerprinting}
              onCheckedChange={(checked) => updateSetting('enable_device_fingerprinting', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="480"
              value={settings.session_timeout_minutes}
              onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-attempts">Maximum Login Attempts</Label>
            <Input
              id="max-attempts"
              type="number"
              min="3"
              max="10"
              value={settings.max_login_attempts}
              onChange={(e) => updateSetting('max_login_attempts', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit & Logging */}
      <Card>
        <CardHeader>
          <CardTitle>Audit & Logging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="audit-logging">Enable Audit Logging</Label>
            <Switch
              id="audit-logging"
              checked={settings.enable_audit_logging}
              onCheckedChange={(checked) => updateSetting('enable_audit_logging', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="min-w-32"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}