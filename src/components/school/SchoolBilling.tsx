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
      const [subsData, paymentsData] = await Promise.all([
        supabase
          .from("school_subscriptions")
          .select("*")
          .eq("school_id", schoolId)
          .order("created_at", { ascending: false }),
        supabase
          .from("school_payments")
          .select("*")
          .eq("school_id", schoolId)
          .order("created_at", { ascending: false }),
      ]);

      if (subsData.error) throw subsData.error;
      if (paymentsData.error) throw paymentsData.error;

      setSubscriptions(subsData.data || []);
      setPayments(paymentsData.data || []);
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
            {subscriptions.length > 0 && subscriptions[0].status === 'active' && (
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.payment_reference}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₦{Number(payment.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "success"
                            ? "default"
                            : payment.status === "pending"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}