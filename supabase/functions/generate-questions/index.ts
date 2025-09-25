import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface GeneratedQuestion {
  question_text: string;
  type: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty_level: number;
  points: number;
  subject_id: string;
  is_active: boolean;
  tags: string[];
}

interface GenerationResult {
  subject: string;
  generated: number;
  target: number;
  error?: string;
}

// Enhanced syllabus topics with more granular breakdown
const detailedSyllabusTopics: Record<string, string[]> = {
  'Mathematics': [
    'Number bases and modular arithmetic', 'Indices and logarithms', 'Surds and radicals',
    'Quadratic equations and inequalities', 'Simultaneous equations', 'Variation (direct, inverse, joint)',
    'Arithmetic progression', 'Geometric progression', 'Binary operations',
    'Sets and Venn diagrams', 'Functions and graphs', 'Coordinate geometry',
    'Linear inequalities', 'Matrices and determinants', 'Vectors in 2D and 3D',
    'Trigonometric ratios', 'Trigonometric equations', 'Heights and distances',
    'Circle theorems', 'Polygons and angles', 'Area and perimeter calculations',
    'Volume and surface area', 'Similarity and congruence', 'Locus and constructions',
    'Probability and statistics', 'Mean, median, mode', 'Standard deviation',
    'Permutations and combinations', 'Differentiation', 'Integration', 'Applications of calculus'
  ],
  'Physics': [
    'Scalar and vector quantities', 'Motion in a straight line', 'Projectile motion',
    'Newton\'s laws of motion', 'Friction and equilibrium', 'Work, energy and power',
    'Momentum and impulse', 'Circular motion', 'Gravitation and satellites',
    'Simple harmonic motion', 'Wave properties', 'Sound waves and acoustics',
    'Light waves and optics', 'Reflection and refraction', 'Lenses and mirrors',
    'Electromagnetic spectrum', 'Heat and temperature', 'Thermal expansion',
    'Heat transfer methods', 'Gas laws', 'Kinetic theory of gases',
    'Electric fields and charges', 'Current electricity', 'Ohm\'s law and resistance',
    'Electrical circuits', 'Electromagnetic induction', 'AC and DC current',
    'Magnetic fields', 'Atomic structure', 'Radioactivity', 'Nuclear physics'
  ],
  'Chemistry': [
    'Atomic structure and electron configuration', 'Periodic table trends', 'Chemical bonding types',
    'Molecular shapes and polarity', 'States of matter', 'Gas laws and behavior',
    'Solutions and solubility', 'Acids, bases and pH', 'Salt preparation methods',
    'Oxidation and reduction', 'Electrolysis processes', 'Chemical kinetics',
    'Chemical equilibrium', 'Thermochemistry', 'Organic compound classification',
    'Hydrocarbon reactions', 'Functional groups', 'Polymer chemistry',
    'Metal extraction', 'Corrosion and prevention', 'Industrial chemistry',
    'Environmental chemistry', 'Qualitative analysis', 'Quantitative analysis'
  ],
  'Biology': [
    'Cell structure and function', 'Cell division processes', 'Genetics and heredity',
    'DNA structure and replication', 'Protein synthesis', 'Enzyme action',
    'Photosynthesis process', 'Cellular respiration', 'Plant structure and function',
    'Plant reproduction', 'Animal classification', 'Human body systems',
    'Blood circulation', 'Respiratory system', 'Digestive system',
    'Nervous system', 'Endocrine system', 'Reproductive system',
    'Evolution and natural selection', 'Ecology and ecosystems', 'Food chains and webs',
    'Population dynamics', 'Conservation biology', 'Biotechnology applications'
  ]
};

