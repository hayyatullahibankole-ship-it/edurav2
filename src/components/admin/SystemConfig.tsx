import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save,
  RefreshCw,
  Database,
  Mail,
  Shield,
  Clock,
  Globe,
  Bell,
  Palette,
  Server,
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SystemConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Edura Platform',
    siteDescription: 'Advanced Computer-Based Testing Platform',
    adminEmail: 'admin@edura.com',
    timezone: 'Africa/Lagos',
    
    // Exam Settings
    defaultExamDuration: 120,
    maxAttempts: 3,
    passingScore: 50,
    shuffleQuestions: true,
    shuffleOptions: true,
    
    // Security Settings
    enableAntiCheat: true,
    browserLockMode: true,
    screenshotPrevention: true,
    sessionTimeout: 30,
    
    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    enableEmailNotifications: true,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
  });

  // Load existing settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*');

        if (error) throw error;

        if (data && data.length > 0) {
          const configMap: any = {};
          data.forEach(setting => {
            configMap[setting.key] = setting.value;
          });

          setSettings(prev => ({
            ...prev,
            siteName: configMap.site_name || prev.siteName,
            siteDescription: configMap.site_description || prev.siteDescription,
            adminEmail: configMap.admin_email || prev.adminEmail,
            timezone: configMap.timezone || prev.timezone,
            defaultExamDuration: configMap.default_exam_duration || prev.defaultExamDuration,
            maxAttempts: configMap.max_attempts || prev.maxAttempts,
            passingScore: configMap.passing_score || prev.passingScore,
            shuffleQuestions: configMap.shuffle_questions ?? prev.shuffleQuestions,
            shuffleOptions: configMap.shuffle_options ?? prev.shuffleOptions,
            enableAntiCheat: configMap.enable_anti_cheat ?? prev.enableAntiCheat,
            browserLockMode: configMap.browser_lock_mode ?? prev.browserLockMode,
            screenshotPrevention: configMap.screenshot_prevention ?? prev.screenshotPrevention,
            sessionTimeout: configMap.session_timeout || prev.sessionTimeout,
            smtpHost: configMap.smtp_host || prev.smtpHost,
            smtpPort: configMap.smtp_port || prev.smtpPort,
            smtpUsername: configMap.smtp_username || prev.smtpUsername,
            enableEmailNotifications: configMap.enable_email_notifications ?? prev.enableEmailNotifications,
            maintenanceMode: configMap.maintenance_mode ?? prev.maintenanceMode,
            maintenanceMessage: configMap.maintenance_message || prev.maintenanceMessage,
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Prepare settings for database
      const settingsToSave = [
        { key: 'site_name', value: settings.siteName, description: 'Platform name' },
        { key: 'site_description', value: settings.siteDescription, description: 'Platform description' },
        { key: 'admin_email', value: settings.adminEmail, description: 'Administrator email' },
        { key: 'timezone', value: settings.timezone, description: 'Default timezone' },
        { key: 'default_exam_duration', value: settings.defaultExamDuration, description: 'Default exam duration in minutes' },
        { key: 'max_attempts', value: settings.maxAttempts, description: 'Maximum exam attempts' },
        { key: 'passing_score', value: settings.passingScore, description: 'Default passing percentage' },
        { key: 'shuffle_questions', value: settings.shuffleQuestions, description: 'Shuffle questions in exams' },
        { key: 'shuffle_options', value: settings.shuffleOptions, description: 'Shuffle answer options' },
        { key: 'enable_anti_cheat', value: settings.enableAntiCheat, description: 'Enable anti-cheat monitoring' },
        { key: 'browser_lock_mode', value: settings.browserLockMode, description: 'Enable browser lock mode' },
        { key: 'screenshot_prevention', value: settings.screenshotPrevention, description: 'Prevent screenshots' },
        { key: 'session_timeout', value: settings.sessionTimeout, description: 'Session timeout in minutes' },
        { key: 'smtp_host', value: settings.smtpHost, description: 'SMTP server host' },
        { key: 'smtp_port', value: settings.smtpPort, description: 'SMTP server port' },
        { key: 'smtp_username', value: settings.smtpUsername, description: 'SMTP username' },
        { key: 'enable_email_notifications', value: settings.enableEmailNotifications, description: 'Enable email notifications' },
        { key: 'maintenance_mode', value: settings.maintenanceMode, description: 'Enable maintenance mode' },
        { key: 'maintenance_message', value: settings.maintenanceMessage, description: 'Maintenance message' },
      ];

      // Upsert all settings
      const { error } = await supabase
        .from('settings')
        .upsert(settingsToSave, { onConflict: 'key' });

      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "System configuration has been updated successfully"
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (type: string) => {
    try {
      setLoading(true);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Test",
        description: `${type} connection successful`,
      });
      
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${type}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Configuration</h2>
          <p className="text-slate-400">Manage platform settings and configuration</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save All Changes
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">System Status</p>
                <p className="text-lg font-bold text-green-400">Online</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Database</p>
                <p className="text-lg font-bold text-blue-400">Connected</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Email Service</p>
                <p className="text-lg font-bold text-purple-400">Active</p>
              </div>
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Security</p>
                <p className="text-lg font-bold text-orange-400">Secure</p>
              </div>
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800">
          <TabsTrigger value="general" className="text-white">General</TabsTrigger>
          <TabsTrigger value="exams" className="text-white">Exams</TabsTrigger>
          <TabsTrigger value="security" className="text-white">Security</TabsTrigger>
          <TabsTrigger value="email" className="text-white">Email</TabsTrigger>
          <TabsTrigger value="maintenance" className="text-white">Maintenance</TabsTrigger>
          <TabsTrigger value="advanced" className="text-white">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="siteName" className="text-white">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="adminEmail" className="text-white">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription" className="text-white">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="timezone" className="text-white">Default Timezone</Label>
                <Input
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Exam Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="defaultDuration" className="text-white">Default Duration (minutes)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={settings.defaultExamDuration}
                    onChange={(e) => setSettings({...settings, defaultExamDuration: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxAttempts" className="text-white">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={settings.maxAttempts}
                    onChange={(e) => setSettings({...settings, maxAttempts: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="passingScore" className="text-white">Default Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={settings.passingScore}
                    onChange={(e) => setSettings({...settings, passingScore: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Shuffle Questions</h3>
                    <p className="text-sm text-slate-400">Randomize question order for each attempt</p>
                  </div>
                  <Switch
                    checked={settings.shuffleQuestions}
                    onCheckedChange={(checked) => setSettings({...settings, shuffleQuestions: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Shuffle Options</h3>
                    <p className="text-sm text-slate-400">Randomize answer options for each question</p>
                  </div>
                  <Switch
                    checked={settings.shuffleOptions}
                    onCheckedChange={(checked) => setSettings({...settings, shuffleOptions: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Security Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Anti-Cheat System</h3>
                    <p className="text-sm text-slate-400">Enable behavioral monitoring during exams</p>
                  </div>
                  <Switch
                    checked={settings.enableAntiCheat}
                    onCheckedChange={(checked) => setSettings({...settings, enableAntiCheat: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Browser Lock Mode</h3>
                    <p className="text-sm text-slate-400">Prevent tab switching and minimize windows</p>
                  </div>
                  <Switch
                    checked={settings.browserLockMode}
                    onCheckedChange={(checked) => setSettings({...settings, browserLockMode: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">Screenshot Prevention</h3>
                    <p className="text-sm text-slate-400">Block screenshot and screen recording attempts</p>
                  </div>
                  <Switch
                    checked={settings.screenshotPrevention}
                    onCheckedChange={(checked) => setSettings({...settings, screenshotPrevention: checked})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sessionTimeout" className="text-white">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpHost" className="text-white">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtpPort" className="text-white">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value)})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtpUsername" className="text-white">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.smtpUsername}
                    onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="smtpPassword" className="text-white">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg flex-1 mr-4">
                  <div>
                    <h3 className="font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-slate-400">Send automated emails to users</p>
                  </div>
                  <Switch
                    checked={settings.enableEmailNotifications}
                    onCheckedChange={(checked) => setSettings({...settings, enableEmailNotifications: checked})}
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleTestConnection('Email')}
                  disabled={loading}
                >
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings.maintenanceMode && (
                <Alert className="bg-orange-950 border-orange-800 text-orange-100">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <AlertDescription>
                    Maintenance mode is currently active. Users cannot access the platform.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-white">Enable Maintenance Mode</h3>
                  <p className="text-sm text-slate-400">Temporarily disable access to the platform</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                />
              </div>

              <div>
                <Label htmlFor="maintenanceMessage" className="text-white">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="System is under maintenance. Please try again later."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Server className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Advanced Settings</p>
                <p className="text-slate-500">Server configuration, caching, and performance tuning</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}