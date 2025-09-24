import { useState, useEffect } from "react";
import ExamInterface from "@/components/ExamInterface";
import { useNavigate } from "react-router-dom";

const CBTExam = () => {
  const navigate = useNavigate();

  // Sample questions data - in real app this would come from props/API
  const questions = [
    {
      id: 1,
      subject: "Mathematics",
      question: "If 3x + 5 = 20, what is the value of x?",
      options: ["A) 3", "B) 5", "C) 8", "D) 15"],
      correct: "B",
      explanation: "To solve 3x + 5 = 20, subtract 5 from both sides: 3x = 15, then divide by 3: x = 5",
      difficulty: "easy" as const
    },
    {
      id: 2,
      subject: "English",
      question: "Choose the correct spelling:",
      options: ["A) Recieve", "B) Receive", "C) Receeve", "D) Recive"],
      correct: "B",
      explanation: "The correct spelling follows the rule 'i before e except after c'",
      difficulty: "medium" as const
    },
    {
      id: 3,
      subject: "Physics",
      question: "The SI unit of force is:",
      options: ["A) Joule", "B) Watt", "C) Newton", "D) Pascal"],
      correct: "C",
      explanation: "Newton (N) is the SI unit of force, named after Sir Isaac Newton",
      difficulty: "easy" as const
    },
    {
      id: 4,
      subject: "Chemistry",
      question: "What is the chemical symbol for Gold?",
      options: ["A) Go", "B) Gd", "C) Au", "D) Ag"],
      correct: "C",
      explanation: "Au comes from the Latin word 'aurum' meaning gold",
      difficulty: "medium" as const
    },
    {
      id: 5,
      subject: "Biology",
      question: "The powerhouse of the cell is:",
      options: ["A) Nucleus", "B) Mitochondria", "C) Ribosome", "D) Cytoplasm"],
      correct: "B",
      explanation: "Mitochondria produce ATP, the energy currency of the cell",
      difficulty: "easy" as const
    }
  ];

  const handleExamSubmit = (answers: {[key: number]: string}, timeTaken: number) => {
    // Calculate score
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        score++;
      }
    });
    
    const percentage = Math.round((score / questions.length) * 100);
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    const resultData = {
      score: percentage,
      totalQuestions: questions.length,
      correctAnswers: score,
      wrongAnswers: questions.length - score,
      unanswered: unansweredCount,
      timeTaken: timeTaken,
      timeAllotted: 90,
      subjects: [
        { name: "Mathematics", score: answers[0] === questions[0].correct ? 100 : 0, total: 1, correct: answers[0] === questions[0].correct ? 1 : 0 },
        { name: "English", score: answers[1] === questions[1].correct ? 100 : 0, total: 1, correct: answers[1] === questions[1].correct ? 1 : 0 },
        { name: "Physics", score: answers[2] === questions[2].correct ? 100 : 0, total: 1, correct: answers[2] === questions[2].correct ? 1 : 0 },
        { name: "Chemistry", score: answers[3] === questions[3].correct ? 100 : 0, total: 1, correct: answers[3] === questions[3].correct ? 1 : 0 },
        { name: "Biology", score: answers[4] === questions[4].correct ? 100 : 0, total: 1, correct: answers[4] === questions[4].correct ? 1 : 0 }
      ]
    };
    
    navigate('/results', { state: resultData });
  };

  return (
    <ExamInterface
      examTitle="JAMB Practice Test"
      examDescription="Mixed Subjects Practice Examination"
      questions={questions}
      duration={90} // 90 minutes
      onSubmit={handleExamSubmit}
      allowReview={true}
      showExplanations={false}
      antiCheatEnabled={true}
    />
  );
};

export default CBTExam;