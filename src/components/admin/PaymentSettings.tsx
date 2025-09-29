import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Key, Save, Eye, EyeOff } from 'lucide-react';

interface PaymentSetting {
  key: string;
  value: string;
  description: string;
  is_public: boolean;
}

export const PaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'paystack_public_key');

      if (error) throw error;

      setSettings(data || []);
      if (data && data.length > 0) {
        setPublicKey(data[0].value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaystackKey = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: publicKey })
        .eq('key', 'paystack_public_key');

      if (error) throw error;

      toast({
        title: "Success",
        description: "Paystack public key updated successfully"
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update Paystack public key",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment Settings</h2>
        <p className="text-muted-foreground">
          Configure payment gateway settings for your application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Paystack Configuration
          </CardTitle>
          <CardDescription>
            Configure your Paystack public key for processing payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Only enter your Paystack public key (starts with pk_). Never enter your secret key here as it will be visible to users.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="paystack-key">Paystack Public Key</Label>
            <div className="relative">
              <Input
                id="paystack-key"
                type={showKey ? "text" : "password"}
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="pk_test_..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Get your public key from your Paystack dashboard
            </p>
          </div>

          <Button 
            onClick={updatePaystackKey} 
            disabled={saving || !publicKey.startsWith('pk_')}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>

          {publicKey && !publicKey.startsWith('pk_') && (
            <Alert variant="destructive">
              <AlertDescription>
                Please enter a valid Paystack public key (must start with pk_)
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};