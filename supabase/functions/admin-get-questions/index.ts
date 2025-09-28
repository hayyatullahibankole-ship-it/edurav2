// Edge function: admin-get-questions
// Securely fetches questions for the admin dashboard using the service role
// Only accessible to authenticated admins

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

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify user
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userRes.user;

    // Check admin role using DB function
    const { data: isAdmin, error: roleErr } = await authClient.rpc("is_admin", { _user_id: user.id });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Read params
    const isPost = req.method === "POST";
    const body = isPost ? await req.json().catch(() => ({})) : {};
    const activeOnly = body.activeOnly !== false; // default true
    const limit = typeof body.limit === "number" ? Math.min(body.limit, 2000) : 1000;

    const query = adminClient
      .from("questions")
      .select(
        `id, question_text, type, options, correct_answer, explanation, difficulty_level, tags, subject_id, is_active, points, created_at`
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (activeOnly) query.eq("is_active", true);

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: data || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});