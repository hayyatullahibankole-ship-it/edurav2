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

    // Get the user's result and exam type for this attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('attempts')
      .select(`
        id,
        exam_id,
        exams!inner(type)
      `)
      .eq('id', attemptId)
      .maybeSingle();

    if (attemptError || !attemptData) {
      console.error('Error fetching attempt:', attemptError);
      return new Response(
        JSON.stringify({ error: 'Attempt not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
    const examType = (attemptData.exams as any).type;

    // Get unique students who took this exam type (based on most recent attempt per user)
    const { data: recentAttempts, error: studentsError } = await supabase
      .from('attempts')
      .select(`
        user_id,
        id,
        exam_id,
        submitted_at,
        exams!inner(type)
      `)
      .eq('exams.type', examType)
      .eq('status', 'SUBMITTED')
      .order('submitted_at', { ascending: false });

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to compute rank' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get most recent attempt per user for this exam type
    const userLatestAttempts = new Map();
    recentAttempts?.forEach(attempt => {
      if (!userLatestAttempts.has(attempt.user_id)) {
        userLatestAttempts.set(attempt.user_id, attempt.id);
      }
    });

    const latestAttemptIds = Array.from(userLatestAttempts.values());

    // Get results for these latest attempts
    const { data: allResults, error: resultsError } = await supabase
      .from('results')
      .select('attempt_id, percentage')
      .in('attempt_id', latestAttemptIds);

    if (resultsError) {
      console.error('Error fetching results:', resultsError);
      return new Response(
        JSON.stringify({ error: 'Failed to compute rank' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count unique students
    const totalStudents = allResults?.length || 0;
    
    // Count how many have a higher score
    const higherCount = allResults?.filter(r => Number(r.percentage) > userScore).length || 0;
    
    // Rank is number of people ahead + 1
    const rank = higherCount + 1;

    return new Response(
      JSON.stringify({ rank, total: totalStudents }),
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
