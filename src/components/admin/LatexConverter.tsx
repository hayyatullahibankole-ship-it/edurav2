import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Code, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function LatexConverter() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated_count: number } | null>(null);

  const handleConvertLatex = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('convert_latex_mathbf_to_markdown');
      
      if (error) {
        console.error('Error converting LaTeX:', error);
        toast.error('Failed to convert LaTeX formatting');
        return;
      }

      const updateCount = Array.isArray(data) && data.length > 0 ? data[0].updated_count : 0;
      setResult({ updated_count: updateCount });
      toast.success(`Successfully converted LaTeX formatting in ${updateCount} questions`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred during conversion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          LaTeX to Markdown Converter
        </CardTitle>
        <CardDescription>
          Convert LaTeX \mathbf{'{}'} commands to Markdown **bold** formatting across all questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will convert all \mathbf{'{text}'} commands to **text** formatting in questions, options, and explanations.
            This operation cannot be undone.
          </AlertDescription>
        </Alert>

        {result && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Conversion completed successfully! Updated {result.updated_count} question{result.updated_count !== 1 ? 's' : ''}.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleConvertLatex}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {loading ? 'Converting...' : 'Run Conversion'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}