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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, Plus, Clock, Users, Trash2, FileText, Upload, 
  CheckCircle2, Download, AlertCircle, Play, Pause, FileSpreadsheet,
  Copy, Sparkles, Loader2
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
  const [step, setStep] = useState(1);
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
    questionSelectionMode: 'custom' as 'edura' | 'custom',
    questionsPerSubject: 10,
    assignToAll: true,
    selectedStudents: [] as string[],
    selectedClasses: [] as string[],
    startDate: '',
    endDate: '',
    publishImmediately: true,
  });

  // Question management state
  const [questionTab, setQuestionTab] = useState<'text' | 'csv' | 'manual' | 'bank'>('text');
  const [uploadedQuestions, setUploadedQuestions] = useState<ParsedQuestion[]>([]);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [selectedBankQuestionIds, setSelectedBankQuestionIds] = useState<string[]>([]);
  const [questionsText, setQuestionsText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [manualQuestion, setManualQuestion] = useState({
    question_text: '',
    subject_id: '',
    options: ['', '', '', ''],
    correct_answer: '0',
    explanation: '',
  });

  // Get unique class levels from students
  const classLevels = [...new Set(students.map((s: any) => s.class_level).filter(Boolean))];

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
          .select('user_id, full_name, class_level')
          .eq('school_id', schoolId)
          .eq('is_active', true)
      ]);

      const examsList = examsResp.data || [];
      setExams(examsList);
      setSubjects(subjectsResp.data || []);
      setStudents(studentsResp.data || []);

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
          results(raw_score, total_questions, percentage, subject_breakdown)
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

  // ===== TEXT FORMAT PARSING (like admin SimpleBulkUpload) =====
  const parseQuestionsText = (text: string): any[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const questions: any[] = [];
    let currentQuestion: any = null;

    for (let line of lines) {
      line = line.trim();

      if (line.match(/^\d+[.)]\s*/) || (line.includes('?') && !currentQuestion) || (!currentQuestion && line.length > 10)) {
        if (currentQuestion && currentQuestion.question_text && currentQuestion.options.length >= 4) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question_text: line.replace(/^\d+[.)]\s*/, '').trim(),
          options: [],
          correct_answer: null,
          explanation: null,
        };
      } else if (line.match(/^[A-E][.)]\s*/)) {
        if (currentQuestion) {
          currentQuestion.options.push(line.replace(/^[A-E][.)]\s*/, '').trim());
        }
      } else if (line.toLowerCase().includes('answer:') || line.toLowerCase().includes('correct:')) {
        if (currentQuestion) {
          const answerPart = line.split(/(?:answer:|correct:)\s*/i)[1]?.trim();
          if (answerPart) {
            const match = answerPart.match(/^(?:option\s+)?([A-E])[\s.)\]:]?/i);
            if (match && match[1]) {
              currentQuestion.correct_answer = match[1].toUpperCase();
            }
          }
        }
      } else if (line.toLowerCase().includes('explanation:')) {
        if (currentQuestion) {
          currentQuestion.explanation = line.replace(/explanation:\s*/i, '').trim();
        }
      } else if (currentQuestion && line.length > 0) {
        if (currentQuestion.options.length === 0) {
          currentQuestion.question_text += ' ' + line;
        }
      }
    }

    if (currentQuestion && currentQuestion.question_text && currentQuestion.options.length >= 4) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const handleTextUpload = () => {
    if (!questionsText.trim()) {
      toast.error('Please paste some questions');
      return;
    }

    const subjectId = examForm.selectedSubjects[0] || '';
    if (!subjectId) {
      toast.error('Please select at least one subject in Step 1');
      return;
    }

    const parsed = parseQuestionsText(questionsText);
    if (parsed.length === 0) {
      toast.error('No valid questions found. Use the template format.');
      return;
    }

    const converted: ParsedQuestion[] = parsed.map(q => {
      const correctIndex = q.correct_answer ? ['A', 'B', 'C', 'D', 'E'].indexOf(q.correct_answer) : 0;
      return {
        question_text: q.question_text,
        type: 'MCQ_SINGLE' as const,
        subject_id: subjectId,
        options: q.options,
        correct_answer: String(correctIndex >= 0 ? correctIndex : 0),
        explanation: q.explanation || '',
        difficulty_level: 1,
        points: 1,
        time_limit_seconds: 90,
      };
    });

    setUploadedQuestions(prev => [...prev, ...converted]);
    setQuestionsText('');
    toast.success(`${converted.length} questions parsed successfully`);
  };

  // ===== CSV PARSING =====
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

        const headers = rows[0].map(h => h.toLowerCase().trim());
        const findCol = (names: string[]) => {
          for (const name of names) {
            const idx = headers.findIndex(h => h.includes(name));
            if (idx !== -1) return idx;
          }
          return -1;
        };

        const colMap: Record<string, number> = {};
        colMap.subject = findCol(['subject']);
        colMap.question = findCol(['question']);
        colMap.optionA = findCol(['option a', 'option_a', 'a)']);
        colMap.optionB = findCol(['option b', 'option_b', 'b)']);
        colMap.optionC = findCol(['option c', 'option_c', 'c)']);
        colMap.optionD = findCol(['option d', 'option_d', 'd)']);
        colMap.answer = findCol(['correct', 'answer']);
        colMap.explanation = findCol(['explanation', 'explain']);

        if (colMap.question === -1) { toast.error('CSV must have a "Question" column'); return; }
        if (colMap.optionA === -1 || colMap.optionB === -1) { toast.error('CSV must have "Option A" and "Option B" columns'); return; }

        const parsed: ParsedQuestion[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const questionText = row[colMap.question] || '';
          if (!questionText) continue;

          const options = [
            row[colMap.optionA] || '',
            row[colMap.optionB] || '',
            colMap.optionC !== -1 ? (row[colMap.optionC] || '') : '',
            colMap.optionD !== -1 ? (row[colMap.optionD] || '') : '',
          ].filter(Boolean);

          if (options.length < 2) continue;

          let correctAnswer = '0';
          if (colMap.answer !== -1) {
            const rawAnswer = (row[colMap.answer] || '').trim().toUpperCase();
            if (rawAnswer === 'A' || rawAnswer === '1') correctAnswer = '0';
            else if (rawAnswer === 'B' || rawAnswer === '2') correctAnswer = '1';
            else if (rawAnswer === 'C' || rawAnswer === '3') correctAnswer = '2';
            else if (rawAnswer === 'D' || rawAnswer === '4') correctAnswer = '3';
          }

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

        setUploadedQuestions(prev => [...prev, ...parsed]);
        toast.success(`${parsed.length} questions parsed from CSV`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
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
      const { data } = await supabase
        .from('questions')
        .select('id, question_text, type, options, subject_id, difficulty_level, subjects(name)')
        .in('subject_id', examForm.selectedSubjects)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(200);
      setBankQuestions(data || []);
    } catch (error) {
      console.error('Error fetching bank questions:', error);
    }
  };

  const handleCreateExam = async () => {
    try {
      let totalQuestions = uploadedQuestions.length + selectedBankQuestionIds.length;
      // If using Edura mode, total questions are determined by subjects × questionsPerSubject
      if (examForm.questionSelectionMode === 'edura') {
        totalQuestions = (examForm.selectedSubjects.length || 0) * (examForm.questionsPerSubject || 0);
      }
      
      // For Edura mode, questions will be loaded dynamically, so we don't need questions upfront
      if (examForm.questionSelectionMode === 'custom' && totalQuestions === 0) {
        toast.error('Please add at least one question');
        return;
      }

      setLoading(true);
      setIsUploading(true);
      setUploadProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      setUploadProgress(20);

      // Step 1: Create the exam
      const examData: any = {
        title: examForm.title,
        description: examForm.description,
        type: examForm.type,
        duration_minutes: examForm.duration_minutes,
        total_questions: totalQuestions,
        instructions: examForm.instructions,
        is_published: examForm.publishImmediately,
        school_id: schoolId,
        created_by: userData.id,
        requires_subscription: false,
      };

      // Add question selection mode if using Edura mode
      if (examForm.questionSelectionMode === 'edura') {
        examData.question_selection_mode = 'edura';
        examData.questions_per_subject = examForm.questionsPerSubject;
      }

      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert(examData)
        .select()
        .single();

      if (examError) throw examError;
      setUploadProgress(40);

      // For Edura mode, skip manual question uploads
      let allQuestionIds: string[] = [];
      
      if (examForm.questionSelectionMode === 'custom') {
        // Step 2: Upload new questions via edge function
        allQuestionIds = [...selectedBankQuestionIds];

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

        setUploadProgress(60);

        // Step 3: Link existing bank questions to exam
        if (selectedBankQuestionIds.length > 0) {
          await supabase.functions.invoke('school-bulk-questions', {
            body: {
              action: 'link_questions_to_exam',
              exam_id: exam.id,
              question_ids: selectedBankQuestionIds,
            }
          });
        }
      } else {
        setUploadProgress(60);
      }

      setUploadProgress(75);

      // Step 4: Create exam subjects
      let examSubjects: any[] = [];
      
      if (examForm.questionSelectionMode === 'edura') {
        // For Edura mode, create exam_subjects for selected subjects with questions_per_subject count
        examSubjects = examForm.selectedSubjects.map((subjectId, index) => {
          const subject = subjects.find(s => s.id === subjectId);
          return {
            exam_id: exam.id,
            subject_id: subjectId,
            subject_name: subject?.name || '',
            question_count: examForm.questionsPerSubject,
            display_order: index,
          };
        });
      } else {
        // For custom mode, count actual questions uploaded/selected
        const subjectQuestionCounts: Record<string, number> = {};
        uploadedQuestions.forEach(q => {
          subjectQuestionCounts[q.subject_id] = (subjectQuestionCounts[q.subject_id] || 0) + 1;
        });
        selectedBankQuestionIds.forEach(qid => {
          const q = bankQuestions.find(bq => bq.id === qid);
          if (q) subjectQuestionCounts[q.subject_id] = (subjectQuestionCounts[q.subject_id] || 0) + 1;
        });

        examSubjects = Object.entries(subjectQuestionCounts).map(([subjectId, count], index) => {
          const subject = subjects.find(s => s.id === subjectId);
          return {
            exam_id: exam.id,
            subject_id: subjectId,
            subject_name: subject?.name || '',
            question_count: count,
            display_order: index,
          };
        });
      }

      if (examSubjects.length > 0) {
        await supabase.from('exam_subjects').insert(examSubjects);
      }

      setUploadProgress(90);

      // Step 5: Create assignments
      const assignments: any[] = [];
      if (examForm.assignToAll) {
        assignments.push({
          exam_id: exam.id,
          school_id: schoolId,
          assigned_to_all: true,
          is_active: true,
          start_date: examForm.startDate || null,
          end_date: examForm.endDate || null,
          created_by: userData.id,
        });
      } else if (examForm.selectedClasses.length > 0) {
        // Assign by class - create assignment for each student in the selected classes
        const classStudents = students.filter((s: any) => examForm.selectedClasses.includes(s.class_level));
        for (const student of classStudents) {
          assignments.push({
            exam_id: exam.id,
            school_id: schoolId,
            student_id: student.user_id,
            assigned_to_all: false,
            is_active: true,
            start_date: examForm.startDate || null,
            end_date: examForm.endDate || null,
            created_by: userData.id,
          });
        }
      } else {
        for (const studentUserId of examForm.selectedStudents) {
          assignments.push({
            exam_id: exam.id,
            school_id: schoolId,
            student_id: studentUserId,
            assigned_to_all: false,
            is_active: true,
            start_date: examForm.startDate || null,
            end_date: examForm.endDate || null,
            created_by: userData.id,
          });
        }
      }

      if (assignments.length > 0) {
        const { error: assignError } = await supabase.from('school_exam_assignments').insert(assignments);
        if (assignError) {
          console.error('Assignment error:', assignError);
          toast.error('Exam created but assignment failed: ' + assignError.message);
        }
      }

      setUploadProgress(100);

      toast.success(`Exam created with ${totalQuestions} questions!${examForm.publishImmediately ? ' Students can see it now.' : ' Remember to publish it.'}`);
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();

    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast.error(error.message || 'Failed to create exam');
    } finally {
      setLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
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
      questionSelectionMode: 'custom',
      questionsPerSubject: 10,
      assignToAll: true,
      selectedStudents: [],
      selectedClasses: [],
      startDate: '',
      endDate: '',
      publishImmediately: true,
    });
    setUploadedQuestions([]);
    setSelectedBankQuestionIds([]);
    setStep(1);
    setQuestionTab('text');
    setQuestionsText('');
  };

  const toggleSubject = (subjectId: string) => {
    setExamForm(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subjectId)
        ? prev.selectedSubjects.filter(id => id !== subjectId)
        : [...prev.selectedSubjects, subjectId]
    }));
  };

  const toggleStudent = (userId: string) => {
    setExamForm(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(userId)
        ? prev.selectedStudents.filter(id => id !== userId)
        : [...prev.selectedStudents, userId]
    }));
  };

  const toggleClass = (className: string) => {
    setExamForm(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(className)
        ? prev.selectedClasses.filter(c => c !== className)
        : [...prev.selectedClasses, className]
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
      toast.success(`Exam ${!currentStatus ? 'published — students can now see it' : 'unpublished'}`);
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

  const copyTextTemplate = () => {
    const template = `1. What is the chemical formula for water?
A) H2O2
B) H2O
C) HO2
D) OH2
Answer: B
Explanation: Water is made up of 2 hydrogen atoms and 1 oxygen atom.

2. Who is the first president of Nigeria?
A) Obafemi Awolowo
B) Nnamdi Azikiwe
C) Tafawa Balewa
D) Yakubu Gowon
Answer: B
Explanation: Dr. Nnamdi Azikiwe was the first President of Nigeria.`;

    navigator.clipboard.writeText(template).then(() => {
      toast.success('Template copied to clipboard');
    });
  };

  const totalQuestionsCount = examForm.questionSelectionMode === 'edura'
    ? (examForm.selectedSubjects.length || 0) * (examForm.questionsPerSubject || 0)
    : (uploadedQuestions.length + selectedBankQuestionIds.length);

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
                    {s === 1 ? 'Details' : s === 2 ? 'Questions' : 'Assign & Publish'}
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

                {/* Question Selection Mode */}
                <div>
                  <Label className="mb-3 block">Question Selection Method *</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                      onClick={() => setExamForm({...examForm, questionSelectionMode: 'edura'})}>
                      <Checkbox
                        checked={examForm.questionSelectionMode === 'edura'}
                        onCheckedChange={() => setExamForm({...examForm, questionSelectionMode: 'edura'})}
                      />
                      <div className="flex-1">
                        <Label className="cursor-pointer font-semibold text-base">Use Edura Questions</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Automatically pull random questions from Edura's database. Just specify the number of questions per subject.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition"
                      onClick={() => setExamForm({...examForm, questionSelectionMode: 'custom'})}>
                      <Checkbox
                        checked={examForm.questionSelectionMode === 'custom'}
                        onCheckedChange={() => setExamForm({...examForm, questionSelectionMode: 'custom'})}
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

                {/* Questions per Subject - Only for Edura Mode */}
                {examForm.questionSelectionMode === 'edura' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label htmlFor="questionsPerSubject" className="font-semibold text-blue-900">Questions per Subject *</Label>
                    <p className="text-sm text-blue-700 mt-1 mb-3">
                      Specify how many questions each student will randomly receive from Edura's database per subject.
                    </p>
                    <Input
                      id="questionsPerSubject"
                      type="number"
                      value={examForm.questionsPerSubject}
                      onChange={(e) => setExamForm({...examForm, questionsPerSubject: parseInt(e.target.value) || 0})}
                      min={1}
                      max={100}
                      placeholder="e.g., 10"
                    />
                    <p className="text-sm font-medium mt-2 text-blue-900">
                      Total questions per student: {examForm.selectedSubjects.length * examForm.questionsPerSubject}
                    </p>
                  </div>
                )}

                <div>
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
                    if (examForm.questionSelectionMode === 'edura' && !examForm.questionsPerSubject) return toast.error('Specify questions per subject for Edura mode');
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
                {examForm.questionSelectionMode === 'edura' && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-900">
                      <p className="font-semibold mb-2">✅ Edura Mode Enabled</p>
                      <p>Your exam is set to use Edura's random question system. Questions will be automatically selected when students take the exam.</p>
                      <p className="mt-2 text-sm font-medium">
                        {examForm.selectedSubjects.length} subjects × {examForm.questionsPerSubject} questions = {examForm.selectedSubjects.length * examForm.questionsPerSubject} questions per student
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    {examForm.questionSelectionMode === 'edura' ? 'Automatic Questions' : `${totalQuestionsCount} questions added`}
                  </Badge>
                </div>

                {examForm.questionSelectionMode === 'custom' && (
                  <>
                <Tabs value={questionTab} onValueChange={(v: any) => setQuestionTab(v)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text">
                      <Sparkles className="w-3 h-3 mr-1" /> Text
                    </TabsTrigger>
                    <TabsTrigger value="csv">
                      <FileSpreadsheet className="w-3 h-3 mr-1" /> CSV
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <Plus className="w-3 h-3 mr-1" /> Manual
                    </TabsTrigger>
                    <TabsTrigger value="bank">
                      <BookOpen className="w-3 h-3 mr-1" /> Bank
                    </TabsTrigger>
                  </TabsList>

                  {/* Text Format Upload (like admin) */}
                  <TabsContent value="text" className="space-y-4">
                    <Alert>
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        Paste questions in standard WAEC/JAMB format. The system will auto-detect questions, options, answers and explanations.
                      </AlertDescription>
                    </Alert>

                    <Button variant="outline" size="sm" onClick={copyTextTemplate} className="w-full">
                      <Copy className="w-3 h-3 mr-2" /> Copy Sample Template
                    </Button>

                    <Textarea
                      value={questionsText}
                      onChange={e => setQuestionsText(e.target.value)}
                      placeholder={`Paste questions here in this format:\n\n1. What is 2 + 2?\nA) 3\nB) 4\nC) 5\nD) 6\nAnswer: B\nExplanation: 2 + 2 = 4`}
                      className="min-h-[200px] font-mono text-sm"
                    />

                    <Button onClick={handleTextUpload} className="w-full">
                      <Upload className="w-4 h-4 mr-2" /> Parse & Add Questions
                    </Button>
                  </TabsContent>

                  {/* CSV Upload */}
                  <TabsContent value="csv" className="space-y-4">
                    <Alert>
                      <FileSpreadsheet className="h-4 w-4" />
                      <AlertDescription>
                        Upload a CSV file with columns: Subject, Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={downloadCSVTemplate} className="flex-1">
                        <Download className="w-4 h-4 mr-2" /> Download Template
                      </Button>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                        <Upload className="w-4 h-4 mr-2" /> Upload CSV
                      </Button>
                      <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleCSVUpload} className="hidden" />
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
                      <p className="text-sm text-muted-foreground">{bankQuestions.length} questions available</p>
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
                            <Badge variant="outline" className="text-xs mt-1">{q.subjects?.name || 'Unknown'}</Badge>
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
                      <Button variant="ghost" size="sm" onClick={() => setUploadedQuestions([])}>Clear All</Button>
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
                  </>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (examForm.questionSelectionMode === 'custom' && totalQuestionsCount === 0) {
                        return toast.error('Add at least one question');
                      }
                      setStep(3);
                    }}
                  >
                    Next: Assign & Publish
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Assign & Publish */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    Exam Summary
                    {examForm.questionSelectionMode === 'edura' && (
                      <Badge className="bg-blue-100 text-blue-900 ml-auto">📚 Edura Questions</Badge>
                    )}
                  </h4>
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

                {/* Assignment method */}
                <div className="space-y-3">
                  <Label className="font-medium">Assign To</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assignAll"
                      checked={examForm.assignToAll}
                      onCheckedChange={checked => setExamForm({
                        ...examForm,
                        assignToAll: !!checked,
                        selectedStudents: [],
                        selectedClasses: [],
                      })}
                    />
                    <Label htmlFor="assignAll" className="cursor-pointer font-normal">
                      All Students ({students.length})
                    </Label>
                  </div>

                  {!examForm.assignToAll && (
                    <div className="space-y-3">
                      {/* By Class */}
                      {classLevels.length > 0 && (
                        <div>
                          <Label className="text-sm mb-2 block">By Class</Label>
                          <div className="flex flex-wrap gap-2">
                            {classLevels.map(cls => (
                              <div key={cls} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`cls-${cls}`}
                                  checked={examForm.selectedClasses.includes(cls)}
                                  onCheckedChange={() => toggleClass(cls)}
                                />
                                <Label htmlFor={`cls-${cls}`} className="cursor-pointer font-normal text-sm">
                                  {cls} ({students.filter((s: any) => s.class_level === cls).length} students)
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Individual students */}
                      {examForm.selectedClasses.length === 0 && (
                        <div>
                          <Label className="text-sm mb-2 block">Or Select Individual Students</Label>
                          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                            {students.map((student: any) => (
                              <div key={student.user_id} className="flex items-center space-x-2 py-1">
                                <Checkbox
                                  id={`stu-${student.user_id}`}
                                  checked={examForm.selectedStudents.includes(student.user_id)}
                                  onCheckedChange={() => toggleStudent(student.user_id)}
                                />
                                <Label htmlFor={`stu-${student.user_id}`} className="cursor-pointer font-normal text-sm">
                                  {student.full_name} {student.class_level ? `(${student.class_level})` : ''}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dates */}
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

                {/* Publish toggle */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-accent/5">
                  <Checkbox
                    id="publishNow"
                    checked={examForm.publishImmediately}
                    onCheckedChange={checked => setExamForm({...examForm, publishImmediately: !!checked})}
                  />
                  <div>
                    <Label htmlFor="publishNow" className="cursor-pointer font-medium">
                      Publish immediately
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Students will be able to see and take the exam right away. Uncheck to save as draft.
                    </p>
                  </div>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Creating exam...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={isUploading}>Back</Button>
                  <Button className="flex-1" onClick={handleCreateExam} disabled={loading || isUploading}>
                    {isUploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Create Exam</>
                    )}
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
                Create your first exam to get started. You can upload questions via text, CSV, or add manually.
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
            const completedCount = results.filter((r: any) => r.results && r.results.length > 0).length;
            const avgScore = completedCount > 0
              ? Math.round(results.reduce((sum: number, r: any) => sum + (r.results?.[0]?.percentage || 0), 0) / completedCount)
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
                      {exam.description && <CardDescription>{exam.description}</CardDescription>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => togglePublish(exam.id, exam.is_published)}
                        title={exam.is_published ? 'Unpublish' : 'Publish'}>
                        {exam.is_published ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteExam(exam.id)}>
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
                        <Badge key={es.id} variant="outline">{es.subject_name} ({es.question_count}q)</Badge>
                      ))}
                    </div>
                  )}

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
                          {results.map((attempt: any) => (
                            <tr key={attempt.id} className="border-t">
                              <td className="p-2">{attempt.users?.first_name} {attempt.users?.last_name}</td>
                              <td className="p-2 text-center">
                                {attempt.results?.[0]?.raw_score ?? '-'}/{attempt.results?.[0]?.total_questions ?? '-'}
                              </td>
                              <td className="p-2 text-center">
                                <Badge variant={(attempt.results?.[0]?.percentage ?? 0) >= 50 ? 'default' : 'destructive'}>
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
