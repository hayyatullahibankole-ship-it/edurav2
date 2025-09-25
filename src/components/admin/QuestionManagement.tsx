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
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download
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

  useEffect(() => {
    fetchData();
  }, []);

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
          : newQuestion.options[0],
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
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
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
        
        <div className="flex items-center gap-4 flex-wrap">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload Questions
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Bulk Upload WAEC/JAMB Questions</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
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
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Single Question
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
                <p className="text-2xl font-bold text-green-400">{activeQuestions.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Subjects</p>
                <p className="text-2xl font-bold text-purple-400">{subjects.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Inactive Questions</p>
                <p className="text-2xl font-bold text-red-400">{inactiveQuestions.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
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
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
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
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="active" className="text-white">
            Active Questions ({activeQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="text-white">
            Inactive Questions ({inactiveQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeQuestions.length > 0 ? (
            renderQuestionList(activeQuestions)
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Active Questions</h3>
                <p className="text-slate-400 mb-4">Start by uploading questions using the bulk upload feature.</p>
                <Button onClick={() => setIsBulkUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700">
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
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Inactive Questions</h3>
                <p className="text-slate-400">All questions are currently active.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}