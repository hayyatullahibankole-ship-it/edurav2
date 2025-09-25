import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const reference = searchParams.get('reference');

  useEffect(() => {
    if (reference && user) {
      verifyPayment();
    }
  }, [reference, user]);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      
      // Call Supabase edge function to verify payment
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference, userId: user?.id }
      });

      if (error) {
        console.error('Payment verification error:', error);
        toast.error('Failed to verify payment');
        return;
      }

      setPaymentData(data);
      toast.success('Payment verified successfully!');
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById('receipt-content');
    if (printContent) {
      const newWindow = window.open('', '_blank');
      newWindow?.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${reference}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .receipt { max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .success-icon { color: #22c55e; font-size: 48px; }
              .details { margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      newWindow?.document.close();
      newWindow?.print();
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Verifying your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center bg-green-50 dark:bg-green-950/20">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-300">
              Payment Successful!
            </CardTitle>
            <p className="text-muted-foreground">
              Your subscription has been activated successfully
            </p>
          </CardHeader>
          
          <CardContent className="p-6" id="receipt-content">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Payment Receipt</h2>
                <p className="text-muted-foreground">EduCore - Educational Platform</p>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Transaction Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono">{reference}</span>
                  </div>
                  {paymentData && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">₦{paymentData.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span>{paymentData.plan_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-600 font-semibold">Success</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-primary/5">
                <h3 className="font-semibold mb-3">Subscription Benefits</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Access to premium resources
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Unlimited exam attempts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Advanced analytics
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>

          <div className="border-t p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                onClick={handleBackToDashboard}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;