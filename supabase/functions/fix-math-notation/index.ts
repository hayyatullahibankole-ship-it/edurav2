import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { corsHeaders } from '../_shared/cors.ts'

// Enhanced mathematical notation processor for edge function
function processQuestionText(text: string): string {
  if (!text) return '';
  
  let processed = text
    // Fix broken LaTeX first - common issues from the database
    .replace(/\\begin\s+([^\\]+)\s+\\end/g, '\\begin{$1} \\end{$1}')
    .replace(/\\begin\{([^}]+)\}([^\\]*?)\\end\{[^}]*\}/g, '\\begin{$1}$2\\end{$1}')
    .replace(/\$([^$]*[{}][^$]*)\$(?!\$)/g, (match, content) => {
      // Fix unmatched braces in LaTeX
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        content += '}'.repeat(openBraces - closeBraces);
      }
      return `$${content}$`;
    })
    
    // Handle matrices and vectors properly
    .replace(/\\begin\s*\{\s*pmatrix\s*\}\s*([^\\]+)\s*\\end\s*\{\s*pmatrix\s*\}/g, '$\\begin{pmatrix}$1\\end{pmatrix}$')
    .replace(/\\begin\s*\{\s*bmatrix\s*\}\s*([^\\]+)\s*\\end\s*\{\s*bmatrix\s*\}/g, '$\\begin{bmatrix}$1\\end{bmatrix}$')
    .replace(/\\begin\s*\{\s*vmatrix\s*\}\s*([^\\]+)\s*\\end\s*\{\s*vmatrix\s*\}/g, '$\\begin{vmatrix}$1\\end{vmatrix}$')
    
    // Convert matrix notation without proper LaTeX tags
    .replace(/\[\s*([0-9\s\-+.,&\\]+)\s*\]/g, (match, content) => {
      if (content.includes('&') || content.includes('\\\\')) {
        return `$\\begin{bmatrix}${content}\\end{bmatrix}$`;
      }
      return match;
    })
    
    // Handle determinant notation
    .replace(/\|\s*([0-9\s\-+.,&\\]+)\s*\|/g, (match, content) => {
      if (content.includes('&') || content.includes('\\\\')) {
        return `$\\begin{vmatrix}${content}\\end{vmatrix}$`;
      }
      return match;
    })
    
    // Convert vectors
    .replace(/\\vec\s*\{\s*([^}]+)\s*\}/g, '$\\vec{$1}$')
    .replace(/\\vec\s+([a-zA-Z])/g, '$\\vec{$1}$')
    
    // Convert superscript numbers (like x² to x^2)
    .replace(/([a-zA-Z0-9)])(²)/g, '$$1^2$')
    .replace(/([a-zA-Z0-9)])(³)/g, '$$1^3$')
    .replace(/([a-zA-Z0-9)])(⁴)/g, '$$1^4$')
    .replace(/([a-zA-Z0-9)])(⁵)/g, '$$1^5$')
    .replace(/([a-zA-Z0-9)])(⁶)/g, '$$1^6$')
    .replace(/([a-zA-Z0-9)])(⁷)/g, '$$1^7$')
    .replace(/([a-zA-Z0-9)])(⁸)/g, '$$1^8$')
    .replace(/([a-zA-Z0-9)])(⁹)/g, '$$1^9$')
    .replace(/([a-zA-Z0-9)])(⁰)/g, '$$1^0$')
    .replace(/([a-zA-Z0-9)])(¹)/g, '$$1^1$')
    
    // Convert subscript numbers (like H₂O to H_2O)
    .replace(/([a-zA-Z])(₀)/g, '$$1_0$')
    .replace(/([a-zA-Z])(₁)/g, '$$1_1$')
    .replace(/([a-zA-Z])(₂)/g, '$$1_2$')
    .replace(/([a-zA-Z])(₃)/g, '$$1_3$')
    .replace(/([a-zA-Z])(₄)/g, '$$1_4$')
    .replace(/([a-zA-Z])(₅)/g, '$$1_5$')
    .replace(/([a-zA-Z])(₆)/g, '$$1_6$')
    .replace(/([a-zA-Z])(₇)/g, '$$1_7$')
    .replace(/([a-zA-Z])(₈)/g, '$$1_8$')
    .replace(/([a-zA-Z])(₉)/g, '$$1_9$')
    
    // Convert square roots
    .replace(/sqrt\(([^)]+)\)/g, '$\\sqrt{$1}$')
    .replace(/√\(([^)]+)\)/g, '$\\sqrt{$1}$')
    .replace(/√(\d+)/g, '$\\sqrt{$1}$')
    .replace(/√([a-zA-Z]+)/g, '$\\sqrt{$1}$')
    
    // Convert powers like x^2 to proper LaTeX
    .replace(/\b([a-zA-Z]+)\^([0-9]+)\b/g, '$$1^{$2}$')
    .replace(/\b([a-zA-Z]+)\^{([^}]+)}/g, '$$1^{$2}$')
    .replace(/\b(\d+)\^([0-9]+)\b/g, '$$1^{$2}$')
    .replace(/\b(\d+)\^{([^}]+)}/g, '$$1^{$2}$')
    
    // Convert expressions inside parentheses with powers
    .replace(/\(([^)]+)\)\^([0-9]+)/g, '$($1)^{$2}$')
    .replace(/\(([^)]+)\)\^{([^}]+)}/g, '$($1)^{$2}$')
    
    // Convert degree symbol
    .replace(/°C/g, '$°C$')
    .replace(/°F/g, '$°F$')
    .replace(/°/g, '$°$')
    
    // Convert common symbols
    .replace(/×/g, '$\\times$')
    .replace(/÷/g, '$\\div$')
    .replace(/π/g, '$\\pi$')
    .replace(/≤/g, '$\\leq$')
    .replace(/≥/g, '$\\geq$')
    .replace(/≠/g, '$\\neq$')
    .replace(/±/g, '$\\pm$')
    .replace(/∞/g, '$\\infty$')
    .replace(/∑/g, '$\\sum$')
    .replace(/∫/g, '$\\int$')
    .replace(/∂/g, '$\\partial$')
    .replace(/Δ/g, '$\\Delta$')
    .replace(/∇/g, '$\\nabla$')
    .replace(/α/g, '$\\alpha$')
    .replace(/β/g, '$\\beta$')
    .replace(/γ/g, '$\\gamma$')
    .replace(/δ/g, '$\\delta$')
    .replace(/θ/g, '$\\theta$')
    .replace(/λ/g, '$\\lambda$')
    .replace(/μ/g, '$\\mu$')
    .replace(/σ/g, '$\\sigma$')
    .replace(/Ω/g, '$\\Omega$')
    
    // Scientific notation fixes
    .replace(/(\d+(?:\.\d+)?)\s*[xX]\s*10\^{?([+-]?\d+)}?/g, '$$1 \\times 10^{$2}$')
    .replace(/(\d+(?:\.\d+)?)\s*[×]\s*10\^{?([+-]?\d+)}?/g, '$$1 \\times 10^{$2}$')
    
    // Fix common chemistry formulas
    .replace(/\bH2O\b/g, '$H_2O$')
    .replace(/\bCO2\b/g, '$CO_2$')
    .replace(/\bNaCl\b/g, '$NaCl$')
    .replace(/\bH2SO4\b/g, '$H_2SO_4$')
    .replace(/\bCaCO3\b/g, '$CaCO_3$')
    .replace(/\bO2\b/g, '$O_2$')
    .replace(/\bN2\b/g, '$N_2$')
    .replace(/\bNH3\b/g, '$NH_3$')
    .replace(/\bCH4\b/g, '$CH_4$')
    
    // Physics units
    .replace(/m\/s2/g, '$m/s^2$')
    .replace(/kg\.m\/s2/g, '$kg \\cdot m/s^2$')
    .replace(/J\/mol/g, '$J/mol$')
    .replace(/m\/s/g, '$m/s$')
    .replace(/kg\/m³/g, '$kg/m^3$');

  // Clean up multiple dollar signs and fix spacing
  processed = processed
    .replace(/\$\$+/g, '$')
    .replace(/\$\s+/g, '$')
    .replace(/\s+\$/g, '$')
    .replace(/\$([^$]*)\$\$([^$]*)\$/g, '$$$1 $2$$');
  
  return processed;
}

