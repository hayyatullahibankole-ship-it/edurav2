import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

type Body = {
  /** Supabase Auth user id (auth.users.id) */
  authUserId?: string;
  /** Backwards compatible alias (treated as authUserId) */
  userId?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ success: false, error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as Body;
    const authUserId = body.authUserId || body.userId;

    if (!authUserId) {
      return new Response(JSON.stringify({ success: false, error: "Missing authUserId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticated client (uses caller JWT)
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role via DB function
    const { data: isAdmin, error: roleErr } = await authClient.rpc("is_admin", { _user_id: userRes.user.id });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Privileged write (service role)
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Update the public.users table (match by auth_user_id)
    const { data: updatedProfiles, error: updateErr } = await serviceClient
      .from("users")
      .update({ is_verified: true })
      .eq("auth_user_id", authUserId)
      .select("id");

    if (updateErr) {
      console.error("Failed to verify user in public.users:", updateErr);
      return new Response(JSON.stringify({ success: false, error: updateErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "User profile not found for authUserId" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // CRITICAL: Also update auth.users email_confirmed_at to allow login
    const { error: authErr } = await serviceClient.auth.admin.updateUserById(authUserId, {
      email_confirm: true,
    });

    if (authErr) {
      console.error("Failed to confirm email in auth.users:", authErr);
      return new Response(JSON.stringify({ success: false, error: authErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(
      "Successfully verified auth user:",
      authUserId,
      "profile_id:",
      updatedProfiles[0]?.id,
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-verify-user error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
