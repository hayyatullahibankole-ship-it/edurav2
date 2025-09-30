// Edge function: admin-get-billing
// Securely fetches plans, subscriptions, and transactions for the admin dashboard
// Uses service role for consistent reads and verifies caller is an authenticated admin

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "*",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth client using the caller's JWT to verify identity and role
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Admin client bypasses RLS for stable reads
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify caller
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role via DB function
    const { data: isAdmin, error: roleErr } = await authClient.rpc("is_admin", { _user_id: userRes.user.id });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional body params
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const limit = Math.min(typeof body.limit === "number" ? body.limit : 1000, 1000);

    // Fetch data in parallel
    const [plansRes, subsRes, txRes] = await Promise.all([
      adminClient
        .from("subscription_plans")
        .select("*")
        .order("price", { ascending: true }),
      adminClient
        .from("subscriptions")
        .select(
          `*,
           users:users(id, first_name, last_name, email),
           subscription_plans:subscription_plans(id, name, price, currency)`
        )
        .order("created_at", { ascending: false })
        .limit(limit),
      adminClient
        .from("transactions")
        .select(`*, users:users(id, first_name, last_name, email)`) 
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    if (plansRes.error) throw plansRes.error;
    if (subsRes.error) throw subsRes.error;
    if (txRes.error) throw txRes.error;

    return new Response(
      JSON.stringify({
        plans: plansRes.data || [],
        subscriptions: subsRes.data || [],
        transactions: txRes.data || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
