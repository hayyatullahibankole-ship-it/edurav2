import { useState, useEffect, useRef } from 'react';
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
  BookOpen, Plus, Clock, Users, Trash2, Calendar, FileText, Upload, 
  CheckCircle2, Download, AlertCircle, Eye, Play, Pause, FileSpreadsheet
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SchoolExamManagerProps {
  schoolId: string;
}

interface ParsedQuestion {
  question_text: string;
  type: 'MCQ_SINGLE';
  subject_id: string;
  options: string[];
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
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Questions, 3: Assign
  const [examResults, setExamResults] = useState<Record<string, any[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exam form state
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    type: 'CUSTOM' as 'JAMB' | 'WAEC' | 'CUSTOM',
    duration_minutes: 60,
    instructions: '',
    selectedSubjects: [] as string[],
    assignToAll: true,
    selectedStudents: [] as string[],
    startDate: '',
    endDate: '',
  });

  // Question management state
  const [questionTab, setQuestionTab] = useState<'upload' | 'manual' | 'bank'>('upload');
  const [uploadedQuestions, setUploadedQuestions] = useState<ParsedQuestion[]>([]);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);
  const [manualQuestion, setManualQuestion] = useState({
    question_text: '',
    subject_id: '',
    options: ['', '', '', ''],
    correct_answer: '0',
    explanation: '',
  });

  useEffect(() => {
    if (schoolId) fetchData();
  }, [schoolId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsResp, subjectsResp, studentsResp] = await Promise.all([
        supabase
          .from('exams')
          .select('*, exam_subjects(*)')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false }),
        supabase
          .from('subjects')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('school_students')
          .select('user_id, users(id, first_name, last_name, email)')
          .eq('school_id', schoolId)
          .eq('is_active', true)
      ]);

      const examsList = examsResp.data || [];
      setExams(examsList);
      setSubjects(subjectsResp.data || []);
      setStudents(studentsResp.data?.map(s => s.users).filter(Boolean) || []);

      // Fetch results for each exam
      for (const exam of examsList) {
        fetchExamResults(exam.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async (examId: string) => {
    try {
      const { data: attempts } = await supabase
        .from('attempts')
        .select(`
          id, user_id, status, submitted_at,
          users(first_name, last_name),
          results(raw_score, total_questions, percentage)
        `)
        .eq('exam_id', examId)
        .in('status', ['SUBMITTED', 'GRADED']);

      if (attempts) {
        setExamResults(prev => ({ ...prev, [examId]: attempts }));
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  // CSV Parsing
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentField.trim());
          currentField = '';
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          currentRow.push(currentField.trim());
          if (currentRow.some(f => f)) rows.push(currentRow);
          currentRow = [];
          currentField = '';
          if (char === '\r') i++;
        } else {
          currentField += char;
        }
      }
    }
    // Last field
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f)) rows.push(currentRow);

    return rows;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          toast.error('CSV must have a header row and at least one question');
          return;
        }

        // Dynamic header mapping (case-insensitive)
        const headers = rows[0].map(h => h.toLowerCase().trim());
        const colMap: Record<string, number> = {};
        
        const findCol = (names: string[]) => {
          for (const name of names) {
            const idx = headers.findIndex(h => h.includes(name));
            if (idx !== -1) return idx;
          }
          return -1;
        };

        colMap.subject = findCol(['subject']);
        colMap.question = findCol(['question']);
        colMap.optionA = findCol(['option a', 'option_a', 'a)']);
        colMap.optionB = findCol(['option b', 'option_b', 'b)']);
        colMap.optionC = findCol(['option c', 'option_c', 'c)']);
        colMap.optionD = findCol(['option d', 'option_d', 'd)']);
        colMap.answer = findCol(['correct', 'answer']);
        colMap.explanation = findCol(['explanation', 'explain']);

        if (colMap.question === -1) {
          toast.error('CSV must have a "Question" column');
          return;
        }
        if (colMap.optionA === -1 || colMap.optionB === -1) {
          toast.error('CSV must have at least "Option A" and "Option B" columns');
          return;
        }

        const parsed: ParsedQuestion[] = [];
        const errors: string[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const questionText = row[colMap.question] || '';
          if (!questionText) {
            errors.push(`Row ${i + 1}: Missing question text`);
            continue;
          }

          const options = [
            row[colMap.optionA] || '',
            row[colMap.optionB] || '',
            colMap.optionC !== -1 ? (row[colMap.optionC] || '') : '',
            colMap.optionD !== -1 ? (row[colMap.optionD] || '') : '',
          ].filter(Boolean);

          if (options.length < 2) {
            errors.push(`Row ${i + 1}: Need at least 2 options`);
            continue;
          }

          // Match correct answer
          let correctAnswer = '0';
          if (colMap.answer !== -1) {
            const rawAnswer = (row[colMap.answer] || '').trim().toUpperCase();
            if (rawAnswer === 'A' || rawAnswer === '1') correctAnswer = '0';
            else if (rawAnswer === 'B' || rawAnswer === '2') correctAnswer = '1';
            else if (rawAnswer === 'C' || rawAnswer === '3') correctAnswer = '2';
            else if (rawAnswer === 'D' || rawAnswer === '4') correctAnswer = '3';
            else {
              // Try matching answer text
              const ansIdx = options.findIndex(o => o.toLowerCase() === rawAnswer.toLowerCase());
              if (ansIdx !== -1) correctAnswer = String(ansIdx);
            }
          }

          // Match subject
          let subjectId = examForm.selectedSubjects[0] || '';
          if (colMap.subject !== -1) {
            const subjectName = (row[colMap.subject] || '').trim().toLowerCase();
            const matched = subjects.find(s => s.name.toLowerCase().includes(subjectName) || subjectName.includes(s.name.toLowerCase()));
            if (matched) subjectId = matched.id;
          }

          parsed.push({
            question_text: questionText,
            type: 'MCQ_SINGLE',
            subject_id: subjectId,
            options,
            correct_answer: correctAnswer,
            explanation: colMap.explanation !== -1 ? (row[colMap.explanation] || '') : '',
            difficulty_level: 1,
            points: 1,
            time_limit_seconds: 90,
          });
        }

        if (errors.length > 0 && parsed.length === 0) {
          toast.error(`Failed to parse CSV: ${errors.slice(0, 3).join('; ')}`);
          return;
        }

        setUploadedQuestions(prev => [...prev, ...parsed]);
        toast.success(`${parsed.length} questions parsed from CSV${errors.length > 0 ? `. ${errors.length} rows skipped.` : ''}`);
        
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error('CSV parse error:', error);
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const addManualQuestion = () => {
    if (!manualQuestion.question_text || !manualQuestion.subject_id) {
      toast.error('Please fill in question text and select a subject');
      return;
    }
    if (manualQuestion.options.filter(Boolean).length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    const validOptions = manualQuestion.options.filter(Boolean);
    setUploadedQuestions(prev => [...prev, {
      question_text: manualQuestion.question_text,
      type: 'MCQ_SINGLE',
      subject_id: manualQuestion.subject_id,
      options: validOptions,
      correct_answer: manualQuestion.correct_answer,
      explanation: manualQuestion.explanation,
      difficulty_level: 1,
      points: 1,
      time_limit_seconds: 90,
    }]);

    setManualQuestion({
      question_text: '',
      subject_id: manualQuestion.subject_id,
      options: ['', '', '', ''],
      correct_answer: '0',
      explanation: '',
    });
    toast.success('Question added');
  };

  const fetchBankQuestions = async () => {
    if (examForm.selectedSubjects.length === 0) return;
    try {
      const { data, error } = await supabase.functions.invoke('school-bulk-questions', {
        body: { action: 'get_school_questions' }
      });
      if (error) throw error;
      setBankQuestions(data?.questions || []);
    } catch (error) {
      console.error('Error fetching bank questions:', error);
      // Fallback: try direct query
      const { data } = await supabase
        .from('questions')
        .select('id, question_text, type, options, subject_id, difficulty_level, subjects(name)')
        .in('subject_id', examForm.selectedSubjects)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(200);
      setBankQuestions(data || []);
    }
  };

  const handleCreateExam = async () => {
    try {
      const totalQuestions = uploadedQuestions.length + selectedBankQuestionIds.length;
      if (totalQuestions === 0) {
        toast.error('Please add at least one question');
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

      // Step 1: Create the exam
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: examForm.title,
          description: examForm.description,
          type: examForm.type,
          duration_minutes: examForm.duration_minutes,
          total_questions: totalQuestions,
          instructions: examForm.instructions,
          is_published: false,
          school_id: schoolId,
          created_by: userData.id,
          requires_subscription: false,
        })
        .select()
        .single();

      if (examError) throw examError;

      // Step 2: Upload new questions via edge function
      let allQuestionIds: string[] = [...selectedBankQuestionIds];

      if (uploadedQuestions.length > 0) {
        const { data: bulkResult, error: bulkError } = await supabase.functions.invoke('school-bulk-questions', {
          body: {
            action: 'bulk_insert_questions',
            questions: uploadedQuestions,
            exam_id: exam.id,
          }
        });

        if (bulkError) throw new Error(bulkError.message || 'Failed to upload questions');
        if (bulkResult?.question_ids) {
          allQuestionIds = [...allQuestionIds, ...bulkResult.question_ids];
        }
      }

      // Step 3: Link existing bank questions to exam
      if (selectedBankQuestionIds.length > 0) {
        await supabase.functions.invoke('school-bulk-questions', {
          body: {
            action: 'link_questions_to_exam',
            exam_id: exam.id,
            question_ids: allQuestionIds,
          }
        });
      }

      // Step 4: Create exam subjects
      const subjectQuestionCounts: Record<string, number> = {};
      uploadedQuestions.forEach(q => {
        subjectQuestionCounts[q.subject_id] = (subjectQuestionCounts[q.subject_id] || 0) + 1;
      });
      selectedBankQuestionIds.forEach(qid => {
        const q = bankQuestions.find(bq => bq.id === qid);
        if (q) {
          subjectQuestionCounts[q.subject_id] = (subjectQuestionCounts[q.subject_id] || 0) + 1;
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

      if (examSubjects.length > 0) {
        await supabase.from('exam_subjects').insert(examSubjects);
      }

      // Step 5: Create assignments
      const assignments = [];
      if (examForm.assignToAll) {
        assignments.push({
          exam_id: exam.id,
          school_id: schoolId,
          assigned_to_all: true,
          start_date: examForm.startDate || null,
          end_date: examForm.endDate || null,
          created_by: userData.id,
        });
      } else {
        examForm.selectedStudents.forEach(studentId => {
          assignments.push({
            exam_id: exam.id,
            school_id: schoolId,
            student_id: studentId,
            assigned_to_all: false,
            start_date: examForm.startDate || null,
            end_date: examForm.endDate || null,
            created_by: userData.id,
          });
        });
      }

      await supabase.from('school_exam_assignments').insert(assignments);

      toast.success(`Exam created with ${totalQuestions} questions!`);
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
    setExamForm({
      title: '',
      description: '',
      type: 'CUSTOM',
      duration_minutes: 60,
      instructions: '',
      selectedSubjects: [],
      assignToAll: true,
      selectedStudents: [],
      startDate: '',
      endDate: '',
    });
    setUploadedQuestions([]);
    setSelectedBankQuestionIds([]);
    setStep(1);
    setQuestionTab('upload');
  };

  const toggleSubject = (subjectId: string) => {
    setExamForm(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
  };

  const toggleStudent = (studentId: string) => {
    setExamForm(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const deleteExam = async (examId: string) => {
    if (!confirm('Delete this exam? This cannot be undone.')) return;
    try {
      await supabase.from('exams').delete().eq('id', examId);
      toast.success('Exam deleted');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete exam');
    }
  };

  const togglePublish = async (examId: string, currentStatus: boolean) => {
    try {
      await supabase.from('exams').update({ is_published: !currentStatus }).eq('id', examId);
      toast.success(`Exam ${!currentStatus ? 'published' : 'unpublished'}`);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update exam');
    }
  };

  const downloadCSVTemplate = () => {
    const csv = 'Subject,Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation\nMathematics,"What is 2 + 2?",2,3,4,5,C,"2 + 2 equals 4"\nEnglish,"Choose the correct spelling",Recieve,Receive,Receve,Receeve,B,"The correct spelling is Receive"';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalQuestionsCount = uploadedQuestions.length + selectedBankQuestionIds.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exam Management</h2>
          <p className="text-muted-foreground">Create exams, upload questions, and track results</p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exam — Step {step} of 3</DialogTitle>
            </DialogHeader>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {s === 1 ? 'Details' : s === 2 ? 'Questions' : 'Assign'}
                  </span>
                  {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {/* STEP 1: Exam Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Exam Title *</Label>
                  <Input
                    value={examForm.title}
                    onChange={e => setExamForm({...examForm, title: e.target.value})}
                    placeholder="e.g., Mid-Term Mathematics Test"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={examForm.description}
                    onChange={e => setExamForm({...examForm, description: e.target.value})}
                    placeholder="Brief description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Exam Type</Label>
                    <Select value={examForm.type} onValueChange={(v: any) => setExamForm({...examForm, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOM">Custom Exam</SelectItem>
                        <SelectItem value="JAMB">JAMB Style</SelectItem>
                        <SelectItem value="WAEC">WAEC Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={examForm.duration_minutes}
                      onChange={e => setExamForm({...examForm, duration_minutes: parseInt(e.target.value) || 60})}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Select Subjects *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {subjects.map(subject => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sub-${subject.id}`}
                          checked={examForm.selectedSubjects.includes(subject.id)}
                          onCheckedChange={() => toggleSubject(subject.id)}
                        />
                        <Label htmlFor={`sub-${subject.id}`} className="cursor-pointer font-normal text-sm">
                          {subject.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Textarea
                    value={examForm.instructions}
                    onChange={e => setExamForm({...examForm, instructions: e.target.value})}
                    placeholder="Instructions for students"
                    rows={2}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!examForm.title) return toast.error('Enter exam title');
                    if (examForm.selectedSubjects.length === 0) return toast.error('Select at least one subject');
                    setStep(2);
                    fetchBankQuestions();
                  }}
                >
                  Next: Add Questions
                </Button>
              </div>
            )}

            {/* STEP 2: Questions */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    {totalQuestionsCount} questions added
                  </Badge>
                </div>

                <Tabs value={questionTab} onValueChange={(v: any) => setQuestionTab(v)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">
                      <Upload className="w-3 h-3 mr-1" /> CSV Upload
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <Plus className="w-3 h-3 mr-1" /> Manual
                    </TabsTrigger>
                    <TabsTrigger value="bank">
                      <BookOpen className="w-3 h-3 mr-1" /> Question Bank
                    </TabsTrigger>
                  </TabsList>

                  {/* CSV Upload */}
                  <TabsContent value="upload" className="space-y-4">
                    <Alert>
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertDescription>
                        Upload a CSV file with columns: Subject, Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={downloadCSVTemplate} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                    </div>
                  </TabsContent>

                  {/* Manual Entry */}
                  <TabsContent value="manual" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Subject *</Label>
                        <Select value={manualQuestion.subject_id} onValueChange={v => setManualQuestion({...manualQuestion, subject_id: v})}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {subjects.filter(s => examForm.selectedSubjects.includes(s.id)).map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Correct Answer</Label>
                        <Select value={manualQuestion.correct_answer} onValueChange={v => setManualQuestion({...manualQuestion, correct_answer: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['A', 'B', 'C', 'D'].map((letter, idx) => (
                              <SelectItem key={idx} value={String(idx)}>Option {letter}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Question *</Label>
                      <Textarea
                        value={manualQuestion.question_text}
                        onChange={e => setManualQuestion({...manualQuestion, question_text: e.target.value})}
                        placeholder="Enter question text..."
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {manualQuestion.options.map((opt, idx) => (
                        <Input
                          key={idx}
                          value={opt}
                          onChange={e => {
                            const newOpts = [...manualQuestion.options];
                            newOpts[idx] = e.target.value;
                            setManualQuestion({...manualQuestion, options: newOpts});
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        />
                      ))}
                    </div>
                    <div>
                      <Label>Explanation (optional)</Label>
                      <Input
                        value={manualQuestion.explanation}
                        onChange={e => setManualQuestion({...manualQuestion, explanation: e.target.value})}
                        placeholder="Why is this the answer?"
                      />
                    </div>
                    <Button onClick={addManualQuestion} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
                  </TabsContent>

                  {/* Question Bank */}
                  <TabsContent value="bank" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {bankQuestions.length} questions available
                      </p>
                      <Badge variant="secondary">{selectedBankQuestionIds.length} selected</Badge>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {bankQuestions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-6 text-sm">
                          No questions in your bank. Upload some first!
                        </p>
                      ) : bankQuestions.map(q => (
                        <div key={q.id} className="flex items-start space-x-2 p-2 border rounded hover:bg-muted/50">
                          <Checkbox
                            checked={selectedBankQuestionIds.includes(q.id)}
                            onCheckedChange={() => {
                              setSelectedBankQuestionIds(prev =>
                                prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id]
                              );
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{q.question_text}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {q.subjects?.name || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Queued questions summary */}
                {uploadedQuestions.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">Queued Questions ({uploadedQuestions.length})</Label>
                      <Button variant="ghost" size="sm" onClick={() => setUploadedQuestions([])}>
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {uploadedQuestions.slice(0, 10).map((q, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm p-1.5 bg-muted/50 rounded">
                          <span className="truncate flex-1 mr-2">{idx + 1}. {q.question_text}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                            setUploadedQuestions(prev => prev.filter((_, i) => i !== idx));
                          }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      {uploadedQuestions.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          ...and {uploadedQuestions.length - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (totalQuestionsCount === 0) return toast.error('Add at least one question');
                      setStep(3);
                    }}
                  >
                    Next: Assign to Students
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Assign */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Exam Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{examForm.title}</span>
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{examForm.duration_minutes} minutes</span>
                    <span className="text-muted-foreground">Questions:</span>
                    <span>{totalQuestionsCount}</span>
                    <span className="text-muted-foreground">Subjects:</span>
                    <span>{examForm.selectedSubjects.length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Assign To</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assignAll"
                      checked={examForm.assignToAll}
                      onCheckedChange={checked => setExamForm({...examForm, assignToAll: !!checked})}
                    />
                    <Label htmlFor="assignAll" className="cursor-pointer font-normal">
                      All Students ({students.length})
                    </Label>
                  </div>

                  {!examForm.assignToAll && (
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                      {students.map((student: any) => (
                        <div key={student.id} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`stu-${student.id}`}
                            checked={examForm.selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <Label htmlFor={`stu-${student.id}`} className="cursor-pointer font-normal text-sm">
                            {student.first_name} {student.last_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={examForm.startDate}
                      onChange={e => setExamForm({...examForm, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>End Date (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={examForm.endDate}
                      onChange={e => setExamForm({...examForm, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The exam will be created as <strong>unpublished</strong>. You can publish it later to make it visible to students.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-1" onClick={handleCreateExam} disabled={loading}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Exam'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Exams List */}
      {loading && exams.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Exams Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first exam to get started. You can upload questions via CSV or add them manually.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create First Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => {
            const results = examResults[exam.id] || [];
            const completedCount = results.filter(r => r.results && r.results.length > 0).length;
            const avgScore = completedCount > 0
              ? Math.round(results.reduce((sum, r) => sum + (r.results?.[0]?.percentage || 0), 0) / completedCount)
              : 0;

            return (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <Badge variant={exam.is_published ? 'default' : 'secondary'}>
                          {exam.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline">{exam.type}</Badge>
                      </div>
                      {exam.description && (
                        <CardDescription>{exam.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublish(exam.id, exam.is_published)}
                      >
                        {exam.is_published ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{exam.duration_minutes} min</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{exam.total_questions || 0}</p>
                      <p className="text-xs text-muted-foreground">Questions</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{completedCount}</p>
                      <p className="text-xs text-muted-foreground">Submissions</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-medium">{avgScore}%</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                  </div>

                  {exam.exam_subjects && exam.exam_subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exam.exam_subjects.map((es: any) => (
                        <Badge key={es.id} variant="outline">
                          {es.subject_name} ({es.question_count}q)
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Results table */}
                  {results.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-2 font-medium">Student</th>
                            <th className="text-center p-2 font-medium">Score</th>
                            <th className="text-center p-2 font-medium">Percentage</th>
                            <th className="text-center p-2 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map(attempt => (
                            <tr key={attempt.id} className="border-t">
                              <td className="p-2">
                                {attempt.users?.first_name} {attempt.users?.last_name}
                              </td>
                              <td className="p-2 text-center">
                                {attempt.results?.[0]?.raw_score ?? '-'}/{attempt.results?.[0]?.total_questions ?? '-'}
                              </td>
                              <td className="p-2 text-center">
                                <Badge variant={
                                  (attempt.results?.[0]?.percentage ?? 0) >= 50 ? 'default' : 'destructive'
                                }>
                                  {Math.round(attempt.results?.[0]?.percentage ?? 0)}%
                                </Badge>
                              </td>
                              <td className="p-2 text-center text-muted-foreground">
                                {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