function processQuestionOptions(options: any): any {
  if (!options) return options;
  
  if (Array.isArray(options)) {
    return options.map(option => 
      typeof option === 'string' ? processQuestionText(option) : option
    );
  }
  
  if (typeof options === 'object') {
    const processed: any = {};
    for (const [key, value] of Object.entries(options)) {
      processed[key] = typeof value === 'string' ? processQuestionText(value) : value;
    }
    return processed;
  }
  
  return options;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check admin status
    const { data: isAdminData, error: adminError } = await supabase
      .rpc('is_admin', { _user_id: user.id })

    if (adminError || !isAdminData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Starting mathematical notation fix for all questions...')
    
    let processed = 0
    let updated = 0
    const batchSize = 100
    let lastId = ''
    let hasMore = true
    
    while (hasMore) {
      // Fetch questions in batches using service role
      let query = supabase
        .from('questions')
        .select('id, question_text, options, explanation')
        .eq('is_active', true)
        .limit(batchSize)
        .order('id', { ascending: true })
        
      if (lastId) {
        query = query.gt('id', lastId)
      }
      
      const { data: questions, error } = await query
      
      if (error) {
        console.error('Error fetching questions:', error)
        break
      }
      
      if (!questions || questions.length === 0) {
        hasMore = false
        break
      }
      
      // Process each question
      const updates = []
      for (const question of questions) {
        const processedQuestionText = processQuestionText(question.question_text || '')
        const processedOptions = processQuestionOptions(question.options)
        const processedExplanation = processQuestionText(question.explanation || '')
        
        // Only update if changes were made
        if (processedQuestionText !== question.question_text ||
            JSON.stringify(processedOptions) !== JSON.stringify(question.options) ||
            processedExplanation !== question.explanation) {
          
          updates.push({
            id: question.id,
            question_text: processedQuestionText,
            options: processedOptions,
            explanation: processedExplanation
          })
        }
        
        lastId = question.id
        processed++
      }
      
      // Batch update using service role
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('questions')
          .upsert(updates)
          
        if (updateError) {
          console.error('Error updating questions:', updateError)
        } else {
          console.log(`Updated ${updates.length} questions with mathematical notation fixes`)
          updated += updates.length
        }
      }
      
      if (questions.length < batchSize) {
        hasMore = false
      }
    }
    
    console.log(`Mathematical notation fix completed. Processed ${processed} questions, updated ${updated} questions.`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        processed, 
        updated,
        message: `Successfully processed ${processed} questions and updated ${updated} with proper mathematical notation.`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error in fix-math-notation function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})