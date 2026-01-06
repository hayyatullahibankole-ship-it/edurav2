import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Gift, Loader2, Sparkles, Star } from 'lucide-react';

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
    <div 
      className="relative overflow-hidden rounded-[28px] p-5 animate-fade-in"
      style={{ 
        background: 'linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary) / 0.3) 100%)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
        animationDelay: '0.5s'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-accent/30 rounded-full blur-xl" />
      
      {/* Floating stars */}
      <Star className="absolute top-3 right-4 h-4 w-4 text-primary/40 animate-pulse" />
      <Star className="absolute bottom-8 right-8 h-3 w-3 text-accent/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      <div className="relative z-10">
        {/* Header with badge */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="p-3 rounded-2xl bg-primary/20 backdrop-blur-sm border border-primary/30"
            style={{ boxShadow: '0 4px 12px rgba(var(--primary), 0.2)' }}
          >
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-foreground">Got an Access Code?</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/20 text-primary rounded-full border border-primary/30">
                Free
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Activate 1 month of free premium access
            </p>
          </div>
        </div>
        
        {/* Input and button */}
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Enter code here"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 uppercase font-semibold text-center bg-background/80 backdrop-blur-sm border-2 border-primary/20 focus:border-primary rounded-xl h-12 text-base placeholder:text-muted-foreground/60"
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
          />
          <Button 
            onClick={handleActivate} 
            disabled={loading || !code.trim()}
            className="px-5 h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg font-bold"
            style={{ boxShadow: '0 4px 16px rgba(var(--primary), 0.3)' }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Activate
              </>
            )}
          </Button>
        </div>
        
        {/* Footer note */}
        <p className="text-[10px] text-muted-foreground/70 text-center mt-3">
          Limited to 20 students • Full access for 1 month
        </p>
      </div>
    </div>
  );
}