// Question templates with authentic WAEC/JAMB patterns
const questionPatterns = {
  'Mathematics': [
    {
      pattern: "calculation",
      templates: [
        "If log₁₀ a = {x} and log₁₀ b = {y}, find log₁₀(ab²)",
        "Find the value of x in the equation {a}x + {b} = {c}x + {d}",
        "A geometric progression has first term {a} and common ratio {r}. Find the {n}th term",
        "If sin θ = {frac}, find cos θ (θ is acute)",
        "The nth term of an arithmetic progression is {formula}. Find the sum of the first {n} terms"
      ]
    },
    {
      pattern: "word_problem",
      templates: [
        "A man walks {dist1}km due north, then {dist2}km due east. Calculate his distance from the starting point",
        "The ages of two brothers are in the ratio {ratio}. If the sum of their ages is {sum}, find their individual ages",
        "A sector of a circle has angle {angle}° and radius {radius}cm. Calculate its area",
        "Two numbers are in the ratio {ratio}. If their sum is {sum}, find the larger number"
      ]
    }
  ],
  'Physics': [
    {
      pattern: "calculation",
      templates: [
        "A body falls freely from rest. If it travels {dist}m in the {n}th second, find g",
        "A projectile is fired at {angle}° to the horizontal with speed {speed}m/s. Find the maximum height",
        "A wave has frequency {freq}Hz and wavelength {lambda}m. Calculate its speed",
        "The resistance of a wire is {R}Ω when its length is {L}m. Find the resistance when length is {L2}m"
      ]
    },
    {
      pattern: "concept",
      templates: [
        "Which of the following best describes {concept}?",
        "The unit of {quantity} is",
        "When light passes from air to water, which property changes?",
        "The principle behind the operation of {device} is"
      ]
    }
  ],
  'Chemistry': [
    {
      pattern: "reaction",
      templates: [
        "When {compound1} reacts with {compound2}, the product formed is",
        "The oxidation number of {element} in {compound} is",
        "Which gas is evolved when {substance} is heated strongly?",
        "The IUPAC name of {formula} is"
      ]
    },
    {
      pattern: "calculation",
      templates: [
        "Calculate the mass of {substance} required to prepare {volume}dm³ of {molarity}M solution",
        "What volume of {gas} at STP is produced when {mass}g of {compound} decomposes?",
        "If the pH of a solution is {pH}, calculate the hydrogen ion concentration"
      ]
    }
  ]
};

