import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const key = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!key) return new Response("not configured", { status: 500, headers: corsHeaders });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", key).update(raw).digest("hex");
  if (signature !== expected) {
    console.warn("Invalid Paystack signature");
    return new Response("invalid signature", { status: 401, headers: corsHeaders });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("bad payload", { status: 400, headers: corsHeaders });
  }

  try {
    if (event?.event !== "charge.success") {
      return new Response("ignored", { status: 200, headers: corsHeaders });
    }

    const data = event.data ?? {};
    // Only auto-credit bank transfers into dedicated accounts here.
    if (data.channel !== "dedicated_nuban") {
      return new Response("ignored", { status: 200, headers: corsHeaders });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const customerCode = data.customer?.customer_code as string | undefined;
    const accountNumber = data.authorization?.receiver_bank_account_number as string | undefined;

    let userId: string | undefined = data.metadata?.user_id;

    if (!userId && customerCode) {
      const { data: acct } = await admin
        .from("user_virtual_accounts")
        .select("user_id")
        .eq("customer_code", customerCode)
        .maybeSingle();
      userId = acct?.user_id;
    }
    if (!userId && accountNumber) {
      const { data: acct } = await admin
        .from("user_virtual_accounts")
        .select("user_id")
        .eq("account_number", accountNumber)
        .maybeSingle();
      userId = acct?.user_id;
    }

    if (!userId) {
      console.error("No wallet owner for transfer", customerCode, accountNumber);
      return new Response("no owner", { status: 200, headers: corsHeaders });
    }

    const amountNaira = Number(data.amount || 0) / 100;
    if (amountNaira <= 0) return new Response("ok", { status: 200, headers: corsHeaders });

    const { error } = await admin.rpc("wallet_credit", {
      p_user_id: userId,
      p_amount: amountNaira,
      p_reference: data.reference,
      p_description: "Bank transfer top-up",
      p_metadata: {
        source: "paystack",
        channel: "dedicated_nuban",
        sender: data.authorization?.sender_name ?? null,
        bank: data.authorization?.sender_bank ?? null,
      },
    });

    if (error) {
      console.error("wallet_credit failed", error);
      return new Response("credit failed", { status: 500, headers: corsHeaders });
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("paystack-webhook error", error);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});
