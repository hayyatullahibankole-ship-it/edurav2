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

const paystack = async (path: string, key: string, init?: RequestInit) => {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, body };
};

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

    // Already provisioned?
    const { data: existing } = await admin
      .from("user_virtual_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) return json({ success: true, account: existing });

    const key = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!key) return json({ error: "Payment system not configured" }, 500);

    const body = await req.json().catch(() => ({}));

    // Pull profile details for names / phone
    const { data: profile } = await admin
      .from("users")
      .select("full_name, phone")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const rawName =
      (typeof body?.full_name === "string" && body.full_name.trim()) ||
      (profile?.full_name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.email?.split("@")[0] ?? "Edura User");
    const parts = String(rawName).trim().split(/\s+/);
    const firstName = parts[0] || "Edura";
    const lastName = parts.slice(1).join(" ") || "User";
    const phone =
      (typeof body?.phone === "string" && body.phone.trim()) ||
      (profile?.phone as string | undefined) ||
      undefined;

    // 1. Create (or fetch) the Paystack customer
    const customerRes = await paystack("/customer", key, {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        phone,
        metadata: { user_id: user.id },
      }),
    });

    let customerCode = customerRes.body?.data?.customer_code as string | undefined;
    if (!customerCode && user.email) {
      const fetched = await paystack(`/customer/${encodeURIComponent(user.email)}`, key);
      customerCode = fetched.body?.data?.customer_code;
    }
    if (!customerCode) {
      console.error("Paystack customer creation failed", JSON.stringify(customerRes.body));
      return json({ error: customerRes.body?.message || "Could not create payment profile" }, 400);
    }

    // 2. Assign a dedicated NUBAN
    const isTest = key.startsWith("sk_test");
    const preferredBank = isTest ? "test-bank" : (Deno.env.get("PAYSTACK_DVA_BANK") ?? "wema-bank");

    const dvaRes = await paystack("/dedicated_account", key, {
      method: "POST",
      body: JSON.stringify({ customer: customerCode, preferred_bank: preferredBank }),
    });

    const dva = dvaRes.body?.data;
    if (!dvaRes.ok || !dva?.account_number) {
      console.error("Paystack DVA failed", JSON.stringify(dvaRes.body));
      return json(
        {
          error:
            dvaRes.body?.message ||
            "Could not create a dedicated account. Enable Dedicated Virtual Accounts on your Paystack dashboard.",
        },
        400,
      );
    }

    const record = {
      user_id: user.id,
      customer_code: customerCode,
      account_number: dva.account_number,
      account_name: dva.account_name ?? rawName,
      bank_name: dva.bank?.name ?? preferredBank,
      bank_slug: dva.bank?.slug ?? preferredBank,
      currency: dva.currency ?? "NGN",
      provider: "paystack",
      status: "active",
    };

    const { data: saved, error: saveError } = await admin
      .from("user_virtual_accounts")
      .upsert(record, { onConflict: "user_id" })
      .select()
      .single();

    if (saveError) {
      console.error("Saving virtual account failed", saveError);
      return json({ error: saveError.message }, 500);
    }

    return json({ success: true, account: saved });
  } catch (error) {
    console.error("wallet-virtual-account error", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});