async function generateHighQualityQuestions(subject: Subject, targetCount: number): Promise<GeneratedQuestion[]> {
  const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
  if (!perplexityApiKey) {
    console.log('Perplexity API key not found, using template generation');
    return generateTemplateQuestions(subject, targetCount);
  }

  const questions: GeneratedQuestion[] = [];
  const topics = detailedSyllabusTopics[subject.name] || ['General Topics'];
  const usedQuestions = new Set<string>(); // Prevent duplicates
  
  console.log(`Generating ${targetCount} questions for ${subject.name} using ${topics.length} topics`);

  // Generate questions in smaller, focused batches
  const batchSize = 5; // Smaller batches for better quality
  const maxRetries = 3;

  for (let topicIndex = 0; topicIndex < topics.length && questions.length < targetCount; topicIndex++) {
    const topic = topics[topicIndex];
    const questionsNeeded = Math.min(batchSize, targetCount - questions.length);
    
    console.log(`Generating ${questionsNeeded} questions for topic: ${topic}`);

    for (let retry = 0; retry < maxRetries && questions.length < targetCount; retry++) {
      try {
        const prompt = `Generate exactly ${questionsNeeded} unique, authentic WAEC/JAMB examination questions for ${subject.name}, specifically covering the topic: "${topic}".

CRITICAL REQUIREMENTS:
1. Each question must be completely unique and different from others
2. Questions must be based on real WAEC/JAMB past questions and current syllabi
3. Include authentic Nigerian educational context and terminology
4. Each question must have exactly 4 options (A, B, C, D)
5. Provide detailed step-by-step explanations
6. Vary difficulty levels appropriately
7. Use proper mathematical symbols and scientific notation where needed

TOPIC FOCUS: ${topic}

Generate questions that test different aspects of this topic:
- Conceptual understanding
- Problem-solving skills  
- Application of principles
- Analytical thinking

Format each question as a complete JSON object:
{
  "question_text": "[Complete question text with proper formatting]",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correct_answer": 0,
  "explanation": "[Detailed step-by-step explanation showing why this answer is correct]",
  "difficulty_level": 2,
  "topics": ["${topic}"]
}

Return ONLY a valid JSON array containing exactly ${questionsNeeded} unique question objects. No additional text or formatting.`;

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: `You are an expert Nigerian education specialist with deep knowledge of WAEC and JAMB examinations. You have access to official syllabi, past questions, and current educational standards. Generate only authentic, high-quality questions that would actually appear in these examinations.`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.8, // Higher temperature for more variation
            top_p: 0.9,
            max_tokens: 4000,
            return_images: false,
            return_related_questions: false,
            search_domain_filter: ['waec.org.ng', 'jamb.gov.ng', 'edu.ng', 'nigerianeducationforum.com'],
            search_recency_filter: 'year',
            frequency_penalty: 1.2, // Prevent repetition
            presence_penalty: 0.8
          }),
        });

        if (!response.ok) {
          throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          console.log(`No content received for ${topic}, attempt ${retry + 1}`);
          continue;
        }

        // Clean and parse JSON response
        let jsonContent = content.trim();
        if (jsonContent.includes('```json')) {
          jsonContent = jsonContent.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || jsonContent;
        } else if (jsonContent.includes('```')) {
          jsonContent = jsonContent.match(/```\s*([\s\S]*?)\s*```/)?.[1] || jsonContent;
        }

        try {
          const parsedQuestions = JSON.parse(jsonContent);
          
          if (Array.isArray(parsedQuestions)) {
            for (const q of parsedQuestions) {
              if (validateQuestion(q) && !usedQuestions.has(q.question_text)) {
                usedQuestions.add(q.question_text);
                questions.push({
                  question_text: q.question_text,
                  type: 'MCQ_SINGLE',
                  options: q.options.slice(0, 4),
                  correct_answer: Math.max(0, Math.min(3, q.correct_answer || 0)),
                  explanation: q.explanation || 'No explanation provided',
                  difficulty_level: Math.max(1, Math.min(3, q.difficulty_level || 2)),
                  points: q.difficulty_level === 3 ? 2 : 1,
                  subject_id: subject.id,
                  is_active: true,
                  tags: Array.isArray(q.topics) ? q.topics : [topic]
                });
              }
            }
            console.log(`Successfully parsed ${parsedQuestions.length} questions for ${topic}`);
            break; // Success, no need to retry
          }
        } catch (parseError) {
          console.error(`Parse error for ${topic}, attempt ${retry + 1}:`, parseError);
          if (retry === maxRetries - 1) {
            // Fallback to template generation for this topic
            const fallbackQuestions = generateTemplateQuestions(subject, questionsNeeded, [topic]);
            questions.push(...fallbackQuestions);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        console.error(`Error generating questions for ${topic}, attempt ${retry + 1}:`, error);
      }
    }
  }

  // If we still don't have enough questions, fill with templates
  if (questions.length < targetCount) {
    const needed = targetCount - questions.length;
    console.log(`Generated ${questions.length}/${targetCount} with AI, filling ${needed} with templates`);
    const templateQuestions = generateTemplateQuestions(subject, needed);
    questions.push(...templateQuestions);
  }

  console.log(`Final count for ${subject.name}: ${questions.length} questions`);
  return questions.slice(0, targetCount);
}

function validateQuestion(q: any): boolean {
  return q.question_text && 
         Array.isArray(q.options) && 
         q.options.length >= 4 && 
         q.options.every((opt: any) => typeof opt === 'string' && opt.trim().length > 0) &&
         typeof q.correct_answer === 'number' &&
         q.correct_answer >= 0 && 
         q.correct_answer < 4;
}

