import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2, CheckCircle, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: any;
  subject_name?: string;
}

export default function CorrectAnswerFixer() {
  const { toast } = useToast();
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    checkQuestionCount();
  }, []);

  const checkQuestionCount = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('correct_answer', 0)
        .eq('is_active', true);

      if (error) throw error;
      setQuestionCount(count || 0);
    } catch (error) {
      console.error('Error checking questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to check questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFix = async () => {
    if (!confirm(`This will automatically scan ${questionCount} questions and fix correct answers based on patterns like "Answer: B" found in the text. Continue?`)) {
      return;
    }

    setAutoFixing(true);
    setResult(null);

    try {
      // Fetch all questions with correct_answer = 0
      const { data: questions, error: fetchError } = await supabase
        .from('questions')
        .select('id, question_text, explanation, options')
        .eq('correct_answer', 0)
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      let fixedCount = 0;
      let notFoundCount = 0;

      for (const question of questions || []) {
        const text = `${question.question_text} ${question.explanation || ''}`.toLowerCase();
        
        // Look for answer patterns
        let detectedAnswer: number | null = null;
        
        // Pattern 1: "answer: B" or "answer:B"
        const answerMatch = text.match(/answer\s*:\s*([a-e])/i);
        if (answerMatch) {
          detectedAnswer = answerMatch[1].toUpperCase().charCodeAt(0) - 65;
        }
        
        // Pattern 2: "correct: C" or "correct answer: C"
        if (detectedAnswer === null) {
          const correctMatch = text.match(/correct\s*(?:answer)?\s*:\s*([a-e])/i);
          if (correctMatch) {
            detectedAnswer = correctMatch[1].toUpperCase().charCodeAt(0) - 65;
          }
        }
        
        // Pattern 3: "option B is correct"
        if (detectedAnswer === null) {
          const optionMatch = text.match(/option\s+([a-e])\s+is\s+correct/i);
          if (optionMatch) {
            detectedAnswer = optionMatch[1].toUpperCase().charCodeAt(0) - 65;
          }
        }
        
        // Validate against available options
        const optionsCount = Array.isArray(question.options) ? question.options.length : 4;
        if (detectedAnswer !== null && detectedAnswer >= 0 && detectedAnswer < optionsCount) {
          // Update this question
          const { error: updateError } = await supabase
            .from('questions')
            .update({ correct_answer: detectedAnswer })
            .eq('id', question.id);

          if (updateError) {
            console.error(`Failed to update question ${question.id}:`, updateError);
            notFoundCount++;
          } else {
            fixedCount++;
          }
        } else {
          notFoundCount++;
        }
      }

      setResult({
        total: questions?.length || 0,
        fixed: fixedCount,
        notFound: notFoundCount,
        message: `Fixed ${fixedCount} questions. ${notFoundCount} questions could not be auto-detected and need manual review.`
      });

      toast({
        title: 'Auto-Fix Complete',
        description: `Fixed ${fixedCount} out of ${questions?.length || 0} questions`,
      });

      // Refresh count
      checkQuestionCount();
    } catch (error) {
      console.error('Error auto-fixing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to auto-fix questions',
        variant: 'destructive'
      });
    } finally {
      setAutoFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correct Answer Auto-Fix Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : questionCount === 0 ? (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>All Good!</strong> No questions found with correct answer issues. All questions have valid answers set.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Issue Detected:</strong> Found {questionCount} questions with correct answer set to 0 (option A).
                This tool will automatically scan question text and explanations for answer patterns like "Answer: B" or "Correct: C" and fix them.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Questions to Fix: {questionCount}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  The tool will scan for patterns: "Answer: X", "Correct: X", "Option X is correct"
                </p>
              </div>
              <Button 
                onClick={handleAutoFix}
                disabled={autoFixing}
                size="lg"
                className="ml-4"
              >
                {autoFixing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Auto-Fixing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-Fix All Questions
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Alert className="border-blue-500 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <div className="space-y-2">
                    <p><strong>Auto-Fix Results:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Total Scanned: {result.total}</li>
                      <li>Successfully Fixed: {result.fixed}</li>
                      <li>Could Not Auto-Detect: {result.notFound}</li>
                    </ul>
                    {result.notFound > 0 && (
                      <p className="mt-2 text-sm">
                        Questions that couldn't be auto-fixed don't have clear answer indicators in their text.
                        You may need to review those manually or re-upload with proper answer formatting.
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
