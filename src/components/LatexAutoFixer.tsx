import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wand2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { autoFixQuestionsLatex } from '@/utils/latexProcessor';

export default function LatexAutoFixer() {
  const { toast } = useToast();
  const [fixing, setFixing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; processed?: number; error?: string } | null>(null);

  const handleAutoFix = async () => {
    try {
      setFixing(true);
      setProgress(0);
      setResult(null);

      toast({
        title: "Auto-Fix Started",
        description: "Processing questions to improve LaTeX rendering...",
      });

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const fixResult = await autoFixQuestionsLatex(supabase, 50);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResult(fixResult);

      if (fixResult.success) {
        toast({
          title: "Auto-Fix Complete!",
          description: `Successfully processed ${fixResult.processed} questions`,
        });
      } else {
        toast({
          title: "Auto-Fix Failed",
          description: fixResult.error || "An error occurred during processing",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error in auto-fix:', error);
      toast({
        title: "Error",
        description: "Failed to run auto-fix process",
        variant: "destructive"
      });
      setResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          LaTeX Auto-Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This tool will automatically convert mathematical expressions, chemical formulas, 
            and scientific notation in your questions to proper LaTeX format for better rendering.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">What will be fixed:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Fractions (2/3 → LaTeX format)</li>
            <li>• Square roots (√x → LaTeX format)</li>
            <li>• Powers (x^2 → LaTeX format)</li>
            <li>• Mathematical symbols (≤, ≥, π, etc.)</li>
            <li>• Chemical formulas (H2O → H₂O)</li>
            <li>• Physics units (m/s2 → m/s²)</li>
          </ul>
        </div>

        {fixing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing questions... {progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : ""}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {result.success 
                ? `Successfully processed ${result.processed} questions with LaTeX improvements!`
                : `Error: ${result.error}`
              }
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleAutoFix} 
          disabled={fixing}
          className="w-full"
        >
          {fixing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Fixing Questions...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Fix All Questions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}