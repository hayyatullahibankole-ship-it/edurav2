import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    // Authenticated client (to verify user)
    const authClient = createClient(supabaseUrl, token);
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Admin client (bypass RLS)
    const admin = createClient(supabaseUrl, serviceKey);

    const { student_seats = 50, school, pending } = await req.json().catch(() => ({}));

    // 1) Ensure app user exists
    const authUser = userRes.user;
    const { data: appUser, error: appUserErr } = await admin
      .from("users")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .maybeSingle();

    let appUserId = appUser?.id as string | undefined;
    if (!appUserId) {
      const fullName = (authUser.user_metadata?.full_name as string | undefined) || pending?.adminFullName || (authUser.email?.split("@")[0] ?? "School Admin");
      const firstName = fullName.split(" ")[0] || fullName;
      const lastName = fullName.split(" ").slice(1).join(" ") || "";
      const { data: inserted, error: insertUserErr } = await admin
        .from("users")
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          first_name: firstName,
          last_name: lastName,
          phone: pending?.adminPhone || null,
          is_verified: true,
        })
        .select("id")
        .single();
      if (insertUserErr) throw insertUserErr;
      appUserId = inserted.id;
    }

    // 2) Ensure school exists
    let schoolRecord = school || null;
    if (!schoolRecord) {
      const { data: existingSchool } = await admin
        .from("schools")
        .select("*")
        .eq("admin_user_id", appUserId)
        .maybeSingle();

      schoolRecord = existingSchool ?? null;
    }

    if (!schoolRecord) {
      const fallbackName = pending?.schoolName || (authUser.email ? `${authUser.email.split("@")[0]} School` : "My School");
      const slug = (fallbackName).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const { data: createdSchool, error: schoolErr } = await admin
        .from("schools")
        .insert({
          name: fallbackName,
          slug,
          email: pending?.schoolEmail || authUser.email,
          phone: pending?.schoolPhone || null,
          address: pending?.schoolAddress || null,
          state: pending?.state || null,
          admin_user_id: appUserId,
          is_active: false,
        })
        .select("*")
        .single();
      if (schoolErr) throw schoolErr;
      schoolRecord = createdSchool;
    }

    // 3) Create subscription (1 year)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const { data: sub, error: subErr } = await admin
      .from("school_subscriptions")
      .insert({
        school_id: schoolRecord.id,
        student_seats: student_seats,
        price_per_student: 0,
        total_amount: 0,
        status: "ACTIVE",
        admin_user_id: appUserId,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
      })
      .select("*")
      .single();
    if (subErr) throw subErr;

    // 4) Activate school
    const { error: activateErr } = await admin
      .from("schools")
      .update({ is_active: true })
      .eq("id", schoolRecord.id);
    if (activateErr) throw activateErr;

    return new Response(JSON.stringify({ success: true, school: schoolRecord, subscription: sub }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("activate-free-subscription error", e);
    return new Response(JSON.stringify({ error: (e as any)?.message || "Activation failed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});