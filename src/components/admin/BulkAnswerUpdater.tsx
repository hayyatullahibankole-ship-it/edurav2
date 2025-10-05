import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function BulkAnswerUpdater() {
  const { toast } = useToast();
  const [mappingText, setMappingText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processMapping = async () => {
    if (!mappingText.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste your questions with answers',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm('This will update correct answers based on the text you provide. Continue?')) {
      return;
    }

    setProcessing(true);
    setResult(null);

    try {
      // Parse the input text
      const lines = mappingText.trim().split('\n');
      const questionMap = new Map();
      
      let currentQuestionNum = null;
      let currentQuestionText = '';
      let currentAnswer = null;

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check if this is a question number
        const questionMatch = trimmed.match(/^(\d+)\.\s*(.+)/);
        if (questionMatch) {
          // Save previous question if exists
          if (currentQuestionNum && currentQuestionText && currentAnswer) {
            questionMap.set(currentQuestionText.substring(0, 100).toLowerCase(), currentAnswer);
          }
          
          currentQuestionNum = questionMatch[1];
          currentQuestionText = questionMatch[2];
          currentAnswer = null;
        } else if (trimmed.match(/^Answer:\s*([A-E])/i)) {
          // Found answer line
          const answerMatch = trimmed.match(/^Answer:\s*([A-E])/i);
          if (answerMatch) {
            currentAnswer = answerMatch[1].toUpperCase();
          }
        } else if (currentQuestionText && !trimmed.startsWith('A)') && !trimmed.startsWith('B)')) {
          // Continue question text
          currentQuestionText += ' ' + trimmed;
        }
      }

      // Save last question
      if (currentQuestionNum && currentQuestionText && currentAnswer) {
        questionMap.set(currentQuestionText.substring(0, 100).toLowerCase(), currentAnswer);
      }

      console.log(`Parsed ${questionMap.size} questions from input`);

      // Fetch all questions from database
      const { data: dbQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('id, question_text, correct_answer')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      let matchedCount = 0;
      let updatedCount = 0;
      const updates = [];

      // Match database questions with parsed answers
      for (const dbQ of dbQuestions || []) {
        const dbTextStart = dbQ.question_text.substring(0, 100).toLowerCase().trim();
        
        // Try to find a match
        for (const [parsedText, answer] of questionMap.entries()) {
          if (dbTextStart.includes(parsedText) || parsedText.includes(dbTextStart.substring(0, 50))) {
            matchedCount++;
            const correctIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(answer);
            
            if (correctIndex !== -1 && correctIndex !== dbQ.correct_answer) {
              updates.push({
                id: dbQ.id,
                correct_answer: correctIndex,
                old_answer: String.fromCharCode(65 + (typeof dbQ.correct_answer === 'number' ? dbQ.correct_answer : 0)),
                new_answer: answer
              });
            }
            break;
          }
        }
      }

      // Perform updates
      for (const update of updates) {
        const { error } = await supabase
          .from('questions')
          .update({ correct_answer: update.correct_answer })
          .eq('id', update.id);

        if (!error) {
          updatedCount++;
        }
      }

      setResult({
        parsed: questionMap.size,
        total: dbQuestions?.length || 0,
        matched: matchedCount,
        updated: updatedCount,
        sample: updates.slice(0, 5)
      });

      toast({
        title: 'Update Complete',
        description: `Updated ${updatedCount} questions successfully`,
      });

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process answers',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Answer Updater</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <p className="font-medium">Instructions:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Paste your questions in the format: Question number, options, "Answer: X"</li>
                <li>The tool will match questions by text and update correct answers</li>
                <li>You can paste in batches (e.g., 100-200 questions at a time)</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Paste Questions Here:</label>
          <Textarea
            value={mappingText}
            onChange={(e) => setMappingText(e.target.value)}
            placeholder="1. Find the value of x...
A) 5
B) 4
C) 6
D) 3
Answer: A

2. Which of the following gases...
A) Sulphur dioxide
B) Ammonia
Answer: B"
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        <Button 
          onClick={processMapping}
          disabled={processing || !mappingText.trim()}
          className="w-full"
        >
          {processing ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-pulse" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Update Answers
            </>
          )}
        </Button>

        {result && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-medium">Results:</p>
                <ul className="text-sm space-y-1">
                  <li>Parsed from input: {result.parsed} questions</li>
                  <li>Total in database: {result.total} questions</li>
                  <li>Successfully matched: {result.matched} questions</li>
                  <li>Updated: {result.updated} questions</li>
                </ul>
                {result.sample.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium mb-1">Sample updates:</p>
                    {result.sample.map((s: any, i: number) => (
                      <div key={i} className="text-xs">
                        Question changed from {s.old_answer} → {s.new_answer}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
