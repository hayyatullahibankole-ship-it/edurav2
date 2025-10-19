import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, Smartphone, Wallet, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PaymentOptions = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentMethods();
    fetchWalletBalance();
  }, [userProfile]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('balance')
        .eq('user_id', userProfile?.id)
        .single();

      if (error) throw error;
      setWalletBalance(data?.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const getMethodIcon = (code: string) => {
    switch (code) {
      case 'paystack_card':
        return <CreditCard className="h-6 w-6" />;
      case 'bank_transfer':
        return <Building2 className="h-6 w-6" />;
      case 'ussd':
        return <Smartphone className="h-6 w-6" />;
      case 'wallet':
        return <Wallet className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const handleSelectMethod = (method: any) => {
    if (method.code === 'wallet' && walletBalance < 1000) {
      toast({
        title: 'Insufficient Balance',
        description: 'Your wallet balance is too low. Please fund your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    if (method.code === 'bank_transfer') {
      toast({
        title: 'Bank Transfer Instructions',
        description: 'Transfer to: Edura CBT - 1234567890 (GTBank). Use your email as reference.',
      });
    } else if (method.code === 'ussd') {
      toast({
        title: 'USSD Payment',
        description: 'Dial *737*50*Amount*Account# to pay via GTBank USSD.',
      });
    }

    toast({
      title: 'Payment Method Selected',
      description: `You selected ${method.name}`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Payment Options</h1>
          <p className="text-muted-foreground">Choose your preferred payment method</p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-secondary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 mb-1">Wallet Balance</p>
                <p className="text-4xl font-bold">₦{walletBalance.toLocaleString()}</p>
              </div>
              <Wallet className="h-12 w-12 text-white/80" />
            </div>
            <Button 
              variant="secondary" 
              className="mt-4"
              disabled
            >
              Fund Wallet (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Available Payment Methods</h2>
          
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading payment methods...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <Card 
                  key={method.id}
                  className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                  onClick={() => handleSelectMethod(method)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        {getMethodIcon(method.code)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {method.description}
                        </CardDescription>
                      </div>
                      {method.code === 'paystack_card' && (
                        <Badge>Recommended</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {method.code === 'paystack_card' && (
                        <>
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Instant confirmation</span>
                          </div>
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Secure payment</span>
                          </div>
                        </>
                      )}
                      
                      {method.code === 'bank_transfer' && (
                        <>
                          <p className="text-muted-foreground">Transfer details will be provided</p>
                          <p className="text-warning text-xs">⚠️ May take 1-2 hours to confirm</p>
                        </>
                      )}
                      
                      {method.code === 'ussd' && (
                        <>
                          <p className="text-muted-foreground">Quick payment via your bank's USSD</p>
                          <p className="text-xs">Works on any phone</p>
                        </>
                      )}
                      
                      {method.code === 'wallet' && (
                        <>
                          <p className="text-muted-foreground">Use your wallet balance</p>
                          <p className={`text-xs ${walletBalance > 0 ? 'text-success' : 'text-destructive'}`}>
                            Balance: ₦{walletBalance.toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Payment Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Secure Payments</p>
                <p className="text-sm text-muted-foreground">
                  All payments are encrypted and processed securely
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">Instant Activation</p>
                <p className="text-sm text-muted-foreground">
                  Your subscription activates immediately after payment
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">24/7 Support</p>
                <p className="text-sm text-muted-foreground">
                  Contact support if you experience any payment issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentOptions;
