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

    // Get the user's percentage for this attempt with retry logic
    let result, resultError;
    for (let i = 0; i < 3; i++) {
      const response = await supabase
        .from('results')
        .select('percentage')
        .eq('attempt_id', attemptId)
        .maybeSingle();
      
      result = response.data;
      resultError = response.error;
      
      // If successful or not a transaction error, break
      if (!resultError || resultError.code !== '25P02') {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }

    if (resultError) {
      console.error('Error fetching result:', resultError);
      // Return default values instead of failing
      return new Response(
        JSON.stringify({ rank: 0, total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!result?.percentage && result?.percentage !== 0) {
      // Return default values instead of 404
      return new Response(
        JSON.stringify({ rank: 0, total: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userScore = Number(result.percentage) || 0;

    // Use approximate counts for better performance
    const { count: totalCount } = await supabase
      .from('results')
      .select('id', { count: 'estimated', head: true });

    const { count: higherCount } = await supabase
      .from('results')
      .select('id', { count: 'estimated', head: true })
      .gt('percentage', userScore);

    // Rank is number of people ahead + 1
    const rank = (higherCount ?? 0) + 1;

    return new Response(
      JSON.stringify({ rank, total: totalCount ?? 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('get-rank error:', err);
    // Return default values instead of error
    return new Response(
      JSON.stringify({ rank: 0, total: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
