import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { attemptId } = await req.json();

    if (!attemptId) {
      return new Response(
        JSON.stringify({ error: 'attemptId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user's percentage for this attempt
    const { data: result, error: resultError } = await supabase
      .from('results')
      .select('percentage')
      .eq('attempt_id', attemptId)
      .maybeSingle();

    if (resultError) {
      console.error('Error fetching result:', resultError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!result?.percentage && result?.percentage !== 0) {
      return new Response(
        JSON.stringify({ error: 'Result not found for attempt' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userScore = Number(result.percentage) || 0;

    // Total number of results
    const { count: totalCount, error: totalError } = await supabase
      .from('results')
      .select('id', { count: 'exact', head: true });

    if (totalError) {
      console.error('Error counting total results:', totalError);
      return new Response(
        JSON.stringify({ error: 'Failed to compute rank' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count how many results have a higher score
    const { count: higherCount, error: higherError } = await supabase
      .from('results')
      .select('id', { count: 'exact', head: true })
      .gt('percentage', userScore);

    if (higherError) {
      console.error('Error counting higher scores:', higherError);
      return new Response(
        JSON.stringify({ error: 'Failed to compute rank' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rank is number of people ahead + 1
    const rank = (higherCount ?? 0) + 1;

    return new Response(
      JSON.stringify({ rank, total: totalCount ?? 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('get-rank error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
