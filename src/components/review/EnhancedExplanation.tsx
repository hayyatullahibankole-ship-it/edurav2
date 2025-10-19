import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import { MathRenderer } from "@/components/ui/math-renderer";

interface EnhancedExplanationProps {
  explanation: string;
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string | null;
  options: any;
}

export const EnhancedExplanation = ({
  explanation,
  isCorrect,
  correctAnswer,
  userAnswer,
  options,
}: EnhancedExplanationProps) => {
  
  // Parse explanation into steps if it contains numbered steps
  const parseSteps = (text: string) => {
    // Check for numbered steps (1., 2., etc.)
    const stepPattern = /(\d+)\.\s+(.+?)(?=\d+\.|$)/gs;
    const matches = Array.from(text.matchAll(stepPattern));
    
    if (matches.length > 0) {
      return matches.map(match => ({
        number: match[1],
        content: match[2].trim()
      }));
    }
    
    // Check for bullet points
    const bulletPattern = /[•\-\*]\s+(.+?)(?=[•\-\*]|$)/gs;
    const bulletMatches = Array.from(text.matchAll(bulletPattern));
    
    if (bulletMatches.length > 0) {
      return bulletMatches.map((match, index) => ({
        number: (index + 1).toString(),
        content: match[1].trim()
      }));
    }
    
    // No steps found, return as single explanation
    return [];
  };

  const steps = parseSteps(explanation);
  const hasSteps = steps.length > 0;

  // Extract key concepts (words in bold **text** or CAPS)
  const extractKeyConcepts = (text: string) => {
    const boldPattern = /\*\*(.+?)\*\*/g;
    const matches = Array.from(text.matchAll(boldPattern));
    return matches.map(m => m[1]);
  };

  const keyConcepts = extractKeyConcepts(explanation);

  return (
    <Card className="border-l-4 border-l-primary shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
            {isCorrect ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {isCorrect ? "Perfect! ✨" : "Let's Learn from This"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isCorrect 
                ? "You got it right! Here's why:"
                : "Understanding where you went wrong helps you improve"}
            </p>
          </div>
        </div>

        {/* Answer Comparison */}
        <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Correct Answer
            </p>
            <Badge className="bg-success text-white">
              {options?.[correctAnswer] || correctAnswer}
            </Badge>
          </div>
          
          {userAnswer !== null && !isCorrect && (
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                Your Answer
              </p>
              <Badge variant="destructive">
                {options?.[userAnswer] || userAnswer}
              </Badge>
            </div>
          )}
        </div>

        {/* Key Concepts */}
        {keyConcepts.length > 0 && (
          <div className="p-4 bg-info/10 rounded-lg border-l-4 border-info">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-info" />
              <h4 className="font-semibold">Key Concepts</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {keyConcepts.map((concept, index) => (
                <Badge key={index} variant="secondary" className="bg-info/20 text-info">
                  {concept}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Explanation */}
        {hasSteps ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h4 className="font-semibold">Step-by-Step Solution</h4>
            </div>
            
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <MathRenderer content={step.content} />
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Regular Explanation */
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h4 className="font-semibold">Explanation</h4>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <MathRenderer content={explanation} />
            </div>
          </div>
        )}

        {/* Pro Tip */}
        {!isCorrect && (
          <div className="p-4 bg-warning/10 rounded-lg border-l-4 border-warning">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">💡 Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  Practice similar questions to master this concept. Check the "Weak Topics" 
                  section on your dashboard for personalized recommendations!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
