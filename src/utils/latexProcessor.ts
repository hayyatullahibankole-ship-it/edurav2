// Utility to process and enhance LaTeX rendering in questions

export function processQuestionText(text: string): string {
  if (!text) return '';
  
  // Convert common math expressions to LaTeX format
  let processed = text
    // Convert superscript numbers (like x² to x^2)
    .replace(/([a-zA-Z0-9)])(²)/g, '$1^2')
    .replace(/([a-zA-Z0-9)])(³)/g, '$1^3')
    .replace(/([a-zA-Z0-9)])(⁴)/g, '$1^4')
    .replace(/([a-zA-Z0-9)])(⁵)/g, '$1^5')
    .replace(/([a-zA-Z0-9)])(⁶)/g, '$1^6')
    .replace(/([a-zA-Z0-9)])(⁷)/g, '$1^7')
    .replace(/([a-zA-Z0-9)])(⁸)/g, '$1^8')
    .replace(/([a-zA-Z0-9)])(⁹)/g, '$1^9')
    .replace(/([a-zA-Z0-9)])(⁰)/g, '$1^0')
    .replace(/([a-zA-Z0-9)])(¹)/g, '$1^1')
    
    // Convert subscript numbers (like H₂O to H_2O)
    .replace(/([a-zA-Z])(₀)/g, '$1_0')
    .replace(/([a-zA-Z])(₁)/g, '$1_1')
    .replace(/([a-zA-Z])(₂)/g, '$1_2')
    .replace(/([a-zA-Z])(₃)/g, '$1_3')
    .replace(/([a-zA-Z])(₄)/g, '$1_4')
    .replace(/([a-zA-Z])(₅)/g, '$1_5')
    .replace(/([a-zA-Z])(₆)/g, '$1_6')
    .replace(/([a-zA-Z])(₇)/g, '$1_7')
    .replace(/([a-zA-Z])(₈)/g, '$1_8')
    .replace(/([a-zA-Z])(₉)/g, '$1_9')
    
    // Convert fractions like 2/3 to \frac{2}{3} if they're standalone
    .replace(/\b(\d+)\/(\d+)\b/g, '$\\frac{$1}{$2}$')
    
    // Convert square roots
    .replace(/sqrt\(([^)]+)\)/g, '$\\sqrt{$1}$')
    .replace(/√\(([^)]+)\)/g, '$\\sqrt{$1}$')
    .replace(/√(\d+)/g, '$\\sqrt{$1}$')
    .replace(/√([a-zA-Z]+)/g, '$\\sqrt{$1}$')
    
    // Convert powers like x^2 to proper LaTeX (fixed the triple dollar issue)
    .replace(/\b([a-zA-Z]+)\^([0-9]+)/g, '$$1^{$2}$')
    .replace(/\b([a-zA-Z]+)\^{([^}]+)}/g, '$$1^{$2}$')
    .replace(/\b(\d+)\^([0-9]+)/g, '$$1^{$2}$')
    .replace(/\b(\d+)\^{([^}]+)}/g, '$$1^{$2}$')
    
    // Convert expressions inside parentheses with powers
    .replace(/\(([^)]+)\)\^([0-9]+)/g, '$($1)^{$2}$')
    .replace(/\(([^)]+)\)\^{([^}]+)}/g, '$($1)^{$2}$')
    
    // Convert common symbols
    .replace(/≤/g, '$\\leq$')
    .replace(/≥/g, '$\\geq$')
    .replace(/≠/g, '$\\neq$')
    .replace(/±/g, '$\\pm$')
    .replace(/×/g, '$\\times$')
    .replace(/÷/g, '$\\div$')
    .replace(/π/g, '$\\pi$')
    .replace(/∞/g, '$\\infty$')
    .replace(/∑/g, '$\\sum$')
    .replace(/∫/g, '$\\int$')
    .replace(/α/g, '$\\alpha$')
    .replace(/β/g, '$\\beta$')
    .replace(/γ/g, '$\\gamma$')
    .replace(/δ/g, '$\\delta$')
    .replace(/θ/g, '$\\theta$')
    .replace(/λ/g, '$\\lambda$')
    .replace(/μ/g, '$\\mu$')
    .replace(/σ/g, '$\\sigma$')
    .replace(/Δ/g, '$\\Delta$')
    .replace(/Ω/g, '$\\Omega$')
    
    // Convert degree symbol
    .replace(/°C/g, '$°C$')
    .replace(/°F/g, '$°F$')
    .replace(/°/g, '$°$')
    
    // Chemical formulas (simple ones)
    .replace(/\bH2O\b/g, '$H_2O$')
    .replace(/\bCO2\b/g, '$CO_2$')
    .replace(/\bNaCl\b/g, '$NaCl$')
    .replace(/\bH2SO4\b/g, '$H_2SO_4$')
    .replace(/\bCaCO3\b/g, '$CaCO_3$')
    .replace(/\bO2\b/g, '$O_2$')
    .replace(/\bN2\b/g, '$N_2$')
    .replace(/\bNH3\b/g, '$NH_3$')
    .replace(/\bCH4\b/g, '$CH_4$')
    
    // Physics units and constants  
    .replace(/m\/s2/g, '$m/s^2$')
    .replace(/kg\.m\/s2/g, '$kg \\cdot m/s^2$')
    .replace(/J\/mol/g, '$J/mol$')
    .replace(/m\/s/g, '$m/s$')
    .replace(/kg\/m³/g, '$kg/m^3$')
    
    // Scientific notation
    .replace(/(\d+(?:\.\d+)?)\s*[xX]\s*10\^([+-]?\d+)/g, '$$1 \\times 10^{$2}$')
    .replace(/(\d+(?:\.\d+)?)\s*[×]\s*10\^([+-]?\d+)/g, '$$1 \\times 10^{$2}$');

  // Clean up any triple or double dollars that might have been created
  processed = processed.replace(/\$\$\$/g, '$$').replace(/\$\$\$/g, '$$');
  
  return processed;
}