function generateTemplateQuestions(subject: Subject, count: number, specificTopics?: string[]): GeneratedQuestion[] {
  const topics = specificTopics || detailedSyllabusTopics[subject.name] || ['General Topics'];
  const patterns = (questionPatterns as any)[subject.name] || [];
  const questions: GeneratedQuestion[] = [];

  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const difficulty = Math.floor(Math.random() * 3) + 1;
    
    // Generate more varied template questions
    const questionNum = Math.floor(Math.random() * 1000);
    
    questions.push({
      question_text: `${subject.name} Question ${questionNum}: What is the relationship between ${topic.toLowerCase()} and its practical applications?`,
      type: 'MCQ_SINGLE',
      options: [
        `It demonstrates fundamental principles of ${topic.toLowerCase()}`,
        `It shows limited connection to ${topic.toLowerCase()}`,
        `It contradicts basic ${topic.toLowerCase()} concepts`,
        `It has no relevance to ${topic.toLowerCase()}`
      ],
      correct_answer: 0,
      explanation: `This question tests understanding of ${topic} and its applications in ${subject.name}. The correct answer demonstrates how theoretical knowledge connects to practical scenarios.`,
      difficulty_level: difficulty,
      points: difficulty === 3 ? 2 : 1,
      subject_id: subject.id,
      is_active: true,
      tags: [topic]
    });
  }

  return questions;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { questionsPerSubject = 100, clearExisting = false } = await req.json().catch(() => ({}));

    console.log(`Starting question generation: ${questionsPerSubject} questions per subject`);

    // Get all active subjects
    const { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('id, name, code')
      .eq('is_active', true);

    if (subjectError) {
      throw new Error(`Failed to fetch subjects: ${subjectError.message}`);
    }

    console.log(`Found ${subjects.length} subjects`);

    // Clear existing questions if requested
    if (clearExisting) {
      console.log('Clearing existing questions...');
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('Error clearing questions:', deleteError);
      } else {
        console.log('Successfully cleared existing questions');
      }
    }

    let totalGenerated = 0;
    const results: GenerationResult[] = [];

    // Process subjects with background task support
    const generateForAllSubjects = async () => {
      for (const subject of subjects) {
        console.log(`\n--- Processing ${subject.name} ---`);
        
        try {
          const questions = await generateHighQualityQuestions(subject, questionsPerSubject);
          
          if (questions.length === 0) {
            console.log(`No questions generated for ${subject.name}`);
            continue;
          }

          // Insert questions in batches
          const batchSize = 25;
          let subjectTotal = 0;
          
          for (let i = 0; i < questions.length; i += batchSize) {
            const batch = questions.slice(i, i + batchSize);
            
            const { data: insertedQuestions, error: insertError } = await supabase
              .from('questions')
              .insert(batch)
              .select('id');

            if (insertError) {
              console.error(`Error inserting batch for ${subject.name}:`, insertError);
              continue;
            }

            subjectTotal += insertedQuestions?.length || 0;
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1} for ${subject.name}: ${insertedQuestions?.length || 0} questions`);
          }

          totalGenerated += subjectTotal;
          results.push({
            subject: subject.name,
            generated: subjectTotal,
            target: questionsPerSubject
          });

          console.log(`✓ Completed ${subject.name}: ${subjectTotal}/${questionsPerSubject} questions`);

        } catch (error) {
          console.error(`Error processing ${subject.name}:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          results.push({
            subject: subject.name,
            generated: 0,
            target: questionsPerSubject,
            error: errorMessage
          });
        }
      }
    };

    // Use setTimeout for large operations instead of EdgeRuntime
    if (questionsPerSubject * subjects.length > 1000) {
      // Start background processing
      setTimeout(async () => {
        await generateForAllSubjects();
      }, 0);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Started background generation of ${questionsPerSubject * subjects.length} questions`,
          totalTargeted: questionsPerSubject * subjects.length,
          subjects: subjects.map(s => s.name),
          status: 'processing'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 202 // Accepted
        }
      );
    } else {
      await generateForAllSubjects();
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully generated ${totalGenerated} questions`,
          totalGenerated,
          results,
          status: 'completed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Handle graceful shutdown  
addEventListener('beforeunload', () => {
  console.log('Function is shutting down');
});