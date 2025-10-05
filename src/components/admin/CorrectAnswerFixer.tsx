import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Save, Loader2, CheckCircle } from 'lucide-react';
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updates, setUpdates] = useState<Record<string, number>>({});
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      setSubjects(subjectsData || []);

      // Fetch questions with correct_answer = 0
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          options,
          correct_answer,
          subject_id,
          subjects!inner(name)
        `)
        .eq('is_active', true)
        .eq('correct_answer', 0)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      const formatted = (data || []).map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        options: Array.isArray(q.options) ? q.options : [],
        correct_answer: q.correct_answer,
        subject_name: q.subjects?.name || 'Unknown'
      }));

      setQuestions(formatted);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnswer = (questionId: string, newIndex: number) => {
    setUpdates(prev => ({ ...prev, [questionId]: newIndex }));
  };

  const handleSaveAll = async () => {
    if (Object.keys(updates).length === 0) {
      toast({
        title: 'No Changes',
        description: 'Please update at least one answer before saving',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const [questionId, correctIndex] of Object.entries(updates)) {
        const { error } = await supabase
          .from('questions')
          .update({ correct_answer: correctIndex })
          .eq('id', questionId);

        if (error) {
          console.error(`Error updating question ${questionId}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      toast({
        title: 'Update Complete',
        description: `Updated ${successCount} questions successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });

      if (successCount > 0) {
        setUpdates({});
        fetchData();
      }
    } catch (error) {
      console.error('Error saving updates:', error);
      toast({
        title: 'Error',
        description: 'Failed to save updates',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredQuestions = filterSubject === 'all' 
    ? questions 
    : questions.filter(q => q.subject_name === filterSubject);

  const allSubjects = ['all', ...new Set(questions.map(q => q.subject_name))];

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Issue Detected:</strong> Found {questions.length} questions with correct answer set to option A (index 0).
          Review and update the correct answers below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fix Correct Answers</CardTitle>
            <div className="flex items-center gap-3">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  {allSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject === 'all' ? 'All Subjects' : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSaveAll}
                disabled={saving || Object.keys(updates).length === 0}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save {Object.keys(updates).length} Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {filterSubject === 'all' 
                      ? 'No questions found with incorrect answer data!' 
                      : 'No questions found for this subject'}
                  </p>
                </div>
              ) : (
                filteredQuestions.map((question, idx) => (
                  <Card key={question.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2">
                              {question.subject_name}
                            </Badge>
                            <p className="font-medium text-sm mb-3">
                              {idx + 1}. {question.question_text.substring(0, 200)}
                              {question.question_text.length > 200 && '...'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          {question.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-3 rounded border cursor-pointer transition-colors ${
                                (updates[question.id] ?? question.correct_answer) === optIdx
                                  ? 'bg-green-50 border-green-500'
                                  : 'bg-background hover:bg-muted'
                              }`}
                              onClick={() => handleUpdateAnswer(question.id, optIdx)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  <strong>{String.fromCharCode(65 + optIdx)}.</strong> {option}
                                </span>
                                {(updates[question.id] ?? question.correct_answer) === optIdx && (
                                  <Badge className="bg-green-600">Correct Answer</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
