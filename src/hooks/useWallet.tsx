import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type WalletTransaction = {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
};

export const useWallet = () => {
  const { user, userProfile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !userProfile?.id) {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("id, balance")
      .eq("user_id", userProfile.id)
      .maybeSingle();

    if (walletError) {
      console.error("Wallet balance fetch failed", walletError);
      setLoading(false);
      return;
    }

    setBalance(Number(wallet?.balance ?? 0));

    if (wallet?.id) {
      const { data: txns, error: transactionsError } = await supabase
        .from("wallet_transactions")
        .select("id, transaction_type, amount, balance_after, description, created_at")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (transactionsError) {
        console.error("Wallet activity fetch failed", transactionsError);
      } else {
        setTransactions((txns as WalletTransaction[]) || []);
      }
    } else {
      setTransactions([]);
    }
    setLoading(false);
  }, [user?.id, userProfile?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh on app focus / resume only — no background polling (saves battery
  // and removes the periodic re-render jank on mobile).
  useEffect(() => {
    if (!user || !userProfile?.id) return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refresh, user?.id, userProfile?.id]);

  return { balance, transactions, loading, refresh };
};

export default useWallet;
