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

/** Same tiered pricing the subscription page shows. */
function pricePerSeat(seats: number) {
  if (seats <= 0) return 0;
  if (seats <= 50) return 1000;
  if (seats <= 100) return 900;
  if (seats <= 200) return 850;
  if (seats <= 250) return 800;
  return 0; // 250+ is a manual/contact-support quote
}

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
    const seats = Math.floor(Number(body?.seats ?? 0));
    const seatsOnly = body?.mode === "seats_only";

    if (!Number.isFinite(seats) || seats < 1 || seats > 250) {
      return json({ error: "Seats must be between 1 and 250" }, 400);
    }

    // Resolve the admin's public profile (wallets are keyed to it)
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

    // Resolve the school this admin owns
    const { data: school } = await admin
      .from("schools")
      .select("id, name, max_students, students_added")
      .eq("admin_user_id", profileId)
      .maybeSingle();
    if (!school) return json({ error: "No school found for your account" }, 404);

    const unit = pricePerSeat(seats);
    if (unit <= 0) {
      return json({ error: "For 250+ students please contact support for a quote" }, 400);
    }
    const amount = unit * seats;

    const { data: walletRow } = await admin
      .from("user_wallets")
      .select("balance")
      .eq("user_id", profileId)
      .maybeSingle();
    const balance = Number(walletRow?.balance ?? 0);
    if (balance < amount) {
      return json(
        { error: "Insufficient wallet balance", balance, amount, shortfall: amount - balance },
        400,
      );
    }

    // Existing active subscription (needed for top-ups)
    const { data: current } = await admin
      .from("school_subscriptions")
      .select("id, student_seats, end_date, status")
      .eq("school_id", school.id)
      .eq("status", "ACTIVE")
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (seatsOnly && !current) {
      return json({ error: "You have no active subscription to add seats to" }, 400);
    }

    const reference = `school_wallet_${crypto.randomUUID()}`;
    const { error: debitError } = await admin.rpc("wallet_debit", {
      p_user_id: profileId,
      p_amount: amount,
      p_reference: reference,
      p_description: seatsOnly
        ? `${seats} extra student seats — ${school.name}`
        : `School subscription (${seats} seats) — ${school.name}`,
      p_metadata: { type: "school_subscription", school_id: school.id, seats, seats_only: seatsOnly },
    });
    if (debitError) {
      const message = String(debitError.message || "").toLowerCase();
      console.error("wallet_debit failed", debitError);
      return json(
        {
          error: message.includes("insufficient")
            ? "Insufficient wallet balance"
            : "Could not debit wallet",
        },
        400,
      );
    }

    const refund = async (reason: string) => {
      await admin.rpc("wallet_credit", {
        p_user_id: profileId,
        p_amount: amount,
        p_reference: `refund_${reference}`,
        p_description: `Refund — ${reason}`,
      });
    };

    let endDate: string;
    try {
      if (seatsOnly && current) {
        endDate = current.end_date as string;
        const newSeats = Number(current.student_seats || 0) + seats;
        const { error } = await admin
          .from("school_subscriptions")
          .update({ student_seats: newSeats, updated_at: new Date().toISOString() })
          .eq("id", current.id);
        if (error) throw new Error(error.message);

        await admin
          .from("schools")
          .update({ max_students: newSeats, is_active: true })
          .eq("id", school.id);
      } else {
        const start = new Date();
        const end = new Date();
        end.setMonth(end.getMonth() + 3);
        endDate = end.toISOString();

        const carriedSeats = Number(current?.student_seats || 0);
        const totalSeats = carriedSeats + seats;

        const { error } = await admin.from("school_subscriptions").insert({
          school_id: school.id,
          admin_user_id: profileId,
          status: "ACTIVE",
          start_date: start.toISOString(),
          end_date: endDate,
          student_seats: totalSeats,
          used_seats: Number(school.students_added || 0),
          price_per_student: unit,
          total_amount: amount,
          payment_reference: reference,
          auto_renew: false,
        });
        if (error) throw new Error(error.message);

        if (current) {
          await admin
            .from("school_subscriptions")
            .update({ status: "EXPIRED" })
            .eq("id", current.id);
        }

        await admin
          .from("schools")
          .update({ max_students: totalSeats, is_active: true })
          .eq("id", school.id);
      }
    } catch (err) {
      console.error("school subscription write failed", err);
      await refund("school subscription could not be activated");
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
      metadata: { school_subscription: true, school_id: school.id, seats, seats_only: seatsOnly },
    });

    return json({
      success: true,
      seats,
      amount,
      reference,
      expires_at: endDate,
      balance: balance - amount,
    });
  } catch (err) {
    console.error("pay-school-subscription-wallet error", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
