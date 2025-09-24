import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  CheckCircle,
  Circle,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CBTExam = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [examStarted, setExamStarted] = useState(true);

  // Sample questions data
  const questions = [
    {
      id: 1,
      subject: "Mathematics",
      question: "If 3x + 5 = 20, what is the value of x?",
      options: ["A) 3", "B) 5", "C) 8", "D) 15"],
      correct: "B"
    },
    {
      id: 2,
      subject: "English",
      question: "Choose the correct spelling:",
      options: ["A) Recieve", "B) Receive", "C) Receeve", "D) Recive"],
      correct: "B"
    },
    {
      id: 3,
      subject: "Physics",
      question: "The SI unit of force is:",
      options: ["A) Joule", "B) Watt", "C) Newton", "D) Pascal"],
      correct: "C"
    },
    {
      id: 4,
      subject: "Chemistry",
      question: "What is the chemical symbol for Gold?",
      options: ["A) Go", "B) Gd", "C) Au", "D) Ag"],
      correct: "C"
    },
    {
      id: 5,
      subject: "Biology",
      question: "The powerhouse of the cell is:",
      options: ["A) Nucleus", "B) Mitochondria", "C) Ribosome", "D) Cytoplasm"],
      correct: "B"
    }
  ];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex: number, option: string) => {
    setAnswers({ ...answers, [questionIndex]: option });
  };

  const handleFlagQuestion = () => {
    const newFlagged = new Set(flagged);
    if (flagged.has(currentQuestion)) {
      newFlagged.delete(currentQuestion);
    } else {
      newFlagged.add(currentQuestion);
    }
    setFlagged(newFlagged);
  };

  const handleSubmitExam = () => {
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
      timeTaken: Math.floor((90 * 60 - timeLeft) / 60),
      timeAllotted: 90,
      subjects: [
        { name: "Mathematics", score: 80, total: 2, correct: 1.6 },
        { name: "English", score: percentage, total: 1, correct: percentage/100 },
        { name: "Physics", score: 70, total: 1, correct: 0.7 },
        { name: "Chemistry", score: 65, total: 1, correct: 0.65 }
      ]
    };
    navigate('/results', { state: resultData });
  };

  const getQuestionStatus = (index: number) => {
    if (answers[index]) return "answered";
    if (flagged.has(index)) return "flagged";
    return "unanswered";
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">JAMB Practice Test</h1>
                <p className="text-sm text-muted-foreground">Mixed Subjects</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-warning">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
              <Button 
                variant="destructive" 
                onClick={handleSubmitExam}
                className="hidden sm:flex"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <Card className="lg:order-2">
            <CardHeader>
              <CardTitle className="text-sm">Question Navigator</CardTitle>
              <div className="text-xs text-muted-foreground">
                {answeredCount} of {questions.length} answered
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`aspect-square p-0 ${
                        status === "answered" ? "border-accent bg-accent/10" :
                        status === "flagged" ? "border-warning bg-warning/10" : ""
                      }`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-accent" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-warning" />
                  <span>Flagged ({flagged.size})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-3 w-3 text-muted-foreground" />
                  <span>Not Visited ({questions.length - answeredCount - flagged.size + (answers[currentQuestion] ? 1 : 0)})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Question Area */}
          <div className="lg:col-span-3 lg:order-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        {questions[currentQuestion].subject}
                      </Badge>
                      <Badge variant="outline">
                        Question {currentQuestion + 1} of {questions.length}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">
                      {questions[currentQuestion].question}
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFlagQuestion}
                    className={flagged.has(currentQuestion) ? "text-warning border-warning" : ""}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const optionLetter = option.split(')')[0];
                    const isSelected = answers[currentQuestion] === optionLetter;
                    
                    return (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          isSelected ? "border-primary bg-primary/10" : "border-border"
                        }`}
                        onClick={() => handleAnswerSelect(currentQuestion, optionLetter)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                          <span>{option}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleFlagQuestion}
                  className={flagged.has(currentQuestion) ? "text-warning border-warning" : ""}
                >
                  {flagged.has(currentQuestion) ? "Unflag" : "Flag for Review"}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleSubmitExam}
                  className="sm:hidden"
                >
                  Submit
                </Button>
              </div>

              <Button
                onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Progress Info */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-bold text-lg text-accent">{answeredCount}</div>
                    <div className="text-sm text-muted-foreground">Answered</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-warning">{flagged.size}</div>
                    <div className="text-sm text-muted-foreground">Flagged</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-muted-foreground">
                      {questions.length - answeredCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBTExam;