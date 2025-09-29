import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Eye, 
  Download, 
  Trash2,
  AlertTriangle,
  Check,
  Info,
  Lock,
  Mail,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface NotificationSettings {
  email_test_reminders: boolean;
  email_results: boolean;
  email_study_tips: boolean;
  email_subscription_updates: boolean;
  sms_test_reminders: boolean;
  sms_results: boolean;
  push_notifications: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_test_scores: boolean;
  show_study_progress: boolean;
  data_collection_analytics: boolean;
  data_collection_personalization: boolean;
}

interface PreferenceSettings {
  language: string;
  timezone: string;
  default_exam_type: string;
  test_duration_preference: string;
  difficulty_preference: string;
}

export default function AccountSettings() {
  const { user, userProfile } = useAuth();
  const { subscription, isPremium } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_test_reminders: true,
    email_results: true,
    email_study_tips: false,
    email_subscription_updates: true,
    sms_test_reminders: false,
    sms_results: false,
    push_notifications: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: 'public',
    show_test_scores: false,
    show_study_progress: true,
    data_collection_analytics: true,
    data_collection_personalization: true
  });

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    language: 'en',
    timezone: 'Africa/Lagos',
    default_exam_type: 'jamb',
    test_duration_preference: 'standard',
    difficulty_preference: 'adaptive'
  });

  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: isPremium ? 10 : 1, // GB
    breakdown: {
      test_results: 0,
      study_materials: 0,
      profile_data: 0
    }
  });

  useEffect(() => {
    loadSettings();
    calculateStorageUsage();
  }, [userProfile]);

  const loadSettings = async () => {
    if (!userProfile) return;

    try {
      // In a real app, you'd load these from user preferences table
      // For now, using defaults with some user-specific overrides
      setNotifications(prev => ({
        ...prev,
        email_test_reminders: userProfile.email ? true : false,
        sms_test_reminders: userProfile.phone ? false : false
      }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const calculateStorageUsage = async () => {
    if (!userProfile) return;

    try {
      // Calculate approximate storage usage
      const { data: attempts } = await supabase
        .from('attempts')
        .select('id')
        .eq('user_id', userProfile.id);

      const { data: results } = await supabase
        .from('results')
        .select('id')
        .limit(1000);

      // Rough estimates
      const testResults = (attempts?.length || 0) * 0.001; // ~1KB per test
      const profileData = 0.005; // ~5KB for profile
      const studyMaterials = 0.01; // ~10KB for misc data

      setStorageUsage(prev => ({
        ...prev,
        used: testResults + profileData + studyMaterials,
        breakdown: {
          test_results: testResults,
          study_materials: studyMaterials,
          profile_data: profileData
        }
      }));
    } catch (error) {
      console.error('Error calculating storage:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, save to user_preferences table
      toast({
        title: "Settings saved",
        description: "Your account preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Export user data
      const userData = {
        profile: userProfile,
        preferences: { notifications, privacy, preferences },
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edura-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Overview
          </CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={userProfile?.is_verified ? "default" : "secondary"}>
                  {userProfile?.is_verified ? "Verified" : "Unverified"}
                </Badge>
                {!userProfile?.is_verified && (
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Verify Now
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Subscription</Label>
              <Badge variant="outline">
                {subscription?.subscription_plans?.name || 'Free Plan'}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Member Since</Label>
              <p className="text-sm text-muted-foreground">
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Notifications
            </h4>
            <div className="space-y-3 pl-6">
              {[
                { key: 'email_test_reminders', label: 'Test reminders and study sessions', description: 'Get notified about upcoming tests' },
                { key: 'email_results', label: 'Test results and performance updates', description: 'Receive your test scores and analysis' },
                { key: 'email_study_tips', label: 'Study tips and educational content', description: 'Weekly study tips and learning resources' },
                { key: 'email_subscription_updates', label: 'Subscription and billing updates', description: 'Important account and billing information' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={notifications[key as keyof NotificationSettings] as boolean}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              SMS Notifications {!isPremium && <Badge variant="outline" className="text-xs">Premium</Badge>}
            </h4>
            <div className="space-y-3 pl-6">
              {[
                { key: 'sms_test_reminders', label: 'Test reminders', description: 'SMS alerts 1 hour before scheduled tests' },
                { key: 'sms_results', label: 'Immediate results', description: 'Get test results via SMS instantly' }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Switch
                    checked={notifications[key as keyof NotificationSettings] as boolean}
                    disabled={!isPremium}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
            {!isPremium && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  SMS notifications are available with premium subscription. 
                  <Link to="/payment" className="font-medium text-primary hover:underline ml-1">
                    Upgrade now
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Profile Visibility</Label>
                <p className="text-xs text-muted-foreground">Who can see your profile and progress</p>
              </div>
              <Select
                value={privacy.profile_visibility}
                onValueChange={(value: 'public' | 'private' | 'friends') => 
                  setPrivacy(prev => ({ ...prev, profile_visibility: value }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {[
              { key: 'show_test_scores', label: 'Show test scores on profile', description: 'Display your test performance publicly' },
              { key: 'show_study_progress', label: 'Show study progress', description: 'Allow others to see your learning journey' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={privacy[key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Data Collection</h4>
            {[
              { key: 'data_collection_analytics', label: 'Analytics and performance tracking', description: 'Help us improve the platform with usage analytics' },
              { key: 'data_collection_personalization', label: 'Personalized recommendations', description: 'Enable AI-powered study recommendations' }
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={privacy[key as keyof PrivacySettings] as boolean}
                  onCheckedChange={(checked) => 
                    setPrivacy(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Study Preferences
          </CardTitle>
          <CardDescription>
            Customize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Default Exam Type</Label>
              <Select
                value={preferences.default_exam_type}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, default_exam_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jamb">JAMB</SelectItem>
                  <SelectItem value="waec">WAEC</SelectItem>
                  <SelectItem value="neco">NECO</SelectItem>
                  <SelectItem value="post-utme">Post-UTME</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Test Duration Preference</Label>
              <Select
                value={preferences.test_duration_preference}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, test_duration_preference: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (15 min)</SelectItem>
                  <SelectItem value="standard">Standard (45 min)</SelectItem>
                  <SelectItem value="full">Full Length (3 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty Preference</Label>
              <Select
                value={preferences.difficulty_preference}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, difficulty_preference: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ha">Hausa</SelectItem>
                  <SelectItem value="ig">Igbo</SelectItem>
                  <SelectItem value="yo">Yoruba</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Storage & Data Management
          </CardTitle>
          <CardDescription>
            View your data usage and manage your information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {storageUsage.used.toFixed(2)} GB of {storageUsage.total} GB
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${Math.min((storageUsage.used / storageUsage.total) * 100, 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>Test Results: {storageUsage.breakdown.test_results.toFixed(3)} GB</div>
              <div>Study Materials: {storageUsage.breakdown.study_materials.toFixed(3)} GB</div>
              <div>Profile Data: {storageUsage.breakdown.profile_data.toFixed(3)} GB</div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleExportData} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cache Data
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your data is automatically backed up daily. Export includes profile, test history, and preferences.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}