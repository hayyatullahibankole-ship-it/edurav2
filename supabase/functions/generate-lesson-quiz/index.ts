import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonContent, lessonTitle, questionCount = 10 } = await req.json();

    if (!lessonContent) {
      throw new Error('Lesson content is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate questions using AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator. Generate ${questionCount} multiple-choice quiz questions based on the provided lesson content. 

Each question should:
- Test understanding of key concepts
- Have 4 answer options (A, B, C, D)
- Include the correct answer index (0-3)
- Include a brief explanation

Return ONLY valid JSON array with this exact structure:
[
  {
    "question_text": "string",
    "options": ["option A", "option B", "option C", "option D"],
    "correct_answer": 0,
    "explanation": "string"
  }
]`
          },
          {
            role: 'user',
            content: `Lesson Title: ${lessonTitle}\n\nLesson Content:\n${lessonContent}\n\nGenerate ${questionCount} quiz questions.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from AI');
    }

    // Parse the AI response - it might be wrapped in markdown code blocks
    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse generated questions');
    }

    // Validate and format questions
    const formattedQuestions = questions.map((q: any) => ({
      question_text: q.question_text,
      options: Array.isArray(q.options) ? q.options : Object.values(q.options || {}),
      correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer : 0,
      explanation: q.explanation || 'No explanation provided'
    }));

    return new Response(
      JSON.stringify({ questions: formattedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating quiz:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
