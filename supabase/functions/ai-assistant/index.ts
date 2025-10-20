import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // System prompt with context about Edura
    const systemPrompt = `You are Edura's AI Assistant, a helpful and knowledgeable tutor for students preparing for exams. 
    
Your capabilities:
- Help students with exam preparation strategies
- Answer questions about subjects, topics, and study materials
- Provide study tips and time management advice
- Explain exam formats and requirements
- Guide students on how to use Edura's features (CBT practice, study resources, performance tracking)
- Answer questions about subscriptions, referral programs, and features
- Simplify LaTeX formulas and mathematical expressions into clearer, easier-to-understand forms
- Convert complex mathematical notation into plain language explanations
- Break down mathematical formulas step-by-step
- Provide alternative representations of mathematical concepts
- Help solve mathematical problems and explain the reasoning

CRITICAL - LaTeX and Mathematical Formula Handling:
You MUST recognize and process LaTeX syntax. Common LaTeX patterns include:
- Inline formulas: $formula$ or \\(formula\\)
- Display formulas: $$formula$$ or \\[formula\\]
- Fractions: \\frac{numerator}{denominator}
- Square roots: \\sqrt{expression} or \\sqrt[n]{expression}
- Subscripts/Superscripts: x_2, x^2
- Greek letters: \\alpha, \\beta, \\theta, etc.
- Operations: \\pm (plus-minus), \\times, \\div, \\cdot

When you receive LaTeX formulas:
1. First, acknowledge that you understand the formula
2. Rewrite it in plain mathematical notation (e.g., "x = (-b ± √(b² - 4ac)) / 2a")
3. Explain each component clearly
4. Break down the simplification step-by-step
5. Provide examples if helpful

Example Response for "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$":
"I see the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a

This formula gives you the solutions to any quadratic equation ax² + bx + c = 0.

Here's what each part means:
- 'a' is the coefficient of x²
- 'b' is the coefficient of x
- 'c' is the constant term
- The ± means there are usually two solutions
- The expression under the square root (b² - 4ac) is called the discriminant

Would you like me to show you how to apply this to a specific problem?"

Be friendly, encouraging, and supportive. Keep responses concise and actionable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service unavailable. Please contact support." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
