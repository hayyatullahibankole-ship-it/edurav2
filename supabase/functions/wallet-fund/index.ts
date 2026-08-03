import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const reference = typeof body?.reference === "string" ? body.reference.trim() : "";
    if (!reference) return json({ error: "Payment reference is required" }, 400);

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) return json({ error: "Payment system not configured" }, 500);

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const verify = await verifyRes.json();

    if (!verifyRes.ok || !verify?.status || verify?.data?.status !== "success") {
      console.error("Paystack verification failed", verifyRes.status, JSON.stringify(verify));
      return json({ error: "Payment could not be verified", details: verify?.message }, 400);
    }

    const amountNaira = Number(verify.data.amount || 0) / 100;
    if (amountNaira <= 0) return json({ error: "Invalid payment amount" }, 400);

    const { data: balance, error: creditError } = await admin.rpc("wallet_credit", {
      p_user_id: user.id,
      p_amount: amountNaira,
      p_reference: reference,
      p_description: "Wallet top-up",
      p_metadata: { channel: verify.data.channel ?? "card", source: "paystack" },
    });

    if (creditError) {
      console.error("wallet_credit failed", creditError);
      return json({ error: creditError.message }, 500);
    }

    return json({ success: true, balance: Number(balance), amount: amountNaira });
  } catch (error) {
    console.error("wallet-fund error", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
