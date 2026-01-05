import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Loader2, CheckCircle } from 'lucide-react';

interface PromoCodeActivationProps {
  onSuccess?: () => void;
}

export function PromoCodeActivation({ onSuccess }: PromoCodeActivationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!code.trim()) {
      toast.error('Please enter an access code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_promo_coupon', {
        coupon_code: code.trim()
      });

      if (error) {
        console.error('Redemption error:', error);
        toast.error('Failed to activate code. Please try again.');
        return;
      }

      const result = data as { success: boolean; error?: string; message?: string; expiry_date?: string };

      if (result.success) {
        toast.success(result.message || 'Access activated successfully!');
        setCode('');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Invalid access code');
      }
    } catch (err) {
      console.error('Activation error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Activate Complimentary Access</CardTitle>
        </div>
        <CardDescription>
          Enter your access code below to enjoy 1 month of free Edura CBT practice.
          <span className="block text-xs mt-1 text-muted-foreground/80">
            Note: Limited to 20 students. After 1 month, continued access requires a subscription.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Enter access code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="uppercase"
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
          />
          <Button onClick={handleActivate} disabled={loading || !code.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Activate'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
