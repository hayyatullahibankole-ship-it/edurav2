import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MathRenderer } from '@/components/ui/math-renderer';
import { processQuestionText, processQuestionOptions } from '@/utils/latexProcessor';
import { 
  BookOpen, 
  Plus, 
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SimpleBulkUpload from './SimpleBulkUpload';
import LatexConverter from '@/components/admin/LatexConverter';
import QuestionCleanup from '@/components/admin/QuestionCleanup';

interface Question {
  id: string;
  question_text: string;
  type: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'FILL_IN' | 'MATCHING' | 'ESSAY';
  options: any;
  correct_answer: any;
  explanation: string;
  difficulty_level: number;
  tags: any;
  subject_id: string;
  is_active: boolean;
  points: number;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function QuestionManagement() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    type: 'MCQ_SINGLE' as 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'FILL_IN' | 'MATCHING' | 'ESSAY',
    options: ['', '', '', '', ''],
    correct_answer: '' as any,
    explanation: '',
    difficulty_level: 1,
    tags: [] as string[],
    subject_id: '',
    points: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects first
      console.log('Fetching subjects...');
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (subjectsError) {
        console.error('Subjects error:', subjectsError);
        toast({
          title: "Error",
          description: "Failed to load subjects: " + subjectsError.message,
          variant: "destructive"
        });
        setSubjects([]);
        setQuestions([]);
        return;
      }

      console.log('Subjects loaded:', subjectsData?.length || 0);
      setSubjects(subjectsData || []);

      if (!subjectsData || subjectsData.length === 0) {
        console.warn('No subjects found');
        toast({
          title: "Warning",
          description: "No subjects found. Please create subjects first.",
          variant: "destructive"
        });
        setQuestions([]);
        return;
      }

      // For admin users, always try the edge function first since the regular query has RLS issues
      console.log('Admin user detected - using admin edge function with pagination...');
      try {
        const pageSize = 1000; // Supabase PostgREST per-request cap
        let offset = 0;
        let all: any[] = [];

        // First page
        const first = await supabase.functions.invoke('admin-get-questions', {
          body: { activeOnly: true, limit: pageSize, offset }
        });
        const fnError = first.error as any;
        const fnData: any = first.data;

        console.log('Edge function first page:', { count: fnData?.count, received: fnData?.questions?.length, fnError, offset });

        if (fnError) {
          console.error('Edge function error:', fnError);
          throw new Error(fnError.message || 'Admin fetch failed');
        }

        const total: number = fnData?.count ?? 0;
        all = (fnData?.questions as any[]) || [];
        
        console.log(`Initial batch loaded: ${all.length}/${total} questions`);
        
        // If there are more questions to fetch, continue pagination
        if (total > pageSize) {
          offset = pageSize; // Start from the next page
          
          while (offset < total && all.length < total) {
            console.log(`Fetching next batch, offset: ${offset}, total needed: ${total}`);
            
            const next = await supabase.functions.invoke('admin-get-questions', {
              body: { activeOnly: true, limit: pageSize, offset }
            });
            
            if (next.error) {
              console.error('Pagination fetch error:', next.error);
              break;
            }
            
            const nextBatch = ((next.data as any)?.questions || []) as any[];
            console.log(`Received batch: ${nextBatch.length} questions`);
            
            if (nextBatch.length === 0) {
              console.log('No more questions in batch, stopping pagination');
              break;
            }
            
            all = all.concat(nextBatch);
            offset += nextBatch.length;
            console.log(`Progress: ${all.length}/${total} questions loaded`);
          }
        }

        console.log(`Final count: Loaded ${all.length} questions from edge function (expected: ${total})`);
        setQuestions(all);

        if (all.length === 0) {
          toast({
            title: "Info",
            description: "No questions found. Start by creating some questions.",
          });
        } else {
          toast({
            title: "Success",
            description: `Loaded ${all.length} questions successfully`,
          });
        }
        return; // Success - exit early
      } catch (fnCatch) {
        console.error('Edge function failed, trying direct query:', fnCatch);
        
        // Fallback to direct query if edge function fails
        console.log('Trying direct query as fallback...');
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            type,
            options,
            correct_answer,
            explanation,
            difficulty_level,
            tags,
            subject_id,
            is_active,
            points,
            created_at
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5000);

        if (questionsError) {
          console.error('Direct query also failed:', questionsError);
          const msg = fnCatch instanceof Error ? fnCatch.message : 'Unknown error occurred';
          toast({
            title: 'Error Loading Data',
            description: `Failed to load questions: ${msg}`,
            variant: 'destructive'
          });
          setQuestions([]);
        } else {
          console.log('Direct query successful:', questionsData?.length || 0);
          setQuestions(questionsData || []);
          
          if (!questionsData || questionsData.length === 0) {
            toast({
              title: "Info",
              description: "No questions found. Start by creating some questions.",
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error Loading Data", 
        description: `Failed to load questions: ${errorMessage}`,
        variant: "destructive"
      });
      
      // Set empty arrays to prevent undefined errors
      setQuestions([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!newQuestion.question_text.trim()) {
        throw new Error("Question text is required");
      }
      
      if (!newQuestion.subject_id) {
        throw new Error("Please select a subject");
      }
      
      if (newQuestion.type === 'MCQ_SINGLE') {
        const validOptions = newQuestion.options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
          throw new Error("Please provide at least 2 valid options");
        }
      }
      
      const questionData = {
        question_text: processQuestionText(newQuestion.question_text.trim()),
        type: newQuestion.type,
        options: newQuestion.type === 'MCQ_SINGLE' 
          ? processQuestionOptions(newQuestion.options.filter(opt => opt.trim() !== ''))
          : newQuestion.type === 'TRUE_FALSE' 
          ? ['True', 'False']
          : null,
        correct_answer: newQuestion.type === 'MCQ_SINGLE'
          ? newQuestion.correct_answer
          : newQuestion.type === 'TRUE_FALSE'
          ? (newQuestion.correct_answer === 0 ? 'True' : 'False')
          : newQuestion.options[0],
        explanation: processQuestionText(newQuestion.explanation.trim()),
        difficulty_level: newQuestion.difficulty_level,
        tags: Array.isArray(newQuestion.tags) ? newQuestion.tags : [],
        subject_id: newQuestion.subject_id,
        points: newQuestion.points,
        is_active: true
      };

      console.log('Creating question with data:', questionData);
      const { data, error } = await supabase.from('questions').insert(questionData).select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || "Failed to save question");
      }

      console.log('Question created successfully:', data);
      
      toast({
        title: "Success",
        description: "Question created successfully"
      });

      setIsCreateModalOpen(false);
      resetNewQuestion();
      fetchData();
      
    } catch (error) {
      console.error('Error creating question:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create question";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetNewQuestion = () => {
    setNewQuestion({
      question_text: '',
      type: 'MCQ_SINGLE' as 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'FILL_IN' | 'MATCHING' | 'ESSAY',
      options: ['', '', '', '', ''],
      correct_answer: '' as any,
      explanation: '',
      difficulty_level: 1,
      tags: [],
      subject_id: '',
      points: 1
    });
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsViewModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      question_text: question.question_text,
      type: question.type,
      options: question.options || {},
      correct_answer: question.correct_answer,
      explanation: question.explanation || '',
      difficulty_level: question.difficulty_level,
      tags: question.tags || [],
      subject_id: question.subject_id,
      points: question.points
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;
    
    try {
      setLoading(true);

      // Validate required fields
      if (!newQuestion.question_text.trim()) {
        throw new Error("Question text is required");
      }
      
      if (!newQuestion.subject_id) {
        throw new Error("Subject is required");
      }

      // Prepare question data
      const questionData = {
        question_text: newQuestion.question_text.trim(),
        type: newQuestion.type,
        options: newQuestion.options,
        correct_answer: newQuestion.correct_answer,
        explanation: newQuestion.explanation?.trim() || null,
        difficulty_level: newQuestion.difficulty_level,
        tags: Array.isArray(newQuestion.tags) ? newQuestion.tags : [],
        subject_id: newQuestion.subject_id,
        points: newQuestion.points
      };

      const { error } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', editingQuestion.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question updated successfully"
      });

      setIsEditModalOpen(false);
      setEditingQuestion(null);
      resetNewQuestion();
      fetchData();
      
    } catch (error) {
      console.error('Error updating question:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update question";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      const duplicatedQuestion = {
        question_text: `${question.question_text} (Copy)`,
        type: question.type,
        options: question.options,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        difficulty_level: question.difficulty_level,
        tags: question.tags,
        subject_id: question.subject_id,
        points: question.points,
        is_active: true
      };

      const { error } = await supabase.from('questions').insert(duplicatedQuestion);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question duplicated successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error duplicating question:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate question",
        variant: "destructive"
      });
    }
  };

  const handleViewAnalytics = (question: Question) => {
    setSelectedQuestion(question);
    setIsAnalyticsModalOpen(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to permanently delete this question? This action cannot be undone and will remove all related data.')) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('delete_question_safely', { qid: questionId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question permanently deleted successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const filteredQuestions = questions.filter(question => {
    const tags = Array.isArray(question.tags) ? question.tags : [];
    const qText = (question.question_text || '').toString();
    const matchesSearch = qText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tags.some((tag: any) => String(tag).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || question.subject_id === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || String(question.difficulty_level) === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const activeQuestions = filteredQuestions.filter(q => q.is_active);
  const inactiveQuestions = filteredQuestions.filter(q => !q.is_active);

  const getDifficultyLabel = (level: number) => {
    switch(level) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Unknown';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch(level) {
      case 1: return 'bg-accent';
      case 2: return 'bg-warning';
      case 3: return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const renderQuestionList = (list: Question[]) => (
    <Card>
      <CardContent className="p-6">
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 pr-4">
            {list.map((question) => (
              <div key={question.id} className="flex items-start justify-between p-6 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getDifficultyColor(question.difficulty_level)} text-white`}>
                      {getDifficultyLabel(question.difficulty_level)}
                    </Badge>
                    <Badge variant="outline">
                      {question.type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="secondary">
                      {subjects.find(s => s.id === question.subject_id)?.name || 'Unknown'}
                    </Badge>
                    {!question.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                  <div className="py-2">
                    <MathRenderer 
                      content={question.question_text}
                      className="font-medium text-lg leading-relaxed"
                    />
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2 border-t">
                    <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                    <span>{new Date(question.created_at).toLocaleDateString()}</span>
                    {question.tags && Array.isArray(question.tags) && question.tags.length > 0 && (
                      <span>Tags: {question.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleViewQuestion(question)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(question)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicateQuestion(question)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewAnalytics(question)}>
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  return (
    <ScrollArea className="h-[calc(100vh-120px)]">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Question Bank Management</h2>
            <p className="text-muted-foreground">Create, upload, and manage examination questions</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload Questions
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] h-[80vh] max-h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Bulk Upload WAEC/JAMB Questions</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden min-h-0">
                  <SimpleBulkUpload 
                    subjects={subjects} 
                    onUploadComplete={() => {
                      setIsBulkUploadOpen(false);
                      fetchData();
                    }} 
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Single Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh]">
                  <div className="space-y-4 p-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={newQuestion.subject_id} onValueChange={(value) => setNewQuestion({...newQuestion, subject_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.length > 0 ? (
                              subjects.map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>
                                No subjects available - Please create subjects first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Question Type</Label>
                        <Select value={newQuestion.type} onValueChange={(value: any) => setNewQuestion({...newQuestion, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCQ_SINGLE">Multiple Choice (Single)</SelectItem>
                            <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                            <SelectItem value="ESSAY">Essay</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="question">Question Text</Label>
                      <Textarea
                        id="question"
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                        placeholder="Enter your question..."
                        className="min-h-[100px]"
                      />
                    </div>

                    {newQuestion.type === 'MCQ_SINGLE' && (
                      <div className="space-y-3">
                        <Label>Options</Label>
                        {['A', 'B', 'C', 'D'].map((letter, index) => (
                          <div key={letter} className="flex items-center space-x-2">
                            <Label className="w-8">{letter}.</Label>
                            <Input
                              value={newQuestion.options[index]}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[index] = e.target.value;
                                setNewQuestion({...newQuestion, options: newOptions});
                              }}
                              placeholder={`Option ${letter}`}
                            />
                            <input
                              type="radio"
                              name="correct"
                              checked={newQuestion.correct_answer === index}
                              onChange={() => setNewQuestion({...newQuestion, correct_answer: index})}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="explanation">Explanation</Label>
                      <Textarea
                        id="explanation"
                        value={newQuestion.explanation}
                        onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                        placeholder="Explain why this answer is correct..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select value={newQuestion.difficulty_level.toString()} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty_level: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Easy</SelectItem>  
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="3">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          min="1"
                          max="10"
                          value={newQuestion.points}
                          onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateQuestion} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Question'}
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Questions (DB)</p>
                  <p className="text-2xl font-bold text-primary">{questions.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Filtered Results</p>
                  <p className="text-2xl font-bold text-accent">{activeQuestions.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subjects</p>
                  <p className="text-2xl font-bold text-foreground">{subjects.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Questions by Subject (Database Totals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subjects.map(subject => {
                const subjectQuestions = questions.filter(q => q.subject_id === subject.id);
                return (
                  <div key={subject.id} className="text-center p-3 border rounded-lg">
                    <p className="font-medium text-sm">{subject.name}</p>
                    <p className="text-2xl font-bold text-primary">{subjectQuestions.length}</p>
                    <p className="text-xs text-muted-foreground">{subject.code}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              Active Questions ({activeQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inactive Questions ({inactiveQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="upload">
              Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="latex">
              LaTeX Tools
            </TabsTrigger>
            <TabsTrigger value="cleanup">
              Question Cleanup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeQuestions.length > 0 ? (
              renderQuestionList(activeQuestions)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Questions</h3>
                  <p className="text-muted-foreground mb-4">Start by uploading questions using the bulk upload feature.</p>
                  <Button onClick={() => setIsBulkUploadOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Bulk Upload Questions
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inactive">
            {inactiveQuestions.length > 0 ? (
              renderQuestionList(inactiveQuestions)
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Inactive Questions</h3>
                  <p className="text-muted-foreground">All questions are currently active.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <SimpleBulkUpload subjects={subjects} onUploadComplete={fetchData} />
          </TabsContent>

          <TabsContent value="latex">
            <div className="space-y-6">
              <LatexConverter />
            </div>
          </TabsContent>

          <TabsContent value="cleanup">
            <QuestionCleanup />
          </TabsContent>
        </Tabs>

        {/* View Question Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Question</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Question Text</Label>
                  <div className="mt-1 p-3 border rounded-md bg-muted">
                    <MathRenderer content={selectedQuestion.question_text} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="mt-1 text-sm">{selectedQuestion.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Difficulty</Label>
                    <p className="mt-1 text-sm">{selectedQuestion.difficulty_level}/5</p>
                  </div>
                </div>

                {selectedQuestion.options && typeof selectedQuestion.options === 'object' && (
                  <div>
                    <Label className="text-sm font-medium">Options</Label>
                    <div className="mt-1 space-y-2">
                      {Object.entries(selectedQuestion.options).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Badge variant={selectedQuestion.correct_answer === key ? "default" : "outline"}>
                            {key.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedQuestion.explanation && (
                  <div>
                    <Label className="text-sm font-medium">Explanation</Label>
                    <div className="mt-1 p-3 border rounded-md bg-muted">
                      <MathRenderer content={selectedQuestion.explanation} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) {
            setEditingQuestion(null);
            resetNewQuestion();
          }
        }}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newQuestion.subject_id} onValueChange={(value) => setNewQuestion({...newQuestion, subject_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length > 0 ? (
                          subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No subjects available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Question Type</Label>
                    <Select value={newQuestion.type} onValueChange={(value: any) => setNewQuestion({...newQuestion, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCQ_SINGLE">Multiple Choice (Single)</SelectItem>
                        <SelectItem value="MCQ_MULTI">Multiple Choice (Multi)</SelectItem>
                        <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                        <SelectItem value="FILL_IN">Fill in the Blank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="question">Question Text</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.question_text}
                    onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                    placeholder="Enter your question here..."
                    rows={4}
                  />
                </div>

                {(newQuestion.type === 'MCQ_SINGLE' || newQuestion.type === 'MCQ_MULTI') && (
                  <div>
                    <Label>Options</Label>
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D', 'E'].map((letter, index) => (
                        <div key={letter} className="flex items-center space-x-2">
                          <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                            {letter}
                          </Badge>
                          <Input
                            value={newQuestion.options[letter] || ''}
                            onChange={(e) => setNewQuestion({
                              ...newQuestion, 
                              options: {...newQuestion.options, [letter]: e.target.value}
                            })}
                            placeholder={`Option ${letter}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <Label>Correct Answer</Label>
                      <Select 
                        value={String(newQuestion.correct_answer)} 
                        onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A', 'B', 'C', 'D', 'E'].map(letter => (
                            <SelectItem key={letter} value={letter}>
                              Option {letter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                    placeholder="Explain why this answer is correct..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={newQuestion.difficulty_level.toString()} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty_level: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>  
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="10"
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateQuestion} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Question'}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Analytics Modal */}
        <Dialog open={isAnalyticsModalOpen} onOpenChange={setIsAnalyticsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Question Analytics</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Attempts</p>
                          <p className="text-2xl font-bold">-</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Correct Rate</p>
                          <p className="text-2xl font-bold">-</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Time</p>
                          <p className="text-2xl font-bold">-</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                          <p className="text-2xl font-bold">{selectedQuestion.difficulty_level}/5</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Alert>
                  <BarChart3 className="h-4 w-4" />
                  <AlertDescription>
                    Detailed analytics will be available once students start attempting this question.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}