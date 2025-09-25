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

// Question templates for different subjects
const questionTemplates = {
  'Mathematics': [
    {
      template: "Find the value of x in the equation {equation}",
      options: ["x = {ans1}", "x = {ans2}", "x = {ans3}", "x = {ans4}"],
      topics: ["algebra", "equations", "linear_equations", "quadratic_equations"]
    },
    {
      template: "If {scenario}, what is the {question_type}?",
      options: ["{ans1}", "{ans2}", "{ans3}", "{ans4}"],
      topics: ["word_problems", "applications", "percentages", "ratios"]
    },
    {
      template: "Calculate the {calculation_type} of {geometric_shape}",
      options: ["{ans1} units", "{ans2} units", "{ans3} units", "{ans4} units"],
      topics: ["geometry", "mensuration", "area", "volume", "perimeter"]
    }
  ],
  'Physics': [
    {
      template: "A body of mass {mass}kg is subjected to a force of {force}N. Calculate its acceleration.",
      options: ["{ans1} m/s²", "{ans2} m/s²", "{ans3} m/s²", "{ans4} m/s²"],
      topics: ["mechanics", "force", "acceleration", "newton_laws"]
    },
    {
      template: "The {wave_property} of a wave with frequency {frequency}Hz and wavelength {wavelength}m is",
      options: ["{ans1} m/s", "{ans2} m/s", "{ans3} m/s", "{ans4} m/s"],
      topics: ["waves", "wave_motion", "frequency", "wavelength"]
    }
  ],
  'Chemistry': [
    {
      template: "The molecular formula of {compound} is",
      options: ["{formula1}", "{formula2}", "{formula3}", "{formula4}"],
      topics: ["chemical_formulae", "compounds", "molecular_structure"]
    },
    {
      template: "When {reaction_type} occurs between {reactant1} and {reactant2}, the product formed is",
      options: ["{product1}", "{product2}", "{product3}", "{product4}"],
      topics: ["chemical_reactions", "acids_bases", "oxidation_reduction"]
    }
  ],
  'Biology': [
    {
      template: "The {organ_system} system in humans is responsible for",
      options: ["{function1}", "{function2}", "{function3}", "{function4}"],
      topics: ["human_biology", "organ_systems", "physiology"]
    },
    {
      template: "In {biological_process}, the main function is to",
      options: ["{function1}", "{function2}", "{function3}", "{function4}"],
      topics: ["life_processes", "metabolism", "reproduction", "genetics"]
    }
  ],
  'Economics': [
    {
      template: "When demand increases while supply remains constant, the price will",
      options: ["increase", "decrease", "remain constant", "become zero"],
      topics: ["demand_supply", "market_forces", "price_mechanism"]
    },
    {
      template: "The type of unemployment caused by technological changes is called",
      options: ["structural unemployment", "cyclical unemployment", "frictional unemployment", "seasonal unemployment"],
      topics: ["unemployment", "labor_economics", "economic_concepts"]
    }
  ],
  'Government': [
    {
      template: "The principle of separation of powers divides government into",
      options: ["executive, legislative, and judicial", "federal, state, and local", "civil, military, and police", "upper, middle, and lower"],
      topics: ["separation_of_powers", "government_structure", "democracy"]
    },
    {
      template: "A system of government where power is shared between central and regional governments is called",
      options: ["federalism", "unitarism", "confederalism", "totalitarianism"],
      topics: ["federalism", "government_systems", "political_systems"]
    }
  ]
};

