import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, payload } = await req.json();
    
    console.log('Exam API request:', { action, timestamp: new Date().toISOString() });

    switch (action) {
      case 'get_questions': {
        const { questionIds, attemptId } = payload;
        
        // Validate input
        if (!questionIds || !Array.isArray(questionIds) || !attemptId) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Use secure function to get questions without answers
        const { data: questions, error } = await supabaseClient
          .rpc('get_exam_questions_secure', { exam_question_ids: questionIds });

        if (error) {
          console.error('Error fetching questions:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch questions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ questions }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'submit_answers': {
        const { attemptId, answers } = payload;
        
        // Validate input
        if (!attemptId || !answers || !Array.isArray(answers)) {
          return new Response(
            JSON.stringify({ error: 'Missing required parameters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate each answer and calculate score
        let correctCount = 0;
        const validatedAnswers = [];

        for (const answer of answers) {
          const { question_id, submitted_answer } = answer;
          
          // Validate answer format
          const { data: isValid, error } = await supabaseClient
            .rpc('validate_question_answer', { 
              question_id, 
              submitted_answer 
            });

          if (error) {
            console.error('Error validating answer:', error);
            continue;
          }

          if (isValid) {
            correctCount++;
          }

          validatedAnswers.push({
            ...answer,
            is_correct: isValid
          });
        }

        // Insert validated answers
        const { error: insertError } = await supabaseClient
          .from('attempt_answers')
          .insert(validatedAnswers);

        if (insertError) {
          console.error('Error inserting answers:', insertError);
          return new Response(
            JSON.stringify({ error: 'Failed to save answers' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Calculate and insert result
        const totalQuestions = answers.length;
        const percentage = (correctCount / totalQuestions) * 100;

        const { error: resultError } = await supabaseClient
          .from('results')
          .insert({
            attempt_id: attemptId,
            raw_score: correctCount,
            total_questions: totalQuestions,
            correct_answers: correctCount,
            wrong_answers: totalQuestions - correctCount,
            percentage: percentage,
            auto_graded: true
          });

        if (resultError) {
          console.error('Error inserting result:', resultError);
          return new Response(
            JSON.stringify({ error: 'Failed to save result' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            score: correctCount,
            totalQuestions,
            percentage 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Exam API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});