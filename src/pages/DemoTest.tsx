import { useState } from "react";
import ExamInterface from "@/components/ExamInterface";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DemoTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Sample demo questions
  const demoQuestions = [
    {
      id: 1,
      subject: "Mathematics",
      question: "If 3x + 7 = 25, what is the value of x?",
      options: ["A) 4", "B) 6", "C) 8", "D) 10"],
      correct: "B",
      explanation: "3x + 7 = 25, so 3x = 18, therefore x = 6",
      difficulty: "easy" as const
    },
    {
      id: 2,
      subject: "English Language",
      question: "Which of the following is a synonym for 'abundant'?",
      options: ["A) Scarce", "B) Plentiful", "C) Limited", "D) Rare"],
      correct: "B",
      explanation: "Abundant means existing in large quantities; plentiful is a synonym",
      difficulty: "easy" as const
    },
    {
      id: 3,
      subject: "Physics",
      question: "What is the SI unit of electric current?",
      options: ["A) Volt", "B) Watt", "C) Ampere", "D) Ohm"],
      correct: "C",
      explanation: "The SI unit of electric current is the Ampere (A)",
      difficulty: "medium" as const
    },
    {
      id: 4,
      subject: "Chemistry",
      question: "What is the chemical symbol for gold?",
      options: ["A) Go", "B) Au", "C) Ag", "D) Gd"],
      correct: "B",
      explanation: "Gold's chemical symbol is Au, from the Latin word 'Aurum'",
      difficulty: "easy" as const
    },
    {
      id: 5,
      subject: "Biology",
      question: "Which organelle is responsible for photosynthesis in plants?",
      options: ["A) Mitochondria", "B) Nucleus", "C) Chloroplast", "D) Ribosome"],
      correct: "C",
      explanation: "Chloroplasts contain chlorophyll and are responsible for photosynthesis",
      difficulty: "medium" as const
    },
    {
      id: 6,
      subject: "Geography",
      question: "Which is the largest continent by land area?",
      options: ["A) Africa", "B) Asia", "C) North America", "D) Europe"],
      correct: "B",
      explanation: "Asia is the largest continent, covering about 30% of Earth's land area",
      difficulty: "easy" as const
    },
    {
      id: 7,
      subject: "Economics",
      question: "What does GDP stand for?",
      options: ["A) General Development Plan", "B) Gross Domestic Product", "C) Government Development Policy", "D) Global Distribution Program"],
      correct: "B",
      explanation: "GDP stands for Gross Domestic Product, a measure of economic activity",
      difficulty: "easy" as const
    },
    {
      id: 8,
      subject: "Mathematics",
      question: "What is the square root of 144?",
      options: ["A) 11", "B) 12", "C) 13", "D) 14"],
      correct: "B",
      explanation: "12 × 12 = 144, so the square root of 144 is 12",
      difficulty: "easy" as const
    },
    {
      id: 9,
      subject: "English Language",
      question: "Identify the figure of speech in: 'The wind whispered through the trees'",
      options: ["A) Metaphor", "B) Simile", "C) Personification", "D) Alliteration"],
      correct: "C",
      explanation: "Personification gives human qualities (whispering) to non-human things (wind)",
      difficulty: "medium" as const
    },
    {
      id: 10,
      subject: "Physics",
      question: "What is the speed of light in vacuum?",
      options: ["A) 3 × 10⁸ m/s", "B) 3 × 10⁶ m/s", "C) 3 × 10¹⁰ m/s", "D) 3 × 10⁵ m/s"],
      correct: "A",
      explanation: "The speed of light in vacuum is approximately 3 × 10⁸ meters per second",
      difficulty: "medium" as const
    }
  ];

  const handleDemoSubmit = (answers: {[key: number]: string}, timeTaken: number) => {
    // Calculate demo results
    let correctCount = 0;
    demoQuestions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctCount++;
      }
    });

    const percentage = (correctCount / demoQuestions.length) * 100;
    
    toast({
      title: "Demo Test Completed!",
      description: `You scored ${correctCount}/${demoQuestions.length} (${percentage.toFixed(1)}%)`,
    });

    // Navigate to signup page after demo
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <ExamInterface
      examTitle="Demo Practice Test"
      examDescription="Experience our CBT platform with this sample test"
      questions={demoQuestions}
      duration={15} // 15 minutes for demo
      onSubmit={handleDemoSubmit}
      allowReview={true}
      showExplanations={true} // Show explanations in demo mode
      antiCheatEnabled={false} // Disable anti-cheat for demo
    />
  );
};

export default DemoTest;