import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all questions with correct_answer = 0
    const { data: questions, error: fetchError } = await supabaseClient
      .from('questions')
      .select('id, question_text, explanation, options')
      .eq('correct_answer', 0)
      .eq('is_active', true);

    if (fetchError) throw fetchError;

    let fixedCount = 0;
    let notFoundCount = 0;
    const updates = [];

    for (const question of questions || []) {
      const text = `${question.question_text} ${question.explanation || ''}`.toLowerCase();
      
      // Look for answer patterns
      let detectedAnswer: number | null = null;
      
      // Pattern 1: "answer: B" or "answer:B"
      const answerMatch = text.match(/answer\s*:\s*([a-e])/i);
      if (answerMatch) {
        detectedAnswer = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
      }
      
      // Pattern 2: "correct: C" or "correct answer: C"
      if (detectedAnswer === null) {
        const correctMatch = text.match(/correct\s*(?:answer)?\s*:\s*([a-e])/i);
        if (correctMatch) {
          detectedAnswer = correctMatch[1].toUpperCase().charCodeAt(0) - 65;
        }
      }
      
      // Pattern 3: "option B is correct"
      if (detectedAnswer === null) {
        const optionMatch = text.match(/option\s+([a-e])\s+is\s+correct/i);
        if (optionMatch) {
          detectedAnswer = optionMatch[1].toUpperCase().charCodeAt(0) - 65;
        }
      }
      
      // Validate against available options
      const optionsCount = Array.isArray(question.options) ? question.options.length : 4;
      if (detectedAnswer !== null && detectedAnswer >= 0 && detectedAnswer < optionsCount) {
        updates.push({
          id: question.id,
          correct_answer: detectedAnswer
        });
        fixedCount++;
      } else {
        notFoundCount++;
      }
    }

    // Batch update
    if (updates.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const update of batch) {
          await supabaseClient
            .from('questions')
            .update({ correct_answer: update.correct_answer })
            .eq('id', update.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: questions?.length || 0,
        fixed: fixedCount,
        notFound: notFoundCount,
        message: `Fixed ${fixedCount} questions. ${notFoundCount} questions could not be auto-detected and need manual review.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
