import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Props {
  schoolId: string;
  currentStudentLimit: number;
}

export default function SchoolBilling({ schoolId, currentStudentLimit }: Props) {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, [schoolId]);

  const fetchBillingData = async () => {
    try {
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from("school_subscriptions")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (subsError) throw subsError;
      setSubscriptions(subsData || []);

      // Fetch payments from transactions table using payment_reference from subscriptions
      const paymentRefs = subsData?.map(s => s.payment_reference).filter(Boolean) || [];
      
      if (paymentRefs.length > 0) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("transactions")
          .select("*")
          .in("gateway_reference", paymentRefs)
          .order("created_at", { ascending: false });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/school-subscription");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </div>
            <Button onClick={handleUpgrade}>
              <Plus className="h-4 w-4 mr-2" />
              Upgrade Subscription
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Student Slots:</span>
              <span className="font-semibold">{currentStudentLimit}</span>
            </div>
            {subscriptions.length > 0 && subscriptions[0].status === 'ACTIVE' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price per Student:</span>
                  <span className="font-semibold">₦{subscriptions[0].price_per_student}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-semibold">
                    {new Date(subscriptions[0].end_date).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All transactions for your school</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading payment history...</p>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payments yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                    <TableHead className="whitespace-nowrap">Reference</TableHead>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Payment Method</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        {payment.gateway_reference}
                      </TableCell>
                      <TableCell className="font-semibold whitespace-nowrap">
                        {payment.currency === 'NGN' ? '₦' : payment.currency}
                        {Number(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.payment_method || payment.gateway}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "SUCCESS"
                              ? "default"
                              : payment.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}