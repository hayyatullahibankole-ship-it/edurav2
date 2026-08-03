import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Plus, Wallet as WalletIcon, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/hooks/useWallet";

interface Props {
  schoolId: string;
  currentStudentLimit: number;
}

function seatPrice(seats: number) {
  if (seats <= 0) return 0;
  if (seats <= 50) return 1000;
  if (seats <= 100) return 900;
  if (seats <= 200) return 850;
  if (seats <= 250) return 800;
  return 0;
}

export default function SchoolBilling({ schoolId, currentStudentLimit }: Props) {
  const navigate = useNavigate();
  const { balance, loading: walletLoading, refresh: refreshWallet } = useWallet();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [extraSeats, setExtraSeats] = useState(10);
  const [paying, setPaying] = useState(false);

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

  const activeSub = subscriptions.find((s) => s.status === "ACTIVE") || null;
  const daysLeft = activeSub
    ? Math.ceil((new Date(activeSub.end_date).getTime() - Date.now()) / 86400000)
    : null;
  const topUpCost = seatPrice(extraSeats) * extraSeats;

  const handleSeatTopUp = async () => {
    if (extraSeats < 1 || extraSeats > 250) {
      toast.error("Enter between 1 and 250 extra seats");
      return;
    }
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("pay-school-subscription-wallet", {
        body: { seats: extraSeats, mode: "seats_only" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success(`${extraSeats} seats added to your plan`);
      setTopUpOpen(false);
      refreshWallet();
      fetchBillingData();
    } catch (e: any) {
      toast.error(e?.message || "Could not add seats");
    } finally {
      setPaying(false);
    }
  };


  return (
    <div className="space-y-6">
      {activeSub && daysLeft !== null && daysLeft <= 14 && (
        <Alert variant={daysLeft <= 3 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {daysLeft <= 0
              ? "Your subscription has expired. Renew to keep running exams."
              : `Your subscription expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Renew to avoid interruption.`}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <WalletIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Wallet balance</CardTitle>
                <CardDescription>
                  {walletLoading ? "Loading…" : `₦${Number(balance || 0).toLocaleString()} available`}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/wallet")}>
                Fund wallet
              </Button>
              <Button size="sm" onClick={() => setTopUpOpen(true)} disabled={!activeSub}>
                <Plus className="h-4 w-4 mr-2" />
                Add seats
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
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

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add student seats</DialogTitle>
            <DialogDescription>
              Extra seats are added to your current plan and expire on the same date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extra-seats">Number of seats</Label>
              <Input
                id="extra-seats"
                type="number"
                min={1}
                max={250}
                value={extraSeats}
                onChange={(e) => setExtraSeats(Number(e.target.value))}
              />
            </div>
            <div className="rounded-lg border p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per seat</span>
                <span className="font-medium">₦{seatPrice(extraSeats).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">₦{topUpCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet balance</span>
                <span className="font-medium">₦{Number(balance || 0).toLocaleString()}</span>
              </div>
            </div>
            {topUpCost > Number(balance || 0) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Not enough balance. Fund your wallet to continue.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpOpen(false)} disabled={paying}>
              Cancel
            </Button>
            <Button
              onClick={handleSeatTopUp}
              disabled={paying || topUpCost <= 0 || topUpCost > Number(balance || 0)}
            >
              {paying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Pay ₦{topUpCost.toLocaleString()} from wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
