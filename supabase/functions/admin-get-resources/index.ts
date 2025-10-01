// Edge Function: admin-get-resources
// Fetch resources and subjects for admins using service role (bypasses RLS logging issues)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization') ?? '';

    // 1) Auth client to validate user and role
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes, error: authError } = await authClient.auth.getUser();
    if (authError || !userRes?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 2) Verify admin role via RPC is_admin
    const { data: isAdmin, error: roleErr } = await authClient.rpc('is_admin', {
      _user_id: userRes.user.id,
    });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 3) Service client to bypass RLS logging side-effects
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const [resourcesResp, subjectsResp] = await Promise.all([
      serviceClient.from('resources').select('*').order('created_at', { ascending: false }),
      serviceClient.from('subjects').select('*').eq('is_active', true),
    ]);

    if (resourcesResp.error) {
      console.error('[admin-get-resources] resources error:', resourcesResp.error);
      return new Response(JSON.stringify({ error: resourcesResp.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    if (subjectsResp.error) {
      console.error('[admin-get-resources] subjects error:', subjectsResp.error);
      return new Response(JSON.stringify({ error: subjectsResp.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = {
      resources: resourcesResp.data ?? [],
      subjects: subjectsResp.data ?? [],
      count: resourcesResp.data?.length ?? 0,
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e) {
    console.error('[admin-get-resources] unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});