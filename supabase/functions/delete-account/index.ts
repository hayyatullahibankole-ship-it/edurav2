import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "No authorization header" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ error: "Invalid or expired token" }, 401);

    const userId = user.id;
    console.log("Deleting account for", userId);

    // Best-effort cleanup of user-owned rows. Tables that don't exist are skipped.
    const tables = [
      "test_results",
      "test_sessions",
      "user_answers",
      "study_sessions",
      "study_plans",
      "notifications",
      "user_settings",
      "user_wallets",
      "wallet_transactions",
      "scratch_card_orders",
      "service_requests",
      "ebook_access",
      "forum_posts",
      "forum_comments",
      "user_roles",
      "subscriptions",
      "profiles",
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error && !/does not exist|column .* does not exist/i.test(error.message)) {
        console.log(`cleanup ${table}: ${error.message}`);
      }
    }
    // profiles may key on id instead of user_id
    await supabase.from("profiles").delete().eq("id", userId);

    // Remove stored files
    for (const bucket of ["uploads", "avatars"]) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
        if (files?.length) {
          await supabase.storage.from(bucket).remove(files.map((f) => `${userId}/${f.name}`));
        }
      } catch (_) { /* bucket may not exist */ }
    }

    const { error: delError } = await supabase.auth.admin.deleteUser(userId);
    if (delError) return json({ error: delError.message }, 400);

    return json({ success: true, message: "Account permanently deleted" });
  } catch (e) {
    console.error("delete-account error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
