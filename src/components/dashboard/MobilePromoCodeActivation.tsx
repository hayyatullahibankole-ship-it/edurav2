import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Loader2 } from 'lucide-react';

interface MobilePromoCodeActivationProps {
  onSuccess?: () => void;
}

export function MobilePromoCodeActivation({ onSuccess }: MobilePromoCodeActivationProps) {
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
    <div className="rounded-2xl p-4 bg-card border border-border/50 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">Have an access code?</h3>
          <p className="text-xs text-muted-foreground">Get 1 month free premium</p>
        </div>
      </div>
      
      {/* Input and button */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 uppercase font-medium bg-background border-border rounded-xl h-11 text-sm"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
        />
        <Button 
          onClick={handleActivate} 
          disabled={loading || !code.trim()}
          className="px-4 h-11 rounded-xl font-semibold"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Activate'
          )}
        </Button>
      </div>
    </div>
  );
}
