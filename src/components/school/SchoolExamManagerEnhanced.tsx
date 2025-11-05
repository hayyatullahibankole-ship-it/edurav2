import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  BookOpen, Plus, Clock, Users, Trash2, Calendar, FileText, Upload, List, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SchoolExamManagerProps {
  schoolId: string;
}

interface QuestionOption {
  text: string;
  index: number;
}

interface NewQuestion {
  question_text: string;
  type: 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'ESSAY';
  subject_id: string;
  options: QuestionOption[];
  correct_answer: string;
  explanation: string;
  difficulty_level: number;
  points: number;
  time_limit_seconds: number;
}

export default function SchoolExamManagerEnhanced({ schoolId }: SchoolExamManagerProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuestionUploadOpen, setIsQuestionUploadOpen] = useState(false);
  
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    type: 'CUSTOM' as 'JAMB' | 'WAEC' | 'CUSTOM',
    duration_minutes: 120,
    instructions: '',
    is_published: false,
    selectedSubjects: [] as string[],
    questionSelectionMode: 'edura' as 'edura' | 'upload',
    selectedQuestionIds: [] as string[],
    assignToAll: true,
    selectedStudents: [] as string[],
    startDate: '',
    endDate: '',
  });

  const [uploadedQuestions, setUploadedQuestions] = useState<NewQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<NewQuestion>({
    question_text: '',
    type: 'MCQ_SINGLE',
    subject_id: '',
    options: [
      { text: '', index: 0 },
      { text: '', index: 1 },
      { text: '', index: 2 },
      { text: '', index: 3 }
    ],
    correct_answer: '0',
    explanation: '',
    difficulty_level: 1,
    points: 1,
    time_limit_seconds: 90,
  });

  useEffect(() => {
    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

  useEffect(() => {
    if (newExam.selectedSubjects.length > 0 && newExam.questionSelectionMode === 'edura') {
      fetchAvailableQuestions();
    }
  }, [newExam.selectedSubjects, newExam.questionSelectionMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [examsResp, subjectsResp, studentsResp] = await Promise.all([
        supabase
          .from('exams')
          .select(`
            *,
            exam_subjects(*)
          `)
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false }),
        supabase
          .from('subjects')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('school_students')
          .select(`
            user_id,
            users(id, first_name, last_name, email)
          `)
          .eq('school_id', schoolId)
          .eq('is_active', true)
      ]);

      setExams(examsResp.data || []);
      setSubjects(subjectsResp.data || []);
      setStudents(studentsResp.data?.map(s => s.users).filter(Boolean) || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load exams data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*, subjects(name)')
        .in('subject_id', newExam.selectedSubjects)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAvailableQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleCreateExam = async () => {
    try {
      if (!newExam.title || newExam.selectedSubjects.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (newExam.questionSelectionMode === 'upload' && uploadedQuestions.length === 0) {
        toast.error('Please upload at least one question');
        return;
      }

      if (newExam.questionSelectionMode === 'edura' && newExam.selectedQuestionIds.length === 0) {
        toast.error('Please select at least one question');
        return;
      }

      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      let finalQuestionIds: string[] = [];

      // If uploading custom questions, save them to Edura's question bank first
      if (newExam.questionSelectionMode === 'upload') {
        const questionsToInsert = uploadedQuestions.map(q => ({
          question_text: q.question_text,
          type: q.type,
          subject_id: q.subject_id,
          options: q.type === 'TRUE_FALSE' ? ['True', 'False'] : q.options.map(opt => opt.text),
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
          difficulty_level: q.difficulty_level,
          points: q.points,
          time_limit_seconds: q.time_limit_seconds,
          created_by: userData.id,
          is_active: true,
        }));

        const { data: insertedQuestions, error: questionError } = await supabase
          .from('questions')
          .insert(questionsToInsert)
          .select('id');

        if (questionError) throw questionError;
        
        finalQuestionIds = insertedQuestions.map(q => q.id);
        toast.success(`${finalQuestionIds.length} questions added to Edura question bank!`);
      } else {
        finalQuestionIds = newExam.selectedQuestionIds;
      }

      // Create exam with question IDs in proctoring_data
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: newExam.title,
          description: newExam.description,
          type: newExam.type,
          duration_minutes: newExam.duration_minutes,
          total_questions: finalQuestionIds.length,
          instructions: newExam.instructions,
          is_published: newExam.is_published,
          school_id: schoolId,
          created_by: userData.id,
        })
        .select()
        .single();

      if (examError) throw examError;

      // Store question IDs in attempts.proctoring_data for pre-selected questions
      // This will be used by useCBTExam to load exact questions
      // We'll create a sample attempt structure to document the format
      const examMetadata = {
        question_ids: finalQuestionIds,
        question_selection_mode: newExam.questionSelectionMode,
        created_at: new Date().toISOString(),
      };

      // Update exam with metadata
      await supabase
        .from('exams')
        .update({
          instructions: `${newExam.instructions}\n\n__EXAM_METADATA__:${JSON.stringify(examMetadata)}`
        })
        .eq('id', exam.id);

      // Create exam subjects
      const subjectQuestionCounts: Record<string, number> = {};
      finalQuestionIds.forEach(qid => {
        const question = newExam.questionSelectionMode === 'upload' 
          ? uploadedQuestions.find((_, idx) => finalQuestionIds[idx] === qid)
          : availableQuestions.find(q => q.id === qid);
        if (question && question.subject_id) {
          subjectQuestionCounts[question.subject_id] = (subjectQuestionCounts[question.subject_id] || 0) + 1;
        }
      });

      const examSubjects = Object.entries(subjectQuestionCounts).map(([subjectId, count], index) => {
        const subject = subjects.find(s => s.id === subjectId);
        return {
          exam_id: exam.id,
          subject_id: subjectId,
          subject_name: subject?.name || '',
          question_count: count,
          display_order: index,
        };
      });

      const { error: subjectsError } = await supabase
        .from('exam_subjects')
        .insert(examSubjects);

      if (subjectsError) throw subjectsError;

      // Create exam assignments
      const assignments = [];
      
      if (newExam.assignToAll) {
        assignments.push({
          exam_id: exam.id,
          school_id: schoolId,
          assigned_to_all: true,
          start_date: newExam.startDate || null,
          end_date: newExam.endDate || null,
          created_by: userData.id,
        });
      } else {
        newExam.selectedStudents.forEach(studentId => {
          assignments.push({
            exam_id: exam.id,
            school_id: schoolId,
            student_id: studentId,
            assigned_to_all: false,
            start_date: newExam.startDate || null,
            end_date: newExam.endDate || null,
            created_by: userData.id,
          });
        });
      }

      const { error: assignError } = await supabase
        .from('school_exam_assignments')
        .insert(assignments);

      if (assignError) throw assignError;

      toast.success('Exam created successfully with selected questions!');
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
      
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast.error(error.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewExam({
      title: '',
      description: '',
      type: 'CUSTOM',
      duration_minutes: 120,
      instructions: '',
      is_published: false,
      selectedSubjects: [],
      questionSelectionMode: 'edura',
      selectedQuestionIds: [],
      assignToAll: true,
      selectedStudents: [],
      startDate: '',
      endDate: '',
    });
    setUploadedQuestions([]);
    setCurrentQuestion({
      question_text: '',
      type: 'MCQ_SINGLE',
      subject_id: '',
      options: [
        { text: '', index: 0 },
        { text: '', index: 1 },
        { text: '', index: 2 },
        { text: '', index: 3 }
      ],
      correct_answer: '0',
      explanation: '',
      difficulty_level: 1,
      points: 1,
      time_limit_seconds: 90,
    });
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index].text = text;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addQuestionToList = () => {
    if (!currentQuestion.question_text || !currentQuestion.subject_id) {
      toast.error('Please fill in question text and select a subject');
      return;
    }

    if ((currentQuestion.type === 'MCQ_SINGLE' || currentQuestion.type === 'MCQ_MULTI') && 
        currentQuestion.options.some(opt => !opt.text.trim())) {
      toast.error('Please fill in all answer options');
      return;
    }

    setUploadedQuestions([...uploadedQuestions, { ...currentQuestion }]);
    setCurrentQuestion({
      question_text: '',
      type: 'MCQ_SINGLE',
      subject_id: currentQuestion.subject_id, // Keep same subject
      options: [
        { text: '', index: 0 },
        { text: '', index: 1 },
        { text: '', index: 2 },
        { text: '', index: 3 }
      ],
      correct_answer: '0',
      explanation: '',
      difficulty_level: 1,
      points: 1,
      time_limit_seconds: 90,
    });
    toast.success('Question added to upload list');
  };

  const toggleQuestionSelection = (questionId: string) => {
    setNewExam(prev => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter(id => id !== questionId)
        : [...prev.selectedQuestionIds, questionId]
    }));
  };

  const toggleSubject = (subjectId: string) => {
    setNewExam(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
  };

  const toggleStudent = (studentId: string) => {
    setNewExam(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const deleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const { error } = await supabase.from('exams').delete().eq('id', examId);
      if (error) throw error;
      toast.success('Exam deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const togglePublishStatus = async (examId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_published: !currentStatus })
        .eq('id', examId);

      if (error) throw error;
      toast.success(`Exam ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchData();
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update exam status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Management</h2>
          <p className="text-muted-foreground">Create exams with your own questions or select from Edura's question bank</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                    placeholder="e.g., Mid-Term Mathematics Test"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    placeholder="Brief description of the exam"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Exam Type</Label>
                    <Select value={newExam.type} onValueChange={(value: any) => setNewExam({...newExam, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOM">Custom Exam</SelectItem>
                        <SelectItem value="JAMB">JAMB Style</SelectItem>
                        <SelectItem value="WAEC">WAEC Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newExam.duration_minutes}
                      onChange={(e) => setNewExam({...newExam, duration_minutes: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* Subject Selection */}
              <div>
                <Label className="mb-3 block">Select Subjects *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject.id}
                        checked={newExam.selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => toggleSubject(subject.id)}
                      />
                      <Label htmlFor={subject.id} className="cursor-pointer font-normal">
                        {subject.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Selection Mode */}
              {newExam.selectedSubjects.length > 0 && (
                <div className="space-y-4">
                  <Label>Question Selection Method *</Label>
                  <RadioGroup
                    value={newExam.questionSelectionMode}
                    onValueChange={(value: 'edura' | 'upload') => setNewExam({...newExam, questionSelectionMode: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="edura" id="edura" />
                      <Label htmlFor="edura" className="cursor-pointer font-normal">
                        <div className="flex items-center gap-2">
                          <List className="w-4 h-4" />
                          <span>Select from Edura Question Bank</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <Label htmlFor="upload" className="cursor-pointer font-normal">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Upload Custom Questions (saved to Edura bank)</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Edura Question Selection */}
                  {newExam.questionSelectionMode === 'edura' && (
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Available Questions ({availableQuestions.length})</Label>
                        <Badge variant="secondary">{newExam.selectedQuestionIds.length} selected</Badge>
                      </div>
                      <div className="space-y-2">
                        {availableQuestions.map((question) => (
                          <div key={question.id} className="flex items-start space-x-2 p-3 border rounded hover:bg-muted/50">
                            <Checkbox
                              id={`q-${question.id}`}
                              checked={newExam.selectedQuestionIds.includes(question.id)}
                              onCheckedChange={() => toggleQuestionSelection(question.id)}
                            />
                            <Label htmlFor={`q-${question.id}`} className="cursor-pointer flex-1 font-normal">
                              <div className="space-y-1">
                                <p className="line-clamp-2">{question.question_text}</p>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">{question.subjects?.name}</Badge>
                                  <Badge variant="outline" className="text-xs">{question.type}</Badge>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                        {availableQuestions.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No questions found for selected subjects
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload Questions */}
                  {newExam.questionSelectionMode === 'upload' && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label>Upload Questions</Label>
                        <Badge variant="secondary">{uploadedQuestions.length} questions ready</Badge>
                      </div>

                      {/* Question Upload Form */}
                      <Card className="mb-4">
                        <CardContent className="pt-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Question Type</Label>
                              <Select 
                                value={currentQuestion.type} 
                                onValueChange={(value: any) => setCurrentQuestion({...currentQuestion, type: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MCQ_SINGLE">Multiple Choice</SelectItem>
                                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                  <SelectItem value="ESSAY">Essay</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Subject</Label>
                              <Select 
                                value={currentQuestion.subject_id} 
                                onValueChange={(value) => setCurrentQuestion({...currentQuestion, subject_id: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.filter(s => newExam.selectedSubjects.includes(s.id)).map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                      {subject.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Question Text *</Label>
                            <Textarea
                              value={currentQuestion.question_text}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, question_text: e.target.value})}
                              placeholder="Enter question..."
                              rows={3}
                            />
                          </div>

                          {currentQuestion.type === 'MCQ_SINGLE' && (
                            <>
                              <div className="space-y-2">
                                <Label>Options</Label>
                                {currentQuestion.options.map((option, index) => (
                                  <Input
                                    key={index}
                                    value={option.text}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  />
                                ))}
                              </div>
                              <div>
                                <Label>Correct Answer</Label>
                                <Select 
                                  value={currentQuestion.correct_answer} 
                                  onValueChange={(value) => setCurrentQuestion({...currentQuestion, correct_answer: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {currentQuestion.options.map((_, index) => (
                                      <SelectItem key={index} value={String(index)}>
                                        Option {String.fromCharCode(65 + index)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}

                          {currentQuestion.type === 'TRUE_FALSE' && (
                            <div>
                              <Label>Correct Answer</Label>
                              <Select 
                                value={currentQuestion.correct_answer} 
                                onValueChange={(value) => setCurrentQuestion({...currentQuestion, correct_answer: value})}
                              >
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
                            <Label>Explanation (Optional)</Label>
                            <Textarea
                              value={currentQuestion.explanation}
                              onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                              placeholder="Explain the answer..."
                              rows={2}
                            />
                          </div>

                          <Button onClick={addQuestionToList} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Uploaded Questions List */}
                      {uploadedQuestions.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          <Label>Questions to Upload ({uploadedQuestions.length})</Label>
                          {uploadedQuestions.map((q, idx) => (
                            <Card key={idx} className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm line-clamp-2">{q.question_text}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {subjects.find(s => s.id === q.subject_id)?.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">{q.type}</Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setUploadedQuestions(uploadedQuestions.filter((_, i) => i !== idx))}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Student Assignment */}
              <div className="space-y-3">
                <Label>Assign Exam To</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assignToAll"
                    checked={newExam.assignToAll}
                    onCheckedChange={(checked) => setNewExam({...newExam, assignToAll: !!checked})}
                  />
                  <Label htmlFor="assignToAll" className="cursor-pointer font-normal">
                    All Students
                  </Label>
                </div>
                
                {!newExam.assignToAll && students.length > 0 && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {students.map((student: any) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`student-${student.id}`}
                            checked={newExam.selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <Label htmlFor={`student-${student.id}`} className="cursor-pointer font-normal">
                            {student.first_name} {student.last_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({...newExam, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({...newExam, endDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newExam.instructions}
                  onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
                  placeholder="Exam instructions..."
                  rows={3}
                />
              </div>

              {/* Publish */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={newExam.is_published}
                  onCheckedChange={(checked) => setNewExam({...newExam, is_published: !!checked})}
                />
                <Label htmlFor="published" className="cursor-pointer font-normal">
                  Publish immediately
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateExam} disabled={loading} className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Exam'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }} 
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - keep existing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Published</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.filter(e => e.is_published).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.filter(e => !e.is_published).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Exams List - keep existing list rendering */}
      <Card>
        <CardHeader>
          <CardTitle>Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No exams created yet</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="drafts">Drafts</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4 mt-4">
                {exams.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{exam.title}</h3>
                            <Badge variant={exam.is_published ? "default" : "secondary"}>
                              {exam.is_published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{exam.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {exam.duration_minutes}min
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {exam.total_questions} questions
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublishStatus(exam.id, exam.is_published)}
                          >
                            {exam.is_published ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExam(exam.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="published" className="space-y-4 mt-4">
                {exams.filter(e => e.is_published).map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground">{exam.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="drafts" className="space-y-4 mt-4">
                {exams.filter(e => !e.is_published).map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground">{exam.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
