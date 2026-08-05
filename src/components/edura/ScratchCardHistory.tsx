import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Loader2, Ticket } from "lucide-react";

type Pin = { pin: string; serial?: string };

type Order = {
  id: string;
  service_name: string;
  provider: string;
  quantity: number;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  pins: Pin[];
  error_message: string | null;
};

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const statusVariant = (status: string) =>
  status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary";

export const ScratchCardHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("scratch_card_orders")
        .select(
          "id, service_name, provider, quantity, amount, status, payment_method, created_at, pins, error_message",
        )
        .order("created_at", { ascending: false })
        .limit(30);

      setOrders(
        ((data as any[]) || []).map((row) => ({
          ...row,
          pins: Array.isArray(row.pins) ? (row.pins as Pin[]) : [],
        })) as Order[],
      );
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("PIN copied");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading your scratch cards…
      </div>
    );
  }

  if (!orders.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Scratch cards</h2>
      </div>

      {orders.map((order) => (
        <div key={order.id} className="space-y-2 rounded-lg border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{order.service_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString()} · {naira(order.amount)} ·{" "}
                {order.quantity} card{order.quantity > 1 ? "s" : ""} · {order.payment_method}
              </p>
            </div>
            <Badge variant={statusVariant(order.status)} className="capitalize">
              {order.status}
            </Badge>
          </div>

          {order.status === "failed" && order.error_message && (
            <p className="text-xs text-destructive">{order.error_message}</p>
          )}

          {order.pins.map((item, index) => (
            <div key={index} className="space-y-2 rounded-md border bg-muted/40 p-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">PIN</p>
                  <p className="break-all font-mono text-sm font-semibold">{item.pin}</p>
                </div>
                <Button size="icon" variant="outline" onClick={() => copy(item.pin)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {item.serial && (
                <>
                  <div className="flex items-center justify-between gap-3 border-t pt-2">
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground">Serial number</p>
                      <p className="break-all font-mono text-sm font-semibold">{item.serial}</p>
                    </div>
                    <Button size="icon" variant="outline" onClick={() => copy(item.serial!)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-full text-xs"
                    onClick={() => copy(`PIN: ${item.pin}\nSerial: ${item.serial}`)}
                  >
                    Copy PIN & serial
                  </Button>
                </>
              )}
            </div>
          ))}

        </div>
      ))}
    </div>
  );
};

export default ScratchCardHistory;
