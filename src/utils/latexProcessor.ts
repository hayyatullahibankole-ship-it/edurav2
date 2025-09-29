// Utility to process and enhance LaTeX rendering in questions

export function processQuestionText(text: string): string {
  if (!text) return '';
  
  // Convert common math expressions to LaTeX format (SAFE transforms only)
  let processed = text
    // 1) Function names without backslash
    .replace(/\bcos(?=\s|\()/gi, '\\cos')
    .replace(/\bsin(?=\s|\()/gi, '\\sin')
    .replace(/\btan(?=\s|\()/gi, '\\tan')
    .replace(/\blog(?=\s*[_\(])/gi, '\\log')
    .replace(/\bln(?=\s|\()/gi, '\\ln')

    // 2) Degree notations
    .replace(/\^\\?circ/gi, '^{\\circ}')
    .replace(/\b(\d+)\s*deg\b/gi, '$1^{\\circ}')

    // 3) Superscript/subscript unicode to ASCII caret/underscore
    .replace(/([A-Za-z0-9\)])(²)/g, '$1^2')
    .replace(/([A-Za-z0-9\)])(³)/g, '$1^3')
    .replace(/([A-Za-z0-9\)])(⁴)/g, '$1^4')
    .replace(/([A-Za-z0-9\)])(⁵)/g, '$1^5')
    .replace(/([A-Za-z0-9\)])(⁶)/g, '$1^6')
    .replace(/([A-Za-z0-9\)])(⁷)/g, '$1^7')
    .replace(/([A-Za-z0-9\)])(⁸)/g, '$1^8')
    .replace(/([A-Za-z0-9\)])(⁹)/g, '$1^9')
    .replace(/([A-Za-z0-9\)])(⁰)/g, '$1^0')
    .replace(/([A-Za-z])(₀)/g, '$1_0')
    .replace(/([A-Za-z])(₁)/g, '$1_1')
    .replace(/([A-Za-z])(₂)/g, '$1_2')
    .replace(/([A-Za-z])(₃)/g, '$1_3')
    .replace(/([A-Za-z])(₄)/g, '$1_4')
    .replace(/([A-Za-z])(₅)/g, '$1_5')
    .replace(/([A-Za-z])(₆)/g, '$1_6')
    .replace(/([A-Za-z])(₇)/g, '$1_7')
    .replace(/([A-Za-z])(₈)/g, '$1_8')
    .replace(/([A-Za-z])(₉)/g, '$1_9')

    // 4) Ensure braces for ^ and _ when followed by a single char
    .replace(/\^(?!\{)([A-Za-z0-9])/g, '^{$1}')
    .replace(/_(?!\{)([A-Za-z0-9])/g, '_{$1}')

    // 5) sqrt and common symbols - enhanced
    .replace(/sqrt\s*\(([^)]+)\)/gi, '\\sqrt{$1}')
    .replace(/√\s*\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√\s*([A-Za-z0-9]+)/g, '\\sqrt{$1}')
    .replace(/\bsqrt\s+(\d+)/gi, '\\sqrt{$1}')
    .replace(/\bsqrt\s+([A-Za-z])/gi, '\\sqrt{$1}')
    
    // 6) Mathematical symbols with proper spacing
    .replace(/≤/g, ' \\leq ')
    .replace(/≥/g, ' \\geq ')
    .replace(/≠/g, ' \\neq ')
    .replace(/±/g, ' \\pm ')
    .replace(/×/g, ' \\times ')
    .replace(/÷/g, ' \\div ')
    .replace(/π/g, '\\pi')
    .replace(/∞/g, '\\infty')
    .replace(/∑/g, '\\sum')
    .replace(/∫/g, '\\int')
    .replace(/∂/g, '\\partial')
    .replace(/Δ/g, '\\Delta')
    .replace(/∇/g, '\\nabla')
    .replace(/α/g, '\\alpha')
    .replace(/β/g, '\\beta')
    .replace(/γ/g, '\\gamma')
    .replace(/δ/g, '\\delta')
    .replace(/θ/g, '\\theta')
    .replace(/λ/g, '\\lambda')
    .replace(/μ/g, '\\mu')
    .replace(/σ/g, '\\sigma')
    .replace(/Ω/g, '\\Omega')

    // 7) Scientific notation patterns with spacing
    .replace(/(\d+(?:\.\d+)?)\s*[xX×]\s*10\^\{?([+-]?\d+)\}?/g, '$1 \\times 10^{$2}')

    // 8) Chemistry with proper spacing
    .replace(/\bH2O\b/g, 'H_2O')
    .replace(/\bCO2\b/g, 'CO_2')
    .replace(/\bH2SO4\b/g, 'H_2SO_4')
    .replace(/\bCaCO3\b/g, 'CaCO_3')
    .replace(/\bO2\b/g, 'O_2')
    .replace(/\bN2\b/g, 'N_2')
    .replace(/\bNH3\b/g, 'NH_3')
    .replace(/\bCH4\b/g, 'CH_4')

    // 9) Common physics units with spacing
    .replace(/m\/s2/g, 'm/s^2')
    .replace(/kg\.m\/s2/g, 'kg \\cdot m/s^2')
    .replace(/kg\/m³/g, 'kg/m^3')

    // 10) Matrix and determinant patterns (enhanced)
    .replace(/\|\s*([^|]+)\s*\|/g, '\\begin{vmatrix}$1\\end{vmatrix}')
    .replace(/det\s*\(\s*([^)]+)\s*\)/gi, '\\det($1)')
    .replace(/matrix\s*\(\s*([^)]+)\s*\)/gi, '\\begin{pmatrix}$1\\end{pmatrix}')
    
    // 11) Vector notation with spacing
    .replace(/vec\s*\(\s*([A-Za-z])\s*\)/gi, '\\vec{$1}')
    .replace(/\b([A-Za-z])-vector/gi, '\\vec{$1}')
    
    // 12) Logarithm improvements with spacing
    .replace(/log\s*_\s*(\d+)\s*\(\s*([^)]+)\s*\)/gi, '\\log_{$1}($2)')
    .replace(/log\s*_\s*(\d+)\s+([A-Za-z0-9]+)/gi, '\\log_{$1} $2')
    
    // 13) Trigonometric with angles and spacing
    .replace(/cos\s*(\d+)\s*°/gi, '\\cos $1^{\\circ}')
    .replace(/sin\s*(\d+)\s*°/gi, '\\sin $1^{\\circ}')
    .replace(/tan\s*(\d+)\s*°/gi, '\\tan $1^{\\circ}')
    
    // 14) Add spacing around mathematical operators
    .replace(/([A-Za-z0-9\)])(\+)([A-Za-z0-9\(])/g, '$1 + $3')
    .replace(/([A-Za-z0-9\)])(-)([A-Za-z0-9\(])/g, '$1 - $3')
    .replace(/([A-Za-z0-9\)])(=)([A-Za-z0-9\(])/g, '$1 = $3')
    
    // 15) Add spacing between numbers and variables
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    
    // 16) Clean up excessive spaces (but keep spaces around LaTeX commands)
    .replace(/\s{2,}/g, ' ');

  // Clean redundancy of dollar signs created elsewhere
  processed = processed.replace(/\$\$+/g, '$');
  
  // If expressions like log_2(…), cos(…), sqrt(…), ^, _ appear but no $ present, conditionally wrap
  const hasMathToken = /(\\(frac|sqrt|begin|end|cos|sin|tan|log|ln|vec|sum|int|leq|geq|neq|times|div|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Omega|pi|infty|partial|nabla)|\^|_|√|×|÷)/.test(processed);
  const hasDollar = /\$/.test(processed);
  const looksLikeSentence = /[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(processed);
  if (hasMathToken && !hasDollar) {
    // Use block for matrices/determinants when the whole content is math-like and short
    const complex = /(pmatrix|bmatrix|vmatrix|\\begin\{.*?matrix\})/.test(processed);
    if (!looksLikeSentence || complex) {
      processed = complex ? `$$${processed}$$` : `$${processed}$`;
    }
    // If it looks like a sentence, do not wrap here - MathRenderer will render inline tokens safely
  }

  // Finally, wrap known chemistry pieces with $ if not already inside math
  processed = processed.replace(/\b([A-Z][a-z]?_\{?\d+\}?)+\b/g, (m) => /\$/.test(m) ? m : `$${m}$`);

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