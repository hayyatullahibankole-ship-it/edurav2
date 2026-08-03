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

const tierFee = (formFee: number) => {
  if (formFee <= 5000) return 3000;
  if (formFee < 10000) return 4000;
  return 5000;
};

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
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const serviceId = typeof body?.service_id === "string" ? body.service_id : "";
    const institutionId = typeof body?.institution_id === "string" ? body.institution_id : "";
    const quoteRequestId = typeof body?.request_id === "string" ? body.request_id : "";
    const paymentMethod = body?.payment_method === "wallet" ? "wallet" : "card";
    const paymentReference =
      typeof body?.payment_reference === "string" ? body.payment_reference.trim() : "";

    if (paymentMethod === "card" && !paymentReference) {
      return json({ error: "payment_reference is required for card payment" }, 400);
    }

    // ---- Paying an admin-quoted request -------------------------------------
    if (quoteRequestId) {
      const { data: quoteReq } = await admin
        .from("service_requests")
        .select("id, user_id, service_name, quoted_amount, quote_status, status")
        .eq("id", quoteRequestId)
        .maybeSingle();

      if (!quoteReq || quoteReq.user_id !== user.id) {
        return json({ error: "Request not found" }, 404);
      }
      if (quoteReq.quote_status !== "quoted") {
        return json({ error: "This request has not been priced yet" }, 400);
      }
      const quoteAmount = Number(quoteReq.quoted_amount) || 0;
      if (quoteAmount <= 0) return json({ error: "Invalid quote amount" }, 400);

      const charged = await takePayment(admin, {
        user,
        amount: quoteAmount,
        paymentMethod,
        paymentReference,
        label: quoteReq.service_name,
      });
      if ("error" in charged) return json({ error: charged.error }, charged.status);

      const { error: updateError } = await admin
        .from("service_requests")
        .update({
          amount: quoteAmount,
          status: "awaiting_details",
          quote_status: "paid",
          paid_from: paymentMethod,
          payment_reference: charged.reference,
        })
        .eq("id", quoteRequestId);

      if (updateError) {
        console.error("quote payment update failed", updateError);
        return json({ error: "Payment taken but request could not be updated. Contact support." }, 500);
      }
      return json({ success: true, request_id: quoteRequestId, payment_reference: charged.reference });
    }

    // ---- Normal / institution-priced service --------------------------------
    if (!serviceId) return json({ error: "service_id is required" }, 400);

    const { data: service, error: serviceError } = await admin
      .from("service_catalog")
      .select("id, name, slug, provider, price, product_type, is_active, pricing_mode")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceError || !service) return json({ error: "Service not found" }, 404);
    if (!service.is_active) return json({ error: "This service is unavailable" }, 400);
    if (service.product_type === "scratch_card") {
      return json({ error: "Use the instant scratch card checkout for this service" }, 400);
    }

    let amount = Number(service.price) || 0;
    let formFee: number | null = null;
    let serviceFee: number | null = null;
    let institutionName: string | null = null;

    if (service.pricing_mode === "institution") {
      if (!institutionId) return json({ error: "Please choose an institution" }, 400);
      const { data: institution } = await admin
        .from("institutions")
        .select("id, name, form_fee, service_fee_override, is_active")
        .eq("id", institutionId)
        .maybeSingle();

      if (!institution || !institution.is_active) {
        return json({ error: "Institution not found" }, 404);
      }
      formFee = Number(institution.form_fee) || 0;
      serviceFee =
        institution.service_fee_override !== null && institution.service_fee_override !== undefined
          ? Number(institution.service_fee_override)
          : tierFee(formFee);
      institutionName = institution.name;
      amount = formFee + serviceFee;
    }

    if (amount <= 0) return json({ error: "Invalid service price" }, 400);

    const charged = await takePayment(admin, {
      user,
      amount,
      paymentMethod,
      paymentReference,
      label: institutionName ? `${service.name} — ${institutionName}` : service.name,
    });
    if ("error" in charged) return json({ error: charged.error }, charged.status);

    const { data: request, error: insertError } = await admin
      .from("service_requests")
      .insert({
        user_id: user.id,
        service_id: service.id,
        service_slug: service.slug,
        service_name: service.name,
        provider: service.provider,
        amount,
        institution_id: institutionId || null,
        institution_name: institutionName,
        form_fee: formFee,
        service_fee: serviceFee,
        form_data: {},
        status: "awaiting_details",
        paid_from: paymentMethod,
        payment_reference: charged.reference,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !request) {
      console.error("insert service_request failed", insertError);
      if (paymentMethod === "wallet") {
        await admin.rpc("wallet_credit", {
          p_user_id: user.id,
          p_amount: amount,
          p_reference: `refund_${charged.reference}`,
          p_description: `Refund for ${service.name}`,
        });
      }
      return json({ error: "Payment taken but request could not be created. Contact support." }, 500);
    }

    return json({ success: true, request_id: request.id, payment_reference: charged.reference });
  } catch (err) {
    console.error("pay-service-request error", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});

type ChargeArgs = {
  user: { id: string };
  amount: number;
  paymentMethod: "wallet" | "card";
  paymentReference: string;
  label: string;
};

async function takePayment(
  admin: ReturnType<typeof createClient>,
  { user, amount, paymentMethod, paymentReference, label }: ChargeArgs,
): Promise<{ reference: string } | { error: string; status: number }> {
  if (paymentMethod === "card") {
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackKey) return { error: "Payment system not configured", status: 500 };

    const { data: existing } = await admin
      .from("service_requests")
      .select("id")
      .eq("payment_reference", paymentReference)
      .maybeSingle();
    if (existing) return { error: "This payment has already been used", status: 400 };

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${paymentReference}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } },
    );
    const verify = await verifyRes.json();
    if (!verifyRes.ok || verify?.data?.status !== "success") {
      console.error("Paystack verify failed", verifyRes.status, JSON.stringify(verify));
      return { error: "Payment could not be verified", status: 400 };
    }
    if (Number(verify.data.amount || 0) / 100 < amount) {
      return { error: "Payment amount is less than the price", status: 400 };
    }
    return { reference: paymentReference };
  }

  const reference = `sr_${crypto.randomUUID()}`;
  const { error: debitError } = await admin.rpc("wallet_debit", {
    p_user_id: user.id,
    p_amount: amount,
    p_reference: reference,
    p_description: `Payment for ${label}`,
  });
  if (debitError) {
    console.error("wallet_debit failed", debitError);
    const message = String(debitError.message || "");
    return {
      error: message.toLowerCase().includes("insufficient")
        ? "Insufficient wallet balance"
        : "Could not debit wallet",
      status: 400,
    };
  }
  return { reference };
}
