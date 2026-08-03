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

    const { data: userData, error: userError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const key = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!key) return json({ error: "Payment system not configured" }, 500);

    const { data: account } = await admin
      .from("user_virtual_accounts")
      .select("customer_code, account_number")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account?.customer_code) {
      return json({ error: "No dedicated account found for this user" }, 400);
    }

    const customerRes = await fetch(
      `https://api.paystack.co/customer/${encodeURIComponent(account.customer_code)}`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    const customerBody = await customerRes.json().catch(() => ({}));
    const customerId = customerBody?.data?.id;
    if (!customerRes.ok || !customerId) {
      console.error("Paystack customer lookup failed", JSON.stringify(customerBody));
      return json({ error: customerBody?.message || "Could not verify payment profile" }, 400);
    }

    const res = await fetch(
      `https://api.paystack.co/transaction?customer=${encodeURIComponent(String(customerId))}&perPage=50&status=success`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !Array.isArray(body?.data)) {
      console.error("Paystack transaction list failed", JSON.stringify(body));
      return json({ error: body?.message || "Could not reach Paystack" }, 400);
    }

    let credited = 0;
    let total = 0;

    for (const txn of body.data) {
      if (txn?.status !== "success") continue;
      if (txn?.channel !== "dedicated_nuban") continue;
      const amountNaira = Number(txn.amount || 0) / 100;
      if (amountNaira <= 0) continue;

      const { error } = await admin.rpc("wallet_credit", {
        p_user_id: user.id,
        p_amount: amountNaira,
        p_reference: txn.reference,
        p_description: "Bank transfer top-up",
        p_metadata: {
          source: "paystack",
          channel: "dedicated_nuban",
          synced: true,
          paid_at: txn.paid_at ?? null,
        },
      });

      if (error) {
        // duplicate reference -> already credited, skip silently
        if (!String(error.message || "").toLowerCase().includes("duplicate")) {
          console.error("wallet_credit failed", txn.reference, error.message);
        }
        continue;
      }

      credited += 1;
      total += amountNaira;
    }

    return json({ success: true, credited, total });
  } catch (error) {
    console.error("wallet-sync error", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
