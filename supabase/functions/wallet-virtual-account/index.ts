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

    // Pull profile details for names / phone and create the missing public profile
    // on the fly for first-time users who have just landed in auth but not yet
    // had a synced `public.users` row.
    let profile = null as
      | {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          email?: string | null;
        }
      | null;

    const { data: existingProfile, error: existingProfileError } = await admin
      .from("users")
      .select("id, first_name, last_name, phone, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (existingProfileError && existingProfileError.code !== "PGRST116") {
      console.warn("Profile lookup failed for DVA creation", existingProfileError);
    }

    if (existingProfile?.id) {
      profile = existingProfile;
    } else {
      const nameMeta = String(user.user_metadata?.full_name ?? "").trim();
      const firstNameMeta = String(user.user_metadata?.first_name ?? "").trim();
      const lastNameMeta = String(user.user_metadata?.last_name ?? "").trim();
      const fallbackProfileName = nameMeta || [firstNameMeta, lastNameMeta].filter(Boolean).join(" ");
      const profileInsertPayload = {
        auth_user_id: user.id,
        email: user.email,
        first_name: firstNameMeta || (fallbackProfileName ? fallbackProfileName.split(/\s+/)[0] : null),
        last_name:
          lastNameMeta ||
          (fallbackProfileName ? fallbackProfileName.split(/\s+/).slice(1).join(" ") || null : null),
        phone: (user.user_metadata?.phone as string | undefined) || null,
        is_verified: !!user.email_confirmed_at,
      };

      const { data: createdProfile, error: createProfileError } = await admin
        .from("users")
        .insert(profileInsertPayload)
        .select("id, first_name, last_name, phone, email")
        .single();

      if (createProfileError) {
        console.warn("Auto-create missing profile failed for DVA creation", createProfileError);
      } else {
        profile = createdProfile;
      }
    }

    const rawName =
      (typeof body?.full_name === "string" && body.full_name.trim()) ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
      (user.user_metadata?.full_name as string | undefined) ||
      (user.email?.split("@")[0] ?? "Edura User");
    const parts = String(rawName).trim().split(/\s+/);
    const firstName = parts[0] || "Edura";
    const lastName = parts.slice(1).join(" ") || "User";
    const phone =
      (typeof body?.phone === "string" && body.phone.trim()) ||
      (profile?.phone as string | undefined) ||
      (user.user_metadata?.phone as string | undefined) ||
      undefined;

    // 1. Create (or fetch) the Paystack customer.
    // Paystack can reject duplicate customer creation, so we must make the
    // lookup-by-email path resilient and use the correct customer lookup API.
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

    const extractCustomerCode = (payload: unknown) => {
      if (!payload || typeof payload !== "object") return undefined;
      const data = payload as {
        data?: {
          customer_code?: string;
          customer?: { customer_code?: string };
          customer_code?: string;
        } | Array<{ customer_code?: string }>;
      };

      if (Array.isArray(data.data)) {
        return data.data[0]?.customer_code;
      }

      return data.data?.customer_code || data.data?.customer?.customer_code;
    };

    if (!customerCode && user.email) {
      const customerLookup = await paystack(
        `/customer?email=${encodeURIComponent(user.email)}`,
        key,
      );
      customerCode = extractCustomerCode(customerLookup.body);
    }

    if (!customerCode && user.email) {
      const fallbackLookup = await paystack(`/customer/${encodeURIComponent(user.email)}`, key);
      customerCode = extractCustomerCode(fallbackLookup.body);
    }

    if (!customerCode) {
      console.error("Paystack customer creation failed", JSON.stringify(customerRes.body));
      return json(
        {
          error:
            customerRes.body?.message ||
            (phone
              ? "Could not create payment profile"
              : "Please add a phone number to your Edura profile so Paystack can create your dedicated account."),
        },
        400,
      );
    }

    // 2. Assign a dedicated NUBAN
    const isTest = key.startsWith("sk_test");
    const configuredBank = (Deno.env.get("PAYSTACK_DVA_BANK") || "").trim();

    const dvaPayload: Record<string, string> = { customer: customerCode };
    if (!isTest && configuredBank) {
      dvaPayload.preferred_bank = configuredBank;
    }

    const dvaRes = await paystack("/dedicated_account", key, {
      method: "POST",
      body: JSON.stringify(dvaPayload),
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
      bank_name: dva.bank?.name ?? configuredBank || "Paystack",
      bank_slug: dva.bank?.slug ?? configuredBank || "paystack",
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
