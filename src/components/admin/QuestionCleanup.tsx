import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IncompleteQuestion {
  id: string;
  reason: string;
  question_text?: string;
  subject_name?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function QuestionCleanup() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [incompleteQuestions, setIncompleteQuestions] = useState<IncompleteQuestion[]>([]);
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number } | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const scanForIncompleteQuestions = async () => {
    try {
      setScanning(true);
      setCleanupResult(null);

      const targetSubject = selectedSubject === 'all' ? null : selectedSubject;

      // Get incomplete questions with details
      const { data: incomplete, error } = await supabase.rpc('find_incomplete_questions', {
        target_subject: targetSubject
      });
      
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

  const fixLatexQuestions = async () => {
    try {
      setFixing(true);
      const targetSubject = selectedSubject === 'all' ? null : selectedSubject;

      const { data, error } = await supabase.rpc('fix_latex_questions', {
        target_subject: targetSubject
      });

      if (error) throw error;

      const fixedCount = data?.[0]?.updated_count || 0;
      toast({
        title: "LaTeX Fix Complete",
        description: `Fixed ${fixedCount} questions with LaTeX formatting`,
      });

      // Refresh the scan
      await scanForIncompleteQuestions();
    } catch (error) {
      console.error('Error fixing LaTeX:', error);
      toast({
        title: "Error",
        description: "Failed to fix LaTeX formatting",
        variant: "destructive"
      });
    } finally {
      setFixing(false);
    }
  };

  const deleteIncompleteQuestions = async () => {
    if (!incompleteQuestions.length) return;

    if (!confirm(`Are you sure you want to delete ${incompleteQuestions.length} incomplete questions? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const targetSubject = selectedSubject === 'all' ? null : selectedSubject;
      
      const { data, error } = await supabase.rpc('delete_incomplete_questions', {
        target_subject: targetSubject
      });

      if (error) throw error;

      const deletedCount = data?.[0]?.deleted || 0;
      setCleanupResult({ deleted: deletedCount });
      setIncompleteQuestions([]);
      
      toast({
        title: "Cleanup Complete",
        description: `Successfully deleted ${deletedCount} incomplete questions`,
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
      case 'latex_leftovers': return 'LaTeX Leftovers';
      default: return reason;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'text_too_short': return 'bg-red-500';
      case 'missing_correct_answer': return 'bg-orange-500';
      case 'too_few_options': return 'bg-yellow-500';
      case 'incomplete_sentence': return 'bg-purple-500';
      case 'latex_leftovers': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span>Subject-Specific Question Quality Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
            This tool scans for incomplete, malformed, or low-quality questions that should be cleaned up.
            Issues detected: short text, missing answers, incomplete sentences, LaTeX leftovers, and insufficient options.
            Use the subject filter to target specific subjects like "Christian Religious Studies".
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject Filter</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject or all" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={scanForIncompleteQuestions}
              disabled={scanning || loading || fixing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Scanning...' : `Scan ${selectedSubject === 'all' ? 'All' : selectedSubject}`}</span>
            </Button>

            <Button 
              onClick={fixLatexQuestions}
              disabled={scanning || loading || fixing}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <AlertTriangle className={`w-4 h-4 ${fixing ? 'animate-spin' : ''}`} />
              <span>{fixing ? 'Fixing...' : 'Fix LaTeX Issues'}</span>
            </Button>

            {incompleteQuestions.length > 0 && (
              <Button 
                onClick={deleteIncompleteQuestions}
                disabled={loading || scanning || fixing}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {incompleteQuestions.length} Issues</span>
              </Button>
            )}
          </div>
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