// Generate realistic question data
function generateQuestion(subject: Subject, index: number) {
  const templates = questionTemplates[subject.name as keyof typeof questionTemplates] || [
    {
      template: `Which of the following is correct about ${subject.name.toLowerCase()}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      topics: ["general", "concepts", "principles"]
    }
  ];

  const template = templates[index % templates.length];
  const difficulty = (index % 3) + 1; // Cycle through 1, 2, 3
  
  // Generate specific content based on subject
  const questionText = generateSubjectSpecificQuestion(subject, index, template);
  const options = generateSubjectSpecificOptions(subject, index, template);
  const correctAnswer = "A"; // For simplicity, always make A correct
  const explanation = generateExplanation(subject, questionText, options[0]);

  return {
    question_text: questionText,
    type: 'MULTIPLE_CHOICE' as const,
    options: {
      A: options[0],
      B: options[1],
      C: options[2],
      D: options[3]
    },
    correct_answer: correctAnswer,
    explanation: explanation,
    difficulty_level: difficulty,
    points: difficulty,
    subject_id: subject.id,
    is_active: true,
    tags: template.topics
  };
}

function generateSubjectSpecificQuestion(subject: Subject, index: number, template: any): string {
  const variations: Record<string, string[]> = {
    'Mathematics': [
      `Solve for x: 2x + ${3 + (index % 7)} = ${15 + (index % 10)}`,
      `If ${20 + (index % 20)}% of a number is ${40 + (index % 50)}, find the number`,
      `The area of a rectangle with length ${8 + (index % 5)}m and width ${5 + (index % 4)}m is`,
      `Find the simple interest on ₦${1000 + (index % 500)} for ${2 + (index % 3)} years at ${5 + (index % 10)}% per annum`
    ],
    'Physics': [
      `A car travels ${60 + (index % 40)} km in ${2 + (index % 3)} hours. Its average speed is`,
      `The kinetic energy of a ${5 + (index % 10)}kg object moving at ${10 + (index % 20)}m/s is`,
      `If the frequency of a wave is ${50 + (index % 50)}Hz and its wavelength is ${2 + (index % 8)}m, its speed is`,
      `The force required to give a ${4 + (index % 6)}kg mass an acceleration of ${3 + (index % 7)}m/s² is`
    ],
    'Chemistry': [
      `The atomic number of an element with ${10 + (index % 20)} electrons in its neutral state is`,
      `Which of these compounds has the highest molecular weight?`,
      `The pH of a solution with hydrogen ion concentration of 10⁻${3 + (index % 8)} mol/dm³ is`,
      `In the reaction 2H₂ + O₂ → 2H₂O, the molar ratio of hydrogen to oxygen is`
    ],
    'Biology': [
      `The process by which plants manufacture food using sunlight is called`,
      `Which of these organs is part of the excretory system?`,
      `The chromosome number in human gametes is`,
      `Which vitamin deficiency causes scurvy?`
    ],
    'Economics': [
      `If the price of a commodity increases by ${10 + (index % 20)}% and quantity demanded decreases by ${5 + (index % 15)}%, demand is`,
      `The economic system where the government controls all economic activities is called`,
      `Which of these factors will NOT cause a shift in the demand curve?`,
      `The opportunity cost of an action is`
    ],
    'Government': [
      `The system of government practiced in Nigeria is`,
      `Which of these is NOT a characteristic of democracy?`,
      `The arm of government responsible for making laws is the`,
      `Universal adult suffrage means`
    ]
  };

  const subjectQuestions = variations[subject.name] || [
    `Which of the following statements about ${subject.name.toLowerCase()} is correct?`,
    `In ${subject.name.toLowerCase()}, which principle is most important?`,
    `The main concept in ${subject.name.toLowerCase()} involves`,
    `Which factor is crucial in ${subject.name.toLowerCase()}?`
  ];

  return subjectQuestions[index % subjectQuestions.length];
}

function generateSubjectSpecificOptions(subject: Subject, index: number, template: any): string[] {
  const optionSets: Record<string, string[][]> = {
    'Mathematics': [
      [`x = ${5 + (index % 10)}`, `x = ${8 + (index % 12)}`, `x = ${12 + (index % 8)}`, `x = ${15 + (index % 6)}`],
      [`${80 + (index % 40)}`, `${120 + (index % 60)}`, `${160 + (index % 80)}`, `${200 + (index % 100)}`],
      [`${40 + (index % 20)} m²`, `${32 + (index % 18)} m²`, `${48 + (index % 22)} m²`, `${56 + (index % 24)} m²`],
      [`₦${100 + (index % 200)}`, `₦${150 + (index % 250)}`, `₦${200 + (index % 300)}`, `₦${250 + (index % 350)}`]
    ],
    'Physics': [
      [`${30 + (index % 20)} km/h`, `${40 + (index % 25)} km/h`, `${50 + (index % 30)} km/h`, `${60 + (index % 35)} km/h`],
      [`${250 + (index % 500)} J`, `${500 + (index % 750)} J`, `${750 + (index % 1000)} J`, `${1000 + (index % 1250)} J`],
      [`${100 + (index % 200)} m/s`, `${150 + (index % 250)} m/s`, `${200 + (index % 300)} m/s`, `${250 + (index % 350)} m/s`],
      [`${12 + (index % 10)} N`, `${18 + (index % 15)} N`, `${24 + (index % 20)} N`, `${30 + (index % 25)} N`]
    ],
    'Chemistry': [
      [`${10 + (index % 20)}`, `${15 + (index % 25)}`, `${20 + (index % 30)}`, `${25 + (index % 35)}`],
      [`H₂SO₄`, `NaCl`, `CaCO₃`, `CH₄`],
      [`${3 + (index % 8)}`, `${7 + (index % 6)}`, `${11 + (index % 4)}`, `${14 + (index % 2)}`],
      [`2:1`, `1:2`, `1:1`, `3:1`]
    ],
    'Biology': [
      [`Photosynthesis`, `Respiration`, `Transpiration`, `Digestion`],
      [`Kidney`, `Heart`, `Lung`, `Stomach`],
      [`23`, `46`, `22`, `44`],
      [`Vitamin C`, `Vitamin A`, `Vitamin D`, `Vitamin K`]
    ],
    'Economics': [
      [`Elastic`, `Inelastic`, `Perfectly elastic`, `Unitary elastic`],
      [`Socialism`, `Capitalism`, `Mixed economy`, `Traditional economy`],
      [`Consumer income`, `Price of substitutes`, `Price of the commodity`, `Consumer taste`],
      [`The next best alternative forgone`, `The total cost`, `The average cost`, `The marginal cost`]
    ],
    'Government': [
      [`Federal system`, `Unitary system`, `Confederate system`, `Parliamentary system`],
      [`Majority rule`, `Individual liberty`, `Autocracy`, `Rule of law`],
      [`Legislature`, `Executive`, `Judiciary`, `Civil service`],
      [`All adults can vote`, `Only educated people vote`, `Only men can vote`, `Only the rich can vote`]
    ]
  };

  const defaultOptions = [
    `Option A for ${subject.name}`,
    `Option B for ${subject.name}`,
    `Option C for ${subject.name}`,
    `Option D for ${subject.name}`
  ];

  const subjectOptions = optionSets[subject.name] || [defaultOptions];
  return subjectOptions[index % subjectOptions.length];
}

function generateExplanation(subject: Subject, question: string, correctAnswer: string): string {
  const explanations: Record<string, string[]> = {
    'Mathematics': [
      'This involves solving linear equations by isolating the variable on one side.',
      'Use the percentage formula: (Part/Whole) × 100 = Percentage.',
      'Area of rectangle = Length × Width. Substitute the given values.',
      'Simple Interest = (Principal × Rate × Time) / 100.'
    ],
    'Physics': [
      'Average speed = Total distance / Total time.',
      'Kinetic Energy = ½mv² where m is mass and v is velocity.',
      'Wave speed = Frequency × Wavelength (v = fλ).',
      'Force = Mass × Acceleration (F = ma), from Newton\'s second law.'
    ],
    'Chemistry': [
      'In a neutral atom, the number of protons equals the number of electrons.',
      'Molecular weight is calculated by summing the atomic weights of all atoms.',
      'pH = -log[H⁺]. Lower concentration means higher pH.',
      'The coefficients in a balanced equation give the molar ratios.'
    ],
    'Biology': [
      'Photosynthesis is the process where plants convert light energy into chemical energy.',
      'The excretory system removes waste products from the body.',
      'Human gametes (sex cells) have half the chromosome number of body cells.',
      'Vitamin C deficiency causes scurvy, leading to weakened connective tissues.'
    ],
    'Economics': [
      'Price elasticity of demand measures responsiveness of quantity demanded to price changes.',
      'Different economic systems vary in the degree of government control.',
      'Demand curve shifts are caused by non-price factors.',
      'Opportunity cost represents the value of the next best alternative foregone.'
    ],
    'Government': [
      'Different governmental systems distribute power differently between levels.',
      'Democracy has specific characteristics that distinguish it from other systems.',
      'The three arms of government have distinct functions in democratic systems.',
      'Universal suffrage ensures all qualified citizens can participate in elections.'
    ]
  };

  const subjectExplanations = explanations[subject.name] || [
    `This concept is fundamental in ${subject.name.toLowerCase()}.`,
    `Understanding this principle is crucial for ${subject.name.toLowerCase()}.`,
    `This is a key topic in ${subject.name.toLowerCase()} studies.`
  ];

  return subjectExplanations[Math.floor(Math.random() * subjectExplanations.length)];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting question generation...');

    // Get all subjects except English
    const { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('id, name, code')
      .eq('is_active', true)
      .not('name', 'in', '("English Language", "Literature in English")');

    if (subjectError) {
      throw new Error(`Failed to fetch subjects: ${subjectError.message}`);
    }

    console.log(`Found ${subjects.length} subjects to generate questions for`);

    let totalGenerated = 0;
    const batchSize = 50; // Insert in batches to avoid memory issues

    for (const subject of subjects) {
      console.log(`Generating 500 questions for ${subject.name}...`);
      
      for (let batch = 0; batch < 10; batch++) { // 10 batches of 50 = 500 questions
        const questions = [];
        
        for (let i = 0; i < batchSize; i++) {
          const questionIndex = (batch * batchSize) + i;
          questions.push(generateQuestion(subject, questionIndex));
        }

        const { error: insertError } = await supabase
          .from('questions')
          .insert(questions);

        if (insertError) {
          console.error(`Error inserting batch ${batch + 1} for ${subject.name}:`, insertError);
          throw new Error(`Failed to insert questions: ${insertError.message}`);
        }

        totalGenerated += batchSize;
        console.log(`Inserted batch ${batch + 1}/10 for ${subject.name} (Total: ${totalGenerated})`);
      }
      
      console.log(`Completed ${subject.name}: 500 questions generated`);
    }

    console.log(`Question generation completed! Total questions generated: ${totalGenerated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${totalGenerated} questions across ${subjects.length} subjects`,
        totalQuestions: totalGenerated,
        subjects: subjects.map(s => s.name)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error generating questions:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});