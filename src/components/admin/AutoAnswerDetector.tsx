import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, CheckCircle, XCircle } from 'lucide-react';

export default function AutoAnswerDetector() {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    found: number;
    updated: number;
    failed: number;
  } | null>(null);

  const extractAnswer = (text: string): number | null => {
    // Look for patterns like "Answer: A", "Answer:B", "Answer: C)", etc.
    const patterns = [
      /Answer:\s*([A-D])/i,
      /Answer\s+([A-D])/i,
      /^Answer:\s*([A-D])/im,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const letter = match[1].toUpperCase();
        return letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      }
    }
    return null;
  };

  const handleAutoDetect = async () => {
    setProcessing(true);
    setProgress(0);
    setStats(null);

    try {
      // Fetch all active questions
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, question_text, explanation')
        .eq('is_active', true);

      if (error) throw error;
      if (!questions || questions.length === 0) {
        toast({ title: 'No questions found', variant: 'destructive' });
        return;
      }

      let found = 0;
      let updated = 0;
      let failed = 0;

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionText = q.question_text?.toString() || '';
        const explanation = q.explanation?.toString() || '';
        
        // Try to find answer in question text first, then explanation
        const answerIdx = extractAnswer(questionText) ?? extractAnswer(explanation);

        if (answerIdx !== null) {
          found++;
          const { error: updateError } = await supabase
            .from('questions')
            .update({ correct_answer: answerIdx })
            .eq('id', q.id);

          if (updateError) {
            failed++;
          } else {
            updated++;
          }
        }

        // Update progress
        setProgress(Math.round(((i + 1) / questions.length) * 100));
      }

      setStats({
        total: questions.length,
        found,
        updated,
        failed,
      });

      toast({
        title: 'Auto-detection complete',
        description: `Updated ${updated} out of ${questions.length} questions`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Auto-detection failed',
        description: e.message || 'Unable to process questions',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto Answer Detector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This tool automatically scans all questions for "Answer: A/B/C/D" patterns in the
            question text or explanation field and updates the correct_answer column. No manual work
            required!
          </AlertDescription>
        </Alert>

        <Button onClick={handleAutoDetect} disabled={processing} className="w-full">
          {processing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4 mr-2" />
          )}
          {processing ? 'Processing...' : 'Auto-Detect & Fix All Answers'}
        </Button>

        {processing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">{progress}% complete</p>
          </div>
        )}

        {stats && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Answers Found</p>
                <p className="text-2xl font-bold">{stats.found}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-xl font-semibold text-green-600">{stats.updated}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-xl font-semibold text-red-600">{stats.failed}</p>
                </div>
              </div>
            </div>

            {stats.found < stats.total && (
              <Alert>
                <AlertDescription className="text-sm">
                  {stats.total - stats.found} questions don't have "Answer: X" pattern. You may need
                  to use the CSV Manager for those.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
