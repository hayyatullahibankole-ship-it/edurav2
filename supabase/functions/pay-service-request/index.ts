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
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const serviceId = typeof body?.service_id === "string" ? body.service_id : "";
    const paymentMethod = body?.payment_method === "wallet" ? "wallet" : "card";
    const paymentReference =
      typeof body?.payment_reference === "string" ? body.payment_reference.trim() : "";

    if (!serviceId) return json({ error: "service_id is required" }, 400);
    if (paymentMethod === "card" && !paymentReference) {
      return json({ error: "payment_reference is required for card payment" }, 400);
    }

    const { data: service, error: serviceError } = await admin
      .from("service_catalog")
      .select("id, name, slug, provider, price, product_type, is_active")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceError || !service) return json({ error: "Service not found" }, 404);
    if (!service.is_active) return json({ error: "This service is unavailable" }, 400);
    if (service.product_type === "scratch_card") {
      return json({ error: "Use the instant scratch card checkout for this service" }, 400);
    }

    const amount = Number(service.price) || 0;
    if (amount <= 0) return json({ error: "Invalid service price" }, 400);

    let reference = paymentReference;

    if (paymentMethod === "card") {
      const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackKey) return json({ error: "Payment system not configured" }, 500);

      const { data: existing } = await admin
        .from("service_requests")
        .select("id")
        .eq("payment_reference", paymentReference)
        .maybeSingle();
      if (existing) return json({ error: "This payment has already been used" }, 400);

      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${paymentReference}`,
        { headers: { Authorization: `Bearer ${paystackKey}` } },
      );
      const verify = await verifyRes.json();
      if (!verifyRes.ok || verify?.data?.status !== "success") {
        console.error("Paystack verify failed", verifyRes.status, JSON.stringify(verify));
        return json({ error: "Payment could not be verified" }, 400);
      }
      if (Number(verify.data.amount || 0) / 100 < amount) {
        return json({ error: "Payment amount is less than the service price" }, 400);
      }
    } else {
      reference = `sr_${crypto.randomUUID()}`;
      const { error: debitError } = await admin.rpc("wallet_debit", {
        p_user_id: user.id,
        p_amount: amount,
        p_reference: reference,
        p_description: `Payment for ${service.name}`,
      });
      if (debitError) {
        console.error("wallet_debit failed", debitError);
        const message = String(debitError.message || "");
        return json(
          {
            error: message.toLowerCase().includes("insufficient")
              ? "Insufficient wallet balance"
              : "Could not debit wallet",
          },
          400,
        );
      }
    }

    const { data: request, error: insertError } = await admin
      .from("service_requests")
      .insert({
        user_id: user.id,
        service_id: service.id,
        service_slug: service.slug,
        service_name: service.name,
        provider: service.provider,
        amount,
        form_data: {},
        status: "awaiting_details",
        paid_from: paymentMethod,
        payment_reference: reference,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !request) {
      console.error("insert service_request failed", insertError);
      if (paymentMethod === "wallet") {
        await admin.rpc("wallet_credit", {
          p_user_id: user.id,
          p_amount: amount,
          p_reference: `refund_${reference}`,
          p_description: `Refund for ${service.name}`,
        });
      }
      return json({ error: "Payment taken but request could not be created. Contact support." }, 500);
    }

    return json({ success: true, request_id: request.id, payment_reference: reference });
  } catch (err) {
    console.error("pay-service-request error", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
