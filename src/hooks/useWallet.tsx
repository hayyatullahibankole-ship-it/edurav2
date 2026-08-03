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
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .maybeSingle();

    setBalance(Number(wallet?.balance ?? 0));

    if (wallet?.id) {
      const { data: txns } = await supabase
        .from("wallet_transactions")
        .select("id, transaction_type, amount, balance_after, description, created_at")
        .eq("wallet_id", wallet.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setTransactions((txns as WalletTransaction[]) || []);
    } else {
      setTransactions([]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balance, transactions, loading, refresh };
};

export default useWallet;
