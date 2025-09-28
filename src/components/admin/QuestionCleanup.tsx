import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface IncompleteQuestion {
  id: string;
  reason: string;
  question_text?: string;
  subject_name?: string;
}

export default function QuestionCleanup() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [incompleteQuestions, setIncompleteQuestions] = useState<IncompleteQuestion[]>([]);
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number } | null>(null);

  const scanForIncompleteQuestions = async () => {
    try {
      setScanning(true);
      setCleanupResult(null);

      // Get incomplete questions with details
      const { data: incomplete, error } = await supabase.rpc('find_incomplete_questions');
      
      if (error) throw error;

      if (incomplete && incomplete.length > 0) {
        // Get question details for display
        const questionIds = incomplete.map((q: any) => q.id);
        const { data: questionDetails, error: detailsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            subjects!inner(name)
          `)
          .in('id', questionIds);

        if (detailsError) throw detailsError;

        const enrichedQuestions = incomplete.map((inc: any) => {
          const details = questionDetails?.find(q => q.id === inc.id);
          return {
            ...inc,
            question_text: details?.question_text || 'No text',
            subject_name: details?.subjects?.name || 'Unknown'
          };
        });

        setIncompleteQuestions(enrichedQuestions);
        toast({
          title: "Scan Complete",
          description: `Found ${incomplete.length} incomplete questions`,
          variant: "destructive"
        });
      } else {
        setIncompleteQuestions([]);
        toast({
          title: "Scan Complete",
          description: "No incomplete questions found!",
        });
      }
    } catch (error) {
      console.error('Error scanning questions:', error);
      toast({
        title: "Error",
        description: "Failed to scan for incomplete questions",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const deleteIncompleteQuestions = async () => {
    if (!incompleteQuestions.length) return;

    if (!confirm(`Are you sure you want to delete ${incompleteQuestions.length} incomplete questions? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const questionIds = incompleteQuestions.map(q => q.id);
      
      // Delete attempt answers first
      const { error: answersError } = await supabase
        .from('attempt_answers')
        .delete()
        .in('question_id', questionIds);

      if (answersError) throw answersError;

      // Delete questions
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .in('id', questionIds);

      if (questionsError) throw questionsError;

      setCleanupResult({ deleted: incompleteQuestions.length });
      setIncompleteQuestions([]);
      
      toast({
        title: "Cleanup Complete",
        description: `Successfully deleted ${questionIds.length} incomplete questions`,
      });
    } catch (error) {
      console.error('Error deleting questions:', error);
      toast({
        title: "Error",
        description: "Failed to delete incomplete questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'text_too_short': return 'Text Too Short';
      case 'missing_correct_answer': return 'Missing Answer';
      case 'too_few_options': return 'Too Few Options';
      case 'incomplete_sentence': return 'Incomplete Sentence';
      default: return reason;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'text_too_short': return 'bg-red-500';
      case 'missing_correct_answer': return 'bg-orange-500';
      case 'too_few_options': return 'bg-yellow-500';
      case 'incomplete_sentence': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>Question Quality Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              This tool scans for incomplete, malformed, or low-quality questions that should be cleaned up.
              Issues detected: short text, missing answers, incomplete sentences, and insufficient options.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-4">
            <Button 
              onClick={scanForIncompleteQuestions}
              disabled={scanning || loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : 'Scan Questions'}</span>
            </Button>

            {incompleteQuestions.length > 0 && (
              <Button 
                onClick={deleteIncompleteQuestions}
                disabled={loading || scanning}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {incompleteQuestions.length} Incomplete Questions</span>
              </Button>
            )}
          </div>

          {cleanupResult && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                Successfully deleted {cleanupResult.deleted} incomplete questions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {incompleteQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Incomplete Questions Found ({incompleteQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {incompleteQuestions.map((question) => (
                  <div key={question.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getReasonColor(question.reason)} text-white`}>
                          {getReasonLabel(question.reason)}
                        </Badge>
                        <Badge variant="outline">
                          {question.subject_name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {question.question_text || 'No question text'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}