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
import { 
  BookOpen, Plus, Clock, Users, Edit, Trash2, Calendar, FileText, Eye, Play, Pause
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SchoolExamManagerProps {
  schoolId: string;
}

export default function SchoolExamManager({ schoolId }: SchoolExamManagerProps) {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    type: 'CUSTOM' as 'JAMB' | 'WAEC' | 'CUSTOM',
    duration_minutes: 120,
    instructions: '',
      is_published: true,
    selectedSubjects: [] as string[],
    questionSelectionMode: 'edura' as 'edura' | 'custom' | 'mixed',
    questionsPerSubject: 10,
    selectedQuestions: [] as string[],
    assignToAll: true,
    selectedStudents: [] as string[],
    startDate: '',
    endDate: '',
  });

  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [currentSubjectForQuestions, setCurrentSubjectForQuestions] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId) {
      fetchData();
    }
  }, [schoolId]);

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

  const handleCreateExam = async () => {
    try {
      if (!newExam.title || newExam.selectedSubjects.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      // For Edura mode, validate questions per subject is set
      if (newExam.questionSelectionMode === 'edura' && newExam.questionsPerSubject < 1) {
        toast.error('Please specify the number of questions per subject');
        return;
      }

      setLoading(true);
      
      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      // Calculate total questions based on mode
      const totalQuestions = newExam.selectedSubjects.length * newExam.questionsPerSubject;

      // Create exam with question_selection_mode
      const examData: any = {
        title: newExam.title,
        description: newExam.description,
        type: newExam.type,
        duration_minutes: newExam.duration_minutes,
        total_questions: totalQuestions,
        instructions: newExam.instructions,
        is_published: newExam.is_published,
        school_id: schoolId,
        created_by: userData.id,
      };
      
      // Only add question_selection_mode if database supports it
      if (newExam.questionSelectionMode) {
        examData.question_selection_mode = newExam.questionSelectionMode;
      }
      
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert(examData)
        .select()
        .single();

      if (examError) throw examError;

      // Create exam subjects
      const examSubjects = newExam.selectedSubjects.map((subjectId, index) => {
        const subject = subjects.find(s => s.id === subjectId);
        return {
          exam_id: exam.id,
          subject_id: subjectId,
          subject_name: subject?.name || '',
          question_count: newExam.questionsPerSubject,
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
          is_active: true,
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
            is_active: true,
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

      toast.success('Exam created successfully');
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
        is_published: true,
      selectedSubjects: [],
      questionSelectionMode: 'edura',
      questionsPerSubject: 10,
      selectedQuestions: [],
      assignToAll: true,
      selectedStudents: [],
      startDate: '',
      endDate: '',
    });
    setAvailableQuestions([]);
    setShowQuestionSelector(false);
    setCurrentSubjectForQuestions(null);
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
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

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
          <p className="text-muted-foreground">Create and manage custom exams for your students</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

              {/* Question Selection Mode */}
              <div>
                <Label className="mb-3 block">Question Selection Method *</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                    onClick={() => setNewExam({...newExam, questionSelectionMode: 'edura'})}>
                    <Checkbox
                      checked={newExam.questionSelectionMode === 'edura'}
                      onCheckedChange={() => setNewExam({...newExam, questionSelectionMode: 'edura'})}
                    />
                    <div className="flex-1">
                      <Label className="cursor-pointer font-semibold text-base">Use Edura Questions</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Automatically pull random questions from Edura's database. Just specify the number of questions per subject.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                    onClick={() => setNewExam({...newExam, questionSelectionMode: 'custom'})}>
                    <Checkbox
                      checked={newExam.questionSelectionMode === 'custom'}
                      onCheckedChange={() => setNewExam({...newExam, questionSelectionMode: 'custom'})}
                    />
                    <div className="flex-1">
                      <Label className="cursor-pointer font-semibold text-base">Manual Question Selection</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your own questions via CSV, text, or select from the question bank manually.
                      </p>
                    </div>
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
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {newExam.selectedSubjects.length} subject(s)
                </p>
              </div>

              {/* Questions per Subject - Only for Edura Mode */}
              {newExam.questionSelectionMode === 'edura' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label htmlFor="questionsPerSubject" className="font-semibold text-blue-900">Questions per Subject *</Label>
                  <p className="text-sm text-blue-700 mt-1 mb-3">
                    Specify how many questions each student will randomly receive from Edura's database per subject.
                  </p>
                  <Input
                    id="questionsPerSubject"
                    type="number"
                    value={newExam.questionsPerSubject}
                    onChange={(e) => setNewExam({...newExam, questionsPerSubject: parseInt(e.target.value) || 0})}
                    min={1}
                    max={100}
                    placeholder="e.g., 10"
                  />
                  <p className="text-sm font-medium mt-2 text-blue-900">
                    Total questions per student: {newExam.selectedSubjects.length * newExam.questionsPerSubject}
                  </p>
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
                
                {!newExam.assignToAll && (
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    {students.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No students found
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student: any) => (
                          <div key={student.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={newExam.selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudent(student.id)}
                            />
                            <Label htmlFor={`student-${student.id}`} className="cursor-pointer font-normal">
                              {student.first_name} {student.last_name} ({student.email})
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({...newExam, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
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
                <Label htmlFor="instructions">Exam Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newExam.instructions}
                  onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
                  placeholder="Instructions for students taking this exam"
                  rows={4}
                />
              </div>

              {/* Publish Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="published"
                  checked={newExam.is_published}
                  onCheckedChange={(checked) => setNewExam({...newExam, is_published: !!checked})}
                />
                <Label htmlFor="published" className="cursor-pointer font-normal">
                  Publish immediately (students can access)
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateExam} disabled={loading} className="flex-1">
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

      {/* Stats */}
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
            <div className="text-2xl font-bold text-green-600">
              {exams.filter(e => e.is_published).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {exams.filter(e => !e.is_published).length}
            </div>
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

      {/* Exams List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {exams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No exams created yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Create Exam" to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            exams.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{exam.title}</h3>
                        <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                          {exam.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline">{exam.type}</Badge>
                        {exam.question_selection_mode === 'edura' && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                            📚 Edura Questions
                          </Badge>
                        )}
                      </div>
                      
                      {exam.description && (
                        <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {exam.duration_minutes} mins
                        </span>
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {exam.total_questions} questions
                        </span>
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {exam.exam_subjects?.length || 0} subjects
                        </span>
                        <span className="text-xs">
                          Created {new Date(exam.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={exam.is_published ? 'secondary' : 'default'}
                        size="sm"
                        onClick={() => togglePublishStatus(exam.id, exam.is_published)}
                      >
                        {exam.is_published ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExam(exam.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="published" className="space-y-4 mt-6">
          {exams.filter(e => e.is_published).map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant="default">Published</Badge>
                      <Badge variant="outline">{exam.type}</Badge>
                      {exam.question_selection_mode === 'edura' && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                          📚 Edura Questions
                        </Badge>
                      )}
                    </div>
                    
                    {exam.description && (
                      <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {exam.duration_minutes} mins
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {exam.total_questions} questions
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => togglePublishStatus(exam.id, exam.is_published)}
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Unpublish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4 mt-6">
          {exams.filter(e => !e.is_published).map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{exam.title}</h3>
                      <Badge variant="secondary">Draft</Badge>
                      <Badge variant="outline">{exam.type}</Badge>
                    </div>
                    
                    {exam.description && (
                      <p className="text-sm text-muted-foreground mb-3">{exam.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {exam.duration_minutes} mins
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {exam.total_questions} questions
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => togglePublishStatus(exam.id, exam.is_published)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Publish
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteExam(exam.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
