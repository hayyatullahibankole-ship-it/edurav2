import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Search, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function QuestionDiagnostics() {
  const { toast } = useToast();
  const [diagnosing, setDiagnosing] = useState(false);
  const [samples, setSamples] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const runDiagnostics = async () => {
    setDiagnosing(true);
    try {
      // Get sample of questions with their full data
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, question_text, options, correct_answer, explanation')
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;

      // Count questions by correct_answer value
      const { data: allQuestions, error: countError } = await supabase
        .from('questions')
        .select('correct_answer')
        .eq('is_active', true);

      if (countError) throw countError;

      const answerDistribution = {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0
      };

      allQuestions?.forEach((q: any) => {
        const ans = q.correct_answer;
        if (ans >= 0 && ans <= 4) {
          answerDistribution[ans as keyof typeof answerDistribution]++;
        }
      });

      setStats({
        total: allQuestions?.length || 0,
        distribution: answerDistribution
      });

      setSamples(questions || []);

      toast({
        title: 'Diagnostics Complete',
        description: `Analyzed ${allQuestions?.length} questions`,
      });
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: 'Error',
        description: 'Failed to run diagnostics',
        variant: 'destructive'
      });
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question Database Diagnostics</CardTitle>
          <Button onClick={runDiagnostics} disabled={diagnosing}>
            {diagnosing ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <>
            <Alert className={stats.distribution[0] > stats.total * 0.8 ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Answer Distribution Analysis:</p>
                  <ul className="text-sm space-y-1">
                    <li>Total Questions: {stats.total}</li>
                    <li>Answer A (index 0): {stats.distribution[0]} ({Math.round(stats.distribution[0]/stats.total*100)}%)</li>
                    <li>Answer B (index 1): {stats.distribution[1]} ({Math.round(stats.distribution[1]/stats.total*100)}%)</li>
                    <li>Answer C (index 2): {stats.distribution[2]} ({Math.round(stats.distribution[2]/stats.total*100)}%)</li>
                    <li>Answer D (index 3): {stats.distribution[3]} ({Math.round(stats.distribution[3]/stats.total*100)}%)</li>
                  </ul>
                  {stats.distribution[0] > stats.total * 0.8 && (
                    <p className="text-red-800 font-medium mt-2">
                      ⚠️ {Math.round(stats.distribution[0]/stats.total*100)}% of questions have Answer A set as correct. This indicates the upload didn't capture correct answers properly.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Sample Questions (First 20):</h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {samples.map((q, idx) => {
                    const hasAnswerInText = (q.question_text + ' ' + (q.explanation || '')).toLowerCase();
                    const foundAnswer = hasAnswerInText.match(/answer\s*:\s*([a-e])/i) || 
                                       hasAnswerInText.match(/correct\s*(?:answer)?\s*:\s*([a-e])/i);
                    
                    return (
                      <Card key={q.id} className="border-l-4" style={{ borderLeftColor: foundAnswer ? '#22c55e' : '#ef4444' }}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2">Question {idx + 1}</Badge>
                                <p className="text-sm font-medium">
                                  {q.question_text.substring(0, 150)}...
                                </p>
                              </div>
                              {foundAnswer ? (
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Stored Answer:</span>
                                <Badge className="ml-2">{String.fromCharCode(65 + q.correct_answer)}</Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Found in Text:</span>
                                <Badge className="ml-2" variant={foundAnswer ? "default" : "destructive"}>
                                  {foundAnswer ? foundAnswer[1].toUpperCase() : 'None'}
                                </Badge>
                              </div>
                            </div>

                            {q.explanation && (
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                <strong>Explanation:</strong> {q.explanation.substring(0, 200)}...
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {!stats && (
          <Alert>
            <AlertDescription>
              Click "Run Diagnostics" to analyze your question database and identify issues with correct answers.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
