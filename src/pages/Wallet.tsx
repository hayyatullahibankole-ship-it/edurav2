import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { initializePaystackPayment } from "@/utils/paystack";
import ServicesMobileNav from "@/components/edura/ServicesMobileNav";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Copy,
  Loader2,
  RefreshCw,
  Wallet as WalletIcon,
} from "lucide-react";

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

type VirtualAccount = {
  account_number: string;
  account_name: string;
  bank_name: string;
  status: string;
};

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance, transactions, loading, refresh } = useWallet();
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [account, setAccount] = useState<VirtualAccount | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);


  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) {
        setAccount(null);
        setAccountLoading(false);
        return;
      }
      const { data } = await supabase
        .from("user_virtual_accounts")
        .select("account_number, account_name, bank_name, status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (active) {
        setAccount((data as VirtualAccount) || null);
        setAccountLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const generateAccount = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-virtual-account", {
        body: {},
      });
      if (error || data?.error) {
        toast.error(data?.error || "Could not generate your account number");
      } else if (data?.account) {
        setAccount(data.account as VirtualAccount);
        toast.success("Your dedicated account number is ready");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate account");
    } finally {
      setGenerating(false);
    }
  };

  const copyAccount = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.account_number);
      toast.success("Account number copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  const syncTransfers = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("wallet-sync", { body: {} });
      if (error || data?.error) {
        toast.error(data?.error || "Could not check for transfers");
      } else if (data?.credited > 0) {
        toast.success(`${data.credited} transfer(s) added — ${naira(data.total)}`);
        refresh();
      } else {
        toast.info("No new transfers found yet");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not check for transfers");
    } finally {
      setSyncing(false);
    }
  };




  const fundWallet = async () => {
    const value = Number(amount);
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!Number.isFinite(value) || value < 100) {
      toast.error("Enter an amount of at least ₦100");
      return;
    }

    setFunding(true);
    try {
      await initializePaystackPayment(
        {
          amount: value * 100,
          email: user.email || "",
          reference: `wal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          currency: "NGN",
          metadata: { purpose: "wallet_topup", user_id: user.id },
        },
        async (reference) => {
          const { data, error } = await supabase.functions.invoke("wallet-fund", {
            body: { reference },
          });
          if (error || data?.error) {
            toast.error(data?.error || "We could not confirm that payment yet.");
          } else {
            toast.success(`Wallet funded with ${naira(value)}`);
            setAmount("");
            refresh();
          }
          setFunding(false);
        },
        () => setFunding(false),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start payment");
      setFunding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-10">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm font-semibold">Wallet</p>
            <p className="text-xs text-muted-foreground">Fund once, pay instantly</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl space-y-5 px-4 py-5">
        <Card className="border">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border bg-muted p-2.5">
                  <WalletIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available balance</p>
                  <p className="text-3xl font-bold">{loading ? "—" : naira(balance)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={refresh} className="h-9 w-9">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md border bg-muted p-2">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Dedicated account number</p>
                  {accountLoading ? (
                    <p className="mt-1 text-xs text-muted-foreground">Checking…</p>
                  ) : account ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold tracking-wider">{account.account_number}</p>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyAccount}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {account.bank_name} • {account.account_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Transfer to this account from any bank app and your wallet is funded
                        automatically.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Generate a permanent account number in your name. Any transfer to it tops up
                        your wallet instantly.
                      </p>
                      <Button size="sm" onClick={generateAccount} disabled={generating}>
                        {generating && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                        {generating ? "Generating…" : "Generate account number"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="amount">Top up amount</Label>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2000"
              />
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant="outline"
                    onClick={() => setAmount(String(value))}
                  >
                    {naira(value)}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={fundWallet} disabled={funding}>
              {funding ? "Processing..." : "Fund wallet"}
            </Button>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          {transactions.length === 0 ? (
            <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
              No wallet activity yet.
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {transactions.map((txn) => {
                const credit = txn.transaction_type === "credit";
                return (
                  <div key={txn.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-md border bg-muted p-2">
                        {credit ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {txn.description || (credit ? "Wallet top-up" : "Payment")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(txn.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-semibold ${credit ? "text-success" : ""}`}>
                        {credit ? "+" : "-"}
                        {naira(Number(txn.amount))}
                      </p>
                      <Badge variant="secondary" className="text-[10px]">
                        {naira(Number(txn.balance_after))}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <ServicesMobileNav activeTab="home" />
    </div>
  );
};

export default Wallet;
