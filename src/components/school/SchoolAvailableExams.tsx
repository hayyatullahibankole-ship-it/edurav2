import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, FileText, AlertCircle, Play, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SchoolAvailableExams() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      // Fetch assigned school exams
      const { data: assignments, error: assignmentsError } = await supabase
        .from('school_exam_assignments')
        .select(`
          *,
          exams (
            id,
            title,
            description,
            type,
            duration_minutes,
            total_questions,
            is_published,
            exam_subjects (
              subject_id,
              subject_name,
              question_count
            )
          )
        `)
        .or(`student_id.eq.${userData.id},assigned_to_all.eq.true`)
        .eq('is_active', true);

      console.log('[SchoolAvailableExams] fetchExams - userId:', userData?.id);
      if (assignmentsError) console.error('[SchoolAvailableExams] assignmentsError:', assignmentsError);
      console.log('[SchoolAvailableExams] raw assignments:', assignments);

      if (assignments) {
        // Filter for published exams and check dates
        const now = new Date();
        const availableExams = assignments
          .filter(a => {
            const exam = a.exams;
            if (!exam || !exam.is_published) return false;
            
            // Check start date
            if (a.start_date && new Date(a.start_date) > now) return false;
            
            // Check end date
            if (a.end_date && new Date(a.end_date) < now) return false;
            
            return true;
          })
          .map(a => ({
            ...a.exams,
            assignment: a
          }));

        console.log('[SchoolAvailableExams] availableExams after filtering:', availableExams);
        setExams(availableExams);
      }
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      setError(error.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const startExam = async (examId: string) => {
    try {
      // Get user data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      // Fetch exam details with subjects
      const { data: exam } = await supabase
        .from('exams')
        .select(`
          *,
          exam_subjects (
            subject_id,
            question_count,
            subject_name
          )
        `)
        .eq('id', examId)
        .single();

      if (!exam) {
        toast.error('Exam not found');
        return;
      }

      let questionIds: string[] = [];
      
      // Determine question selection mode (default to 'custom' for existing exams)
      const selectionMode = exam.question_selection_mode || 'custom';

      // Load questions based on selection mode
      if (selectionMode === 'edura') {
        // For Edura mode: fetch random questions per subject
        const allQuestions: any[] = [];
        let rpcFailed = false;
        
        for (const examSubject of exam.exam_subjects) {
          try {
            const { data: questions, error: questionsError } = await supabase
              .rpc('get_random_questions_for_subjects', {
                subject_ids: [examSubject.subject_id],
                per_subject_count: examSubject.question_count
              });
            
            if (questionsError) {
              console.warn('RPC error for Edura questions:', questionsError);
              rpcFailed = true;
              break;
            }
            
            if (questions && questions.length > 0) {
              allQuestions.push(...questions);
            }
          } catch (err) {
            console.warn('Exception calling RPC function:', err);
            rpcFailed = true;
            break;
          }
        }
        
        // If RPC failed, fall back to custom mode logic
        if (rpcFailed || allQuestions.length === 0) {
          console.warn('Edura mode RPC failed or no questions returned, falling back to custom mode');
          const { data: examQuestions } = await supabase
            .from('exam_questions')
            .select('question_id')
            .eq('exam_id', examId)
            .order('display_order');

          if (examQuestions && examQuestions.length > 0) {
            questionIds = examQuestions.map(eq => eq.question_id);
          } else {
            toast.error('No questions available for this exam');
            return;
          }
        } else {
          questionIds = allQuestions.map(q => q.id);
        }
      } else {
        // For custom mode: use pre-linked questions from exam_questions table
        const { data: examQuestions } = await supabase
          .from('exam_questions')
          .select('question_id')
          .eq('exam_id', examId)
          .order('display_order');

        if (examQuestions && examQuestions.length > 0) {
          questionIds = examQuestions.map(eq => eq.question_id);
        } else {
          // Fallback: if no questions are linked, try random questions
          const allQuestions: any[] = [];
          for (const examSubject of exam.exam_subjects) {
            try {
              const { data: questions } = await supabase
                .rpc('get_random_questions_for_subjects', {
                  subject_ids: [examSubject.subject_id],
                  per_subject_count: examSubject.question_count
                });
              if (questions && questions.length > 0) allQuestions.push(...questions);
            } catch (err) {
              console.warn('Fallback RPC call failed:', err);
            }
          }
          questionIds = allQuestions.map(q => q.id);
        }
      }

      if (questionIds.length === 0) {
        toast.error('No questions available for this exam. Please contact your administrator.');
        return;
      }

      // Create attempt
      const { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .insert({
          user_id: userData.id,
          exam_id: examId,
          status: 'STARTED',
          time_remaining_seconds: exam.duration_minutes * 60,
          proctoring_data: {
            exam_type: exam.type,
            total_questions: questionIds.length,
            question_ids: questionIds
          }
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      // Navigate to exam interface
      navigate(`/exam/${attempt.id}`);
      
    } catch (error: any) {
      console.error('Error starting exam:', error);
      toast.error(error.message || 'Failed to start exam');
    }
  };

  if (loading) {
          console.log('[SchoolAvailableExams] startExam - exam fetched:', exam);
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading available exams...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">School Assigned Exams</h2>
        <p className="text-sm text-muted-foreground">
          Exams assigned to you by your school
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {exams.length === 0 ? (
        <Card>
          console.log('[SchoolAvailableExams] startExam - questionIds length:', questionIds.length, 'ids:', questionIds.slice(0,10));

          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">No exams assigned</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your school hasn't assigned any exams yet
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      <Badge variant="outline">{exam.type}</Badge>
                    </div>
                    {exam.description && (
                      <CardDescription className="mt-2">{exam.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {exam.duration_minutes} minutes
                    </span>
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {exam.total_questions} questions
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      {exam.exam_subjects?.length || 0} subjects
                    </span>
                    {exam.assignment?.end_date && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Due: {new Date(exam.assignment.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <Button onClick={() => startExam(exam.id)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Exam
                  </Button>
                </div>

                {exam.exam_subjects && exam.exam_subjects.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {exam.exam_subjects.map((subject: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {subject.subject_name} ({subject.question_count} questions)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
