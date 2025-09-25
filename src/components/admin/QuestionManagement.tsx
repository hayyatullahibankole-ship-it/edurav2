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
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SimpleBulkUpload from './SimpleBulkUpload';

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

  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [analyticsQuestion, setAnalyticsQuestion] = useState<Question | null>(null);
  const [analyticsData, setAnalyticsData] = useState<{ total: number; correct: number; accuracy: number; avgTime: number; lastAnswered?: string } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    type: 'MCQ_SINGLE' as 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'FILL_IN' | 'MATCHING' | 'ESSAY',
    options: ['', '', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty_level: 1,
    tags: [] as string[],
    subject_id: '',
    points: 1
  });

  const [bulkUpload, setBulkUpload] = useState({
    file: null as File | null,
    preview: [] as any[],
    errors: [] as string[],
    mapping: {
      question: 0,
      optionA: 1,
      optionB: 2,
      optionC: 3,
      optionD: 4,
      optionE: 5,
      correct: 6,
      explanation: 7,
      subject: 8,
      difficulty: 9,
      tags: 10
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!analyticsQuestion) {
        setAnalyticsData(null);
        return;
      }
      try {
        setLoadingAnalytics(true);
        const { data, error } = await supabase
          .from('attempt_answers')
          .select('is_correct, time_spent_seconds, answered_at')
          .eq('question_id', analyticsQuestion.id);
        if (error) throw error;
        const total = data?.length || 0;
        const correct = data?.filter(d => d.is_correct).length || 0;
        const avgTime = total > 0 ? Math.round((data?.reduce((sum, d) => sum + (d.time_spent_seconds || 0), 0) || 0) / total) : 0;
        const lastAnswered = total > 0 ? data!.reduce((latest, d) => {
          const t = d.answered_at ? new Date(d.answered_at).getTime() : 0;
          return t > latest ? t : latest;
        }, 0) : 0;
        setAnalyticsData({ total, correct, accuracy: total ? Math.round((correct / total) * 100) : 0, avgTime, lastAnswered: lastAnswered ? new Date(lastAnswered).toISOString() : undefined });
      } catch (e) {
        console.error('Analytics load error', e);
        setAnalyticsData(null);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    loadAnalytics();
  }, [analyticsQuestion]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [questionsResp, subjectsResp] = await Promise.all([
        supabase.from('questions').select(`
          *,
          subjects(name, code)
        `).order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').eq('is_active', true)
      ]);

      setQuestions(questionsResp.data || []);
      setSubjects(subjectsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load questions data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setLoading(true);
      
      const questionData = {
        question_text: newQuestion.question_text,
        type: newQuestion.type,
        options: newQuestion.type === 'MCQ_SINGLE' 
          ? newQuestion.options.filter(opt => opt.trim() !== '')
          : newQuestion.type === 'TRUE_FALSE' 
          ? ['True', 'False']
          : null,
        correct_answer: newQuestion.type === 'MCQ_SINGLE'
          ? newQuestion.correct_answer
          : newQuestion.type === 'TRUE_FALSE'
          ? newQuestion.correct_answer
          : newQuestion.options[0], // For fill in blank
        explanation: newQuestion.explanation,
        difficulty_level: newQuestion.difficulty_level,
        tags: newQuestion.tags,
        subject_id: newQuestion.subject_id,
        points: newQuestion.points,
        is_active: true
      };

      const { error } = await supabase.from('questions').insert(questionData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question created successfully"
      });

      setIsCreateModalOpen(false);
      resetNewQuestion();
      fetchData();
      
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: "Error",
        description: "Failed to create question",
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
      correct_answer: 0,
      explanation: '',
      difficulty_level: 1,
      tags: [],
      subject_id: '',
      points: 1
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkUpload(prev => ({ ...prev, file }));
    
    // Parse CSV/Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      const preview = rows.slice(0, 10); // Show first 10 rows
      
      setBulkUpload(prev => ({ ...prev, preview }));
    };
    reader.readAsText(file);
  };

  const processBulkUpload = async () => {
    if (!bulkUpload.file || !bulkUpload.preview.length) return;

    try {
      setLoading(true);
      const errors: string[] = [];
      const questionsToInsert: any[] = [];

      bulkUpload.preview.slice(1).forEach((row, index) => {
        if (row.length < 7) {
          errors.push(`Row ${index + 2}: Insufficient columns`);
          return;
        }

        const question = {
          question_text: row[bulkUpload.mapping.question]?.trim(),
          type: 'MCQ_SINGLE',
          options: [
            row[bulkUpload.mapping.optionA]?.trim(),
            row[bulkUpload.mapping.optionB]?.trim(),
            row[bulkUpload.mapping.optionC]?.trim(),
            row[bulkUpload.mapping.optionD]?.trim(),
            row[bulkUpload.mapping.optionE]?.trim()
          ].filter(opt => opt),
          correct_answer: parseInt(row[bulkUpload.mapping.correct]) || 0,
          explanation: row[bulkUpload.mapping.explanation]?.trim() || '',
          difficulty_level: parseInt(row[bulkUpload.mapping.difficulty]) || 1,
          tags: row[bulkUpload.mapping.tags]?.split(';').map(t => t.trim()) || [],
          subject_id: subjects.find(s => s.name.toLowerCase() === row[bulkUpload.mapping.subject]?.toLowerCase())?.id,
          points: 1,
          is_active: true
        };

        if (!question.question_text) {
          errors.push(`Row ${index + 2}: Missing question text`);
          return;
        }

        if (!question.subject_id) {
          errors.push(`Row ${index + 2}: Invalid subject "${row[bulkUpload.mapping.subject]}"`);
          return;
        }

        questionsToInsert.push(question);
      });

      if (errors.length > 0) {
        setBulkUpload(prev => ({ ...prev, errors }));
        return;
      }

      const { error } = await supabase.from('questions').insert(questionsToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${questionsToInsert.length} questions uploaded successfully`
      });

      setIsBulkUploadOpen(false);
      setBulkUpload({
        file: null,
        preview: [],
        errors: [],
        mapping: {
          question: 0,
          optionA: 1,
          optionB: 2,
          optionC: 3,
          optionD: 4,
          optionE: 5,
          correct: 6,
          explanation: 7,
          subject: 8,
          difficulty: 9,
          tags: 10
        }
      });
      fetchData();

    } catch (error) {
      console.error('Error uploading questions:', error);
      toast({
        title: "Error",
        description: "Failed to upload questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully generated ${data.totalQuestions} questions across ${data.subjects.length} subjects`,
      });

      // Refresh the questions list
      fetchData();
      
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error", 
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'all' || question.subject_id === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty_level.toString() === selectedDifficulty;
    
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
      case 1: return 'bg-green-600';
      case 2: return 'bg-yellow-600';
      case 3: return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const renderQuestionList = (list: Question[]) => (
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-6">
        <div className="space-y-4">
          {list.map((question) => (
            <div key={question.id} className="flex items-start justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={`${getDifficultyColor(question.difficulty_level)} text-white`}>
                    {getDifficultyLabel(question.difficulty_level)}
                  </Badge>
                  <Badge variant="outline" className="text-slate-300">
                    {question.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">
                    {subjects.find(s => s.id === question.subject_id)?.name || 'Unknown'}
                  </Badge>
                  {!question.is_active && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
                <p className="text-white font-medium mb-2 line-clamp-2">
                  {question.question_text}
                </p>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                  <span>{new Date(question.created_at).toLocaleDateString()}</span>
                  {question.tags && Array.isArray(question.tags) && question.tags.length > 0 && (
                    <span>Tags: {question.tags.join(', ')}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPreviewQuestion(question)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setEditQuestion(question); setEditForm({ ...question }); }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={async () => {
                    try {
                      // Create a duplicate of the question
                      const duplicateData = {
                        question_text: question.question_text + " (Copy)",
                        type: question.type,
                        subject_id: question.subject_id,
                        options: question.options,
                        correct_answer: question.correct_answer,
                        explanation: question.explanation,
                        difficulty_level: question.difficulty_level,
                        points: question.points,
                        tags: question.tags,
                        is_active: true
                      };

                      const { error } = await supabase
                        .from('questions')
                        .insert(duplicateData);

                      if (error) throw error;

                      toast({
                        title: "Success",
                        description: "Question duplicated successfully"
                      });

                      // Refresh the questions list
                      fetchData();
                      
                    } catch (error) {
                      console.error('Error duplicating question:', error);
                      toast({
                        title: "Error",
                        description: "Failed to duplicate question",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => { setAnalyticsQuestion(question); }}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={async () => {
                    const confirmMessage = `Are you sure you want to delete the question: "${question.question_text.substring(0, 50)}..."?`;
                    if (confirm(confirmMessage)) {
                      try {
                        setLoading(true);
                        
                        // First check if question is being used in any attempts
                        const { data: attemptAnswers } = await supabase
                          .from('attempt_answers')
                          .select('id')
                          .eq('question_id', question.id)
                          .limit(1);
                        
                        if (attemptAnswers && attemptAnswers.length > 0) {
                          // Soft delete by setting is_active to false
                          const { error } = await supabase
                            .from('questions')
                            .update({ is_active: false })
                            .eq('id', question.id);
                          
                          if (error) throw error;
                          
                          toast({
                            title: "Question Deactivated",
                            description: "Question has been deactivated as it's being used in exam attempts"
                          });
                        } else {
                          // Hard delete if not used
                          const { error } = await supabase
                            .from('questions')
                            .delete()
                            .eq('id', question.id);
                          
                          if (error) throw error;
                          
                          toast({
                            title: "Success",
                            description: "Question deleted successfully"
                          });
                        }
                        
                        await fetchData();
                      } catch (error) {
                        console.error('Delete error:', error);
                        toast({
                          title: "Error",
                          description: "Failed to delete question. Please try again.",
                          variant: "destructive"
                        });
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No questions found</p>
              <p className="text-sm text-slate-500 mt-2">
                {searchTerm || selectedSubject !== 'all' || selectedDifficulty !== 'all' 
                  ? 'Try adjusting your search filters'
                  : 'Create your first question to get started'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Question Bank Management</h2>
          <p className="text-slate-400">Create, upload, and manage examination questions</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            onClick={handleGenerateQuestions}
            disabled={isGenerating || loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate 500 Questions/Subject
              </>
            )}
          </Button>

          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Bulk Upload Questions</DialogTitle>
              </DialogHeader>
              <SimpleBulkUpload 
                subjects={subjects} 
                onUploadComplete={() => {
                  setIsBulkUploadOpen(false);
                  fetchData();
                }} 
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newQuestion.subject_id} onValueChange={(value) => setNewQuestion({...newQuestion, subject_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="MCQ_SINGLE">Multiple Choice</SelectItem>
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
                    rows={3}
                  />
                </div>

                {newQuestion.type === 'MCQ_SINGLE' && (
                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2">
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-8 text-sm text-slate-400">{String.fromCharCode(65 + index)}.</span>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOptions});
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                          <input
                            type="radio"
                            name="correct"
                            checked={newQuestion.correct_answer === index}
                            onChange={() => setNewQuestion({...newQuestion, correct_answer: index})}
                            className="w-4 h-4"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newQuestion.type === 'TRUE_FALSE' && (
                  <div>
                    <Label>Correct Answer</Label>
                    <Select value={newQuestion.correct_answer.toString()} onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">True</SelectItem>
                        <SelectItem value="1">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="explanation">Explanation (Optional)</Label>
                  <Textarea
                    id="explanation"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                    placeholder="Explain the correct answer..."
                    rows={2}
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
                      value={newQuestion.points}
                      onChange={(e) => setNewQuestion({...newQuestion, points: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newQuestion.tags.join(', ')}
                    onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})}
                    placeholder="algebra, equations, mathematics"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleCreateQuestion} disabled={loading} className="flex-1">
                    {loading ? 'Creating...' : 'Create Question'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Question Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Questions</p>
                <p className="text-2xl font-bold text-blue-400">{questions.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Questions</p>
                <p className="text-2xl font-bold text-green-400">
                  {questions.filter(q => q.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Subjects Covered</p>
                <p className="text-2xl font-bold text-purple-400">{subjects.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Difficulty</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {questions.length > 0 ? (questions.reduce((sum, q) => sum + q.difficulty_level, 0) / questions.length).toFixed(1) : '0'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-48">
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
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="1">Easy</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="all" className="text-white">All Questions</TabsTrigger>
          <TabsTrigger value="active" className="text-white">Active</TabsTrigger>
          <TabsTrigger value="inactive" className="text-white">Inactive</TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderQuestionList(filteredQuestions)}
        </TabsContent>

        <TabsContent value="active">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400">Active questions will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400">Inactive questions will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-slate-400">Question analytics will be shown here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}