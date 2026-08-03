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

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const { data: userData, error: userError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const authUser = userData.user;

    const body = await req.json().catch(() => ({}));
    const planId = typeof body?.plan_id === "string" ? body.plan_id.trim() : "";
    const planName = typeof body?.plan_name === "string" ? body.plan_name.trim() : "";
    if (!planId && !planName) return json({ error: "plan_id or plan_name is required" }, 400);

    // Resolve the public users row (subscriptions + wallets are keyed to it)
    let profileId: string | null = null;
    const { data: byAuth } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();
    if (byAuth) profileId = byAuth.id as string;

    if (!profileId && authUser.email) {
      const { data: byEmail } = await admin
        .from("users")
        .select("id")
        .eq("email", authUser.email)
        .maybeSingle();
      if (byEmail) profileId = byEmail.id as string;
    }
    if (!profileId) return json({ error: "Your account profile could not be found" }, 404);

    // Load the plan
    const planQuery = admin
      .from("subscription_plans")
      .select("id, name, price, duration_days, is_active");
    const { data: plan } = planId
      ? await planQuery.eq("id", planId).maybeSingle()
      : await planQuery.eq("name", planName).maybeSingle();

    if (!plan || !plan.is_active) return json({ error: "Plan not found" }, 404);

    const amount = Number(plan.price) || 0;
    if (amount <= 0) return json({ error: "This plan is free — no payment needed" }, 400);

    // Check balance up front for a clean error message
    const { data: walletRow } = await admin
      .from("user_wallets")
      .select("balance")
      .eq("user_id", profileId)
      .maybeSingle();
    const balance = Number(walletRow?.balance ?? 0);
    if (balance < amount) {
      return json(
        {
          error: "Insufficient wallet balance",
          balance,
          amount,
          shortfall: amount - balance,
        },
        400,
      );
    }

    const reference = `sub_${crypto.randomUUID()}`;

    const { error: debitError } = await admin.rpc("wallet_debit", {
      p_user_id: profileId,
      p_amount: amount,
      p_reference: reference,
      p_description: `${plan.name} subscription`,
      p_metadata: { type: "subscription", plan_id: plan.id, plan_name: plan.name },
    });

    if (debitError) {
      console.error("wallet_debit failed", debitError);
      const message = String(debitError.message || "").toLowerCase();
      return json(
        { error: message.includes("insufficient") ? "Insufficient wallet balance" : "Could not debit wallet" },
        400,
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (Number(plan.duration_days) || 30));

    const { error: subError } = await admin.from("subscriptions").insert({
      user_id: profileId,
      plan_id: plan.id,
      status: "ACTIVE",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      payment_reference: reference,
      auto_renew: false,
    });

    if (subError) {
      console.error("subscription insert failed", subError);
      // Refund so the student is never charged for nothing
      await admin.rpc("wallet_credit", {
        p_user_id: profileId,
        p_amount: amount,
        p_reference: `refund_${reference}`,
        p_description: `Refund — ${plan.name} subscription could not be activated`,
      });
      return json({ error: "Could not activate the plan. Your wallet has been refunded." }, 500);
    }

    await admin.from("transactions").insert({
      user_id: profileId,
      amount,
      currency: "NGN",
      gateway: "wallet",
      gateway_reference: reference,
      status: "SUCCESS",
      payment_method: "wallet",
      metadata: { subscription: true, plan_type: plan.name, plan_id: plan.id },
    });

    return json({
      success: true,
      plan: plan.name,
      amount,
      reference,
      expires_at: endDate.toISOString(),
      balance: balance - amount,
    });
  } catch (err) {
    console.error("pay-subscription-wallet error", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