export function processQuestionOptions(options: any): any {
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

// Function to auto-fix existing questions in the database
export async function autoFixQuestionsLatex(supabase: any, batchSize = 50) {
  try {
    console.log('Starting LaTeX auto-fix for questions...');
    
    let processed = 0;
    let hasMore = true;
    let lastId = '';
    
    while (hasMore) {
      // Fetch questions in batches
      let query = supabase
        .from('questions')
        .select('id, question_text, options, explanation')
        .eq('is_active', true)
        .limit(batchSize)
        .order('id', { ascending: true });
        
      if (lastId) {
        query = query.gt('id', lastId);
      }
      
      const { data: questions, error } = await query;
      
      if (error) {
        console.error('Error fetching questions:', error);
        break;
      }
      
      if (!questions || questions.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process each question
      const updates = [];
      for (const question of questions) {
        const processedQuestionText = processQuestionText(question.question_text || '');
        const processedOptions = processQuestionOptions(question.options);
        const processedExplanation = processQuestionText(question.explanation || '');
        
        // Only update if changes were made
        if (processedQuestionText !== question.question_text ||
            JSON.stringify(processedOptions) !== JSON.stringify(question.options) ||
            processedExplanation !== question.explanation) {
          
          updates.push({
            id: question.id,
            question_text: processedQuestionText,
            options: processedOptions,
            explanation: processedExplanation
          });
        }
        
        lastId = question.id;
      }
      
      // Batch update
      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from('questions')
          .upsert(updates);
          
        if (updateError) {
          console.error('Error updating questions:', updateError);
        } else {
          console.log(`Updated ${updates.length} questions with LaTeX formatting`);
          processed += updates.length;
        }
      }
      
      if (questions.length < batchSize) {
        hasMore = false;
      }
    }
    
    console.log(`LaTeX auto-fix completed. Processed ${processed} questions.`);
    return { success: true, processed };
    
  } catch (error) {
    console.error('Error in LaTeX auto-fix:', error);
    return { success: false, error: error.message };
  }
}