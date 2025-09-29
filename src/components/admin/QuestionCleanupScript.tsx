import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function QuestionCleanupScript() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<{ deleted_count: number } | null>(null);

  const deleteLatexQuestions = async () => {
    if (!confirm('Are you sure you want to delete ALL questions with LaTeX formulas in Islamic Religious Studies? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setResult(null);

      const { data, error } = await supabase.functions.invoke('question-cleanup', {
        body: {
          action: 'delete_incomplete',
          target_subject: 'Islamic Religious Studies'
        }
      });

      if (error) {
        console.error('Cleanup error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete questions",
          variant: "destructive"
        });
        return;
      }

      setResult(data);
      toast({
        title: "Success",
        description: `Deleted ${data.deleted_count} questions with LaTeX formulas`,
        variant: "default"
      });

    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: "Error", 
        description: "Failed to delete questions",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Delete LaTeX Questions
        </CardTitle>
        <CardDescription>
          Delete all questions containing unconverted LaTeX formulas in Islamic Religious Studies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will permanently delete all questions in Islamic Religious Studies that contain LaTeX formulas that haven't been converted. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <Button
          onClick={deleteLatexQuestions}
          disabled={isDeleting}
          variant="destructive"
          className="w-full"
        >
          {isDeleting ? 'Deleting...' : 'Delete LaTeX Questions'}
        </Button>

        {result && (
          <Alert>
            <AlertDescription>
              Successfully deleted {result.deleted_count} questions with LaTeX formulas from Islamic Religious Studies.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}