import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';

export default function AdminNormalize() {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [result, setResult] = useState<{ updated: number; failed: number } | null>(null);
  const { toast } = useToast();

  const handlePreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('normalize_question_answers');
      
      if (error) throw error;
      
      setPreview(data || []);
      toast({
        title: 'Preview Generated',
        description: `Found ${data?.length || 0} questions to review`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNormalize = async () => {
    if (!confirm('This will update all questions to use integer-based answers (0-3). Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('apply_answer_normalization');
      
      if (error) throw error;
      
      const resultData = data?.[0];
      setResult({
        updated: resultData?.updated_count || 0,
        failed: resultData?.failed_count || 0
      });
      
      toast({
        title: 'Normalization Complete',
        description: `Updated ${resultData?.updated_count || 0} questions`
      });

      // Refresh preview
      handlePreview();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Answer Format Normalization</h1>
          <p className="text-muted-foreground">
            Convert all questions to use standardized 0-based integer format
          </p>
        </div>

        <div className="grid gap-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Instructions</CardTitle>
              <CardDescription>
                This tool converts all question answers to a consistent integer format (0, 1, 2, 3)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">What this does:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Converts letter answers (A, B, C, D) to indices (0, 1, 2, 3)</li>
                  <li>Converts string numbers ("0", "1") to integers (0, 1)</li>
                  <li>Standardizes all questions to use the same format</li>
                  <li>Makes answer validation simple and reliable</li>
                </ul>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Always preview before applying changes. This operation updates the database.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button 
                  onClick={handlePreview}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Preview Changes
                </Button>
                <Button 
                  onClick={handleNormalize}
                  disabled={loading || preview.length === 0}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Apply Normalization
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Normalization Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{result.updated}</div>
                    <div className="text-sm text-muted-foreground">Questions Updated</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{result.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Table */}
          {preview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview ({preview.length} questions)</CardTitle>
                <CardDescription>
                  Showing how answers will be converted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-2">Question ID</th>
                        <th className="text-left p-2">Old Format</th>
                        <th className="text-left p-2">New Format</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((row) => (
                        <tr key={row.question_id} className="border-b">
                          <td className="p-2 font-mono text-xs">
                            {row.question_id.slice(0, 8)}...
                          </td>
                          <td className="p-2 font-mono">{row.old_format}</td>
                          <td className="p-2 font-mono font-bold text-green-600">
                            {row.new_format}
                          </td>
                          <td className="p-2">
                            <Badge variant={row.status === 'already_normalized' ? 'default' : 'outline'}>
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 50 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Showing first 50 of {preview.length} questions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
