import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { initializePaystackPayment } from "@/utils/paystack";
import { canPurchaseDigitalInApp } from "@/lib/nativePayments";
import { Copy, CreditCard, Loader2, Wallet as WalletIcon, Zap } from "lucide-react";

export type ScratchCardService = {
  id: string;
  name: string;
  slug: string;
  provider: string;
  price: number;
  description: string | null;
};

type Pin = { pin: string; serial?: string };

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

interface Props {
  service: ScratchCardService | null;
  onClose: () => void;
}

export const ScratchCardDialog = ({ service, onClose }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { balance, refresh } = useWallet();
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [pins, setPins] = useState<Pin[] | null>(null);

  useEffect(() => {
    if (service) {
      setQuantity(1);
      setPins(null);
    }
  }, [service?.id]);

  if (!service) return null;

  const total = Number(service.price) * quantity;
  const canUseWallet = balance >= total;

  const completePurchase = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("purchase-scratch-card", {
      body: { service_id: service.id, quantity, ...payload },
    });

    if (error || data?.error) {
      const message = data?.error || "Purchase failed. Please try again.";
      toast.error(data?.refunded ? `${message} Your wallet was refunded.` : message);
      return;
    }

    setPins((data?.pins as Pin[]) || []);
    toast.success("Scratch card delivered");
    refresh();
  };

  const payWithWallet = async () => {
    if (!user) return navigate("/auth");
    setProcessing(true);
    await completePurchase({ payment_method: "wallet" });
    setProcessing(false);
  };

  const payWithCard = async () => {
    if (!user) return navigate("/auth");
    setProcessing(true);
    try {
      await initializePaystackPayment(
        {
          amount: total * 100,
          email: user.email || "",
          reference: `scd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          currency: "NGN",
          metadata: { purpose: "scratch_card", service_slug: service.slug, quantity },
        },
        async (reference) => {
          await completePurchase({ payment_method: "card", payment_reference: reference });
          setProcessing(false);
        },
        () => setProcessing(false),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start payment");
      setProcessing(false);
    }
  };

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  return (
    <Dialog open={!!service} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service.name}</DialogTitle>
          <DialogDescription>
            {naira(service.price)} each · delivered instantly, no details needed
          </DialogDescription>
        </DialogHeader>

        {pins ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border bg-muted p-3">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Your card{pins.length > 1 ? "s are" : " is"} ready</p>
            </div>
            {pins.map((item, index) => (
              <div key={index} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">PIN</p>
                    <p className="break-all font-mono text-base font-semibold">{item.pin}</p>
                  </div>
                  <Button size="icon" variant="outline" onClick={() => copy(item.pin)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {item.serial && (
                  <div className="flex items-center justify-between gap-3 border-t pt-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Serial number</p>
                      <p className="break-all font-mono text-base font-semibold">{item.serial}</p>
                    </div>
                    <Button size="icon" variant="outline" onClick={() => copy(item.serial!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <p className="text-xs text-muted-foreground">
              These PINs are saved in your purchase history.
            </p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-bold">{naira(total)}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4 text-primary" />
                <span className="text-sm">Wallet balance</span>
              </div>
              <Badge variant="secondary">{naira(balance)}</Badge>
            </div>

            {canPurchaseDigitalInApp() ? (
              <div className="grid gap-2">
                <Button onClick={payWithWallet} disabled={processing || !canUseWallet}>
                  {processing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <WalletIcon className="mr-2 h-4 w-4" />
                  )}
                  Pay from wallet
                </Button>
                {!canUseWallet && (
                  <button
                    className="text-left text-xs text-muted-foreground underline"
                    onClick={() => navigate("/wallet")}
                  >
                    Balance too low — fund your wallet
                  </button>
                )}
                <Button variant="outline" onClick={payWithCard} disabled={processing}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay with card
                </Button>
              </div>
            ) : (
              <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                Result-checking cards are purchased on your Edura web dashboard. Cards you already
                own appear here automatically.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScratchCardDialog;
