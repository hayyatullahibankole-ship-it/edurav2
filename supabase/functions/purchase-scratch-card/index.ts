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

type Pin = { pin: string; serial?: string; extra?: Record<string, unknown> };

/** Naijaresultspin responses vary by product; normalise the common shapes. */
function extractPins(payload: any): Pin[] {
  if (!payload) return [];
  const buckets = [
    payload.pins,
    payload.data?.pins,
    payload.data?.cards,
    payload.cards,
    payload.data,
    payload.result,
  ];

  for (const bucket of buckets) {
    if (Array.isArray(bucket) && bucket.length) {
      const mapped = bucket
        .map((item: any) => {
          if (typeof item === "string") return { pin: item };
          const pin = item?.pin ?? item?.pin_code ?? item?.card_pin ?? item?.token ?? item?.code;
          if (!pin) return null;
          return {
            pin: String(pin),
            serial: item?.serial ?? item?.serial_number ?? item?.serialno ?? undefined,
            extra: item,
          } as Pin;
        })
        .filter(Boolean) as Pin[];
      if (mapped.length) return mapped;
    }
  }

  const single = payload.pin ?? payload.data?.pin ?? payload.card_pin ?? payload.data?.card_pin;
  if (single) {
    return [
      {
        pin: String(single),
        serial: payload.serial ?? payload.data?.serial ?? payload.data?.serial_number,
        extra: payload.data ?? payload,
      },
    ];
  }
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  let orderId: string | null = null;
  let refundContext: { userId: string; amount: number; reference: string } | null = null;

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
    const quantity = Math.floor(Number(body?.quantity ?? 1));
    const paymentMethod = body?.payment_method === "wallet" ? "wallet" : "card";
    const paymentReference =
      typeof body?.payment_reference === "string" ? body.payment_reference.trim() : "";

    if (!serviceId) return json({ error: "service_id is required" }, 400);
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return json({ error: "Quantity must be between 1 and 20" }, 400);
    }
    if (paymentMethod === "card" && !paymentReference) {
      return json({ error: "payment_reference is required for card payment" }, 400);
    }

    const { data: service, error: serviceError } = await admin
      .from("service_catalog")
      .select("id, name, slug, provider, price, product_type, vendor_code, is_active")
      .eq("id", serviceId)
      .maybeSingle();

    if (serviceError || !service) return json({ error: "Service not found" }, 404);
    if (!service.is_active) return json({ error: "This service is unavailable" }, 400);
    if (service.product_type !== "scratch_card") {
      return json({ error: "This service is not an instant scratch card" }, 400);
    }

    const unitPrice = Number(service.price) || 0;
    const amount = unitPrice * quantity;
    if (amount <= 0) return json({ error: "Invalid service price" }, 400);

    // 1. Take payment
    if (paymentMethod === "card") {
      const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackKey) return json({ error: "Payment system not configured" }, 500);

      const { data: existing } = await admin
        .from("scratch_card_orders")
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
        return json({ error: "Payment amount is less than the order total" }, 400);
      }
    } else {
      const walletRef = `sc_${crypto.randomUUID()}`;
      const { error: debitError } = await admin.rpc("wallet_debit", {
        p_user_id: user.id,
        p_amount: amount,
        p_reference: walletRef,
        p_description: `${service.name} x${quantity}`,
        p_metadata: { service_slug: service.slug, quantity },
      });
      if (debitError) {
        console.error("wallet_debit failed", debitError);
        const insufficient = /insufficient/i.test(debitError.message || "");
        return json(
          { error: insufficient ? "Insufficient wallet balance" : debitError.message },
          insufficient ? 400 : 500,
        );
      }
      refundContext = { userId: user.id, amount, reference: walletRef };
    }

    // 2. Record the order
    const { data: order, error: orderError } = await admin
      .from("scratch_card_orders")
      .insert({
        user_id: user.id,
        service_id: service.id,
        service_slug: service.slug,
        service_name: service.name,
        provider: service.provider,
        quantity,
        unit_price: unitPrice,
        amount,
        payment_method: paymentMethod,
        payment_reference: paymentMethod === "card" ? paymentReference : refundContext?.reference,
        status: "processing",
      })
      .select("id")
      .single();

    if (orderError) throw new Error(orderError.message);
    orderId = order.id;

    // 3. Buy the PINs from NaijaResultPins
    const DEFAULT_VENDOR_URL = "https://www.naijaresultpins.com/api/v1/exam-card/buy";
    const configuredUrl = (Deno.env.get("NAIJARESULTSPIN_API_URL") ?? "").trim();
    // The API root accepts GET only. Use a configured URL solely when it points
    // to the vendor's concrete exam-card purchase action.
    const vendorUrl = /\/api\/v1\/exam-card\/buy\/?$/i.test(configuredUrl)
      ? configuredUrl
      : DEFAULT_VENDOR_URL;
    const vendorKey = Deno.env.get("NAIJARESULTSPIN_API_KEY");
    if (!vendorKey) throw new Error("Scratch card vendor is not configured");

    const cardTypeId = Number(service.vendor_code);
    if (!Number.isFinite(cardTypeId) || cardTypeId <= 0) {
      throw new Error(
        "This card is not mapped to the vendor yet (missing card type ID). No card was issued.",
      );
    }

    const vendorRes = await fetch(vendorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${vendorKey}`,
      },
      body: JSON.stringify({
        card_type_id: cardTypeId,
        quantity,
        request_id: order.id,
        reference: order.id,
      }),
    });


    const vendorText = await vendorRes.text();
    let vendorJson: any = null;
    try {
      vendorJson = JSON.parse(vendorText);
    } catch {
      vendorJson = { raw: vendorText };
    }

    if (!vendorRes.ok) {
      console.error(`Vendor request failed [${vendorRes.status}] at ${vendorUrl}: ${vendorText}`);
      if (vendorRes.status === 404 || vendorRes.status === 405) {
        throw new Error(
          "Scratch card vendor endpoint is misconfigured (NAIJARESULTSPIN_API_URL is not a POST purchase endpoint). No card was issued.",
        );
      }
      throw new Error(vendorJson?.message || `Vendor returned ${vendorRes.status}`);
    }

    const pins = extractPins(vendorJson);
    if (!pins.length) {
      console.error("Vendor returned no pins:", vendorText);
      throw new Error(vendorJson?.message || "Vendor did not return any PIN");
    }

    await admin
      .from("scratch_card_orders")
      .update({
        status: "completed",
        pins,
        vendor_reference: vendorJson?.reference ?? vendorJson?.data?.reference ?? null,
        vendor_response: vendorJson,
      })
      .eq("id", order.id);

    return json({ success: true, order_id: order.id, pins, amount, quantity });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    console.error("purchase-scratch-card error:", message);

    if (refundContext) {
      const { error: refundError } = await admin.rpc("wallet_credit", {
        p_user_id: refundContext.userId,
        p_amount: refundContext.amount,
        p_reference: `refund_${refundContext.reference}`,
        p_description: "Refund: scratch card purchase failed",
        p_metadata: { refund_of: refundContext.reference },
      });
      if (refundError) console.error("Refund failed", refundError);
    }

    if (orderId) {
      await admin
        .from("scratch_card_orders")
        .update({ status: "failed", error_message: message })
        .eq("id", orderId);
    }

    return json({ error: message, refunded: !!refundContext }, 500);
  }
});
