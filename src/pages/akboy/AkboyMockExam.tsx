import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CleanCBTInterface } from "@/components/CleanCBTInterface";
import { CBTQuestion, CBTAnswers } from "@/hooks/useCBTExam";
import { ExamNotYetAvailableModal } from "@/components/ExamNotYetAvailableModal";

export default function AkboyMockExam() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAkboy } = useDomainDetection();
  const basePath = isAkboy ? "" : "/akboy";
  const regNumber = searchParams.get("reg");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  const [answers, setAnswers] = useState<CBTAnswers>({});
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [rawQuestions, setRawQuestions] = useState<any[]>([]);
  const [examDuration, setExamDuration] = useState(120);
  const [showNotYetAvailableModal, setShowNotYetAvailableModal] = useState(false);
  const [notYetAvailableExam, setNotYetAvailableExam] = useState<{ title: string; scheduledDate: Date } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!regNumber) {
      navigate(`${basePath}/mock-login`);
      return;
    }
    loadExam();
  }, [regNumber]);

  const loadExam = async () => {
    try {
      const { data: loginResult, error: loginError } = await supabase.rpc("validate_mock_exam_login" as any, {
        p_registration_number: regNumber,
      });

      if (loginError) throw loginError;
      const login = loginResult as any;

      if (!login.valid) {
        toast.error(login.message);
        navigate(`${basePath}/mock-login`);
        return;
      }

      setRegistrationData(login);

      // Get current user for attempt creation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User authentication required");
        navigate(`${basePath}/mock-login`);
        return;
      }
      setUserId(user.id);

      // Check if exam is scheduled for a future date/time
      if (login.batch_id) {
        const { data: batch } = await supabase
          .from("mock_batches" as any)
          .select("exam_date, title")
          .eq("id", login.batch_id)
          .single();
        
        if (batch?.exam_date) {
          const scheduledExamTime = new Date(batch.exam_date);
          const currentTime = new Date();
          
          if (currentTime < scheduledExamTime) {
            // Show modal with the scheduled date/time
            setNotYetAvailableExam({
              title: batch.title || "Mock Examination",
              scheduledDate: scheduledExamTime
            });
            setShowNotYetAvailableModal(true);
            setLoading(false);
            return;
          }
        }
      }

      const { data: durSetting } = await supabase
        .from("mock_settings" as any)
        .select("value")
        .eq("key", "exam_duration_minutes")
        .single();
      
      if (durSetting) {
        const dur = typeof (durSetting as any).value === 'string' 
          ? parseInt((durSetting as any).value) 
          : (durSetting as any).value;
        if (dur && !isNaN(dur)) setExamDuration(dur);
      }

      const subjects = login.subjects || [];
      const allRawQuestions: any[] = [];

      for (const subject of subjects) {
        const questionCount = subject.questions || (subject.name === 'English Language' ? 60 : 40);
        
        try {
          const { data: rpcQuestions, error: rpcError } = await supabase.rpc(
            "get_random_questions_for_subjects" as any,
            { subject_ids: [subject.id], per_subject_count: questionCount }
          );

          if (!rpcError && rpcQuestions && (rpcQuestions as any[]).length > 0) {
            const qs = (rpcQuestions as any[]).map((q: any) => ({ ...q, subject_name: subject.name }));
            allRawQuestions.push(...qs);
            continue;
          }
        } catch (e) {
          console.warn("RPC failed for subject", subject.name, e);
        }

        const { data: directQuestions } = await supabase
          .from("questions")
          .select("id, question_text, options, correct_answer, explanation, subject_id")
          .eq("subject_id", subject.id)
          .eq("is_active", true)
          .limit(questionCount);

        if (directQuestions) {
          const qs = directQuestions.map((q: any) => ({ ...q, subject_name: subject.name }));
          allRawQuestions.push(...qs);
        }
      }

      if (allRawQuestions.length === 0) {
        toast.error("No questions available. Please contact the administrator.");
        navigate(`${basePath}/mock-login`);
        return;
      }

      setRawQuestions(allRawQuestions);

      // Convert to CBTQuestion format
      const cbtQuestions: CBTQuestion[] = allRawQuestions.map((q, index) => {
        const options = Array.isArray(q.options) ? q.options : 
          typeof q.options === 'object' ? Object.values(q.options) : [];
        const optionStrings = options.map((o: any) => typeof o === 'string' ? o : String(o));
        const originalIndexMap = optionStrings.map((_: any, i: number) => i);

        return {
          id: q.id,
          questionText: q.question_text,
          options: optionStrings,
          originalIndexMap,
          subject: q.subject_name || 'Unknown',
          displayIndex: index + 1,
        };
      });

      setQuestions(cbtQuestions);

      // Create an attempt record for this mock exam
      try {
        const { data: newAttempt, error: attemptError } = await supabase
          .from("attempts")
          .insert({
            user_id: user.id,
            exam_id: login.mock_exam_id || "mock-exam", // Use mock exam identifier
            status: "STARTED",
            time_remaining_seconds: examDuration * 60,
            proctoring_data: {
              mock_registration_id: login.registration_id,
              registration_number: regNumber,
              title: "AKBOY JAMB Mock Examination",
              duration_minutes: examDuration,
              is_mock: true,
            },
          })
          .select()
          .single();

        if (attemptError) {
          console.error("Failed to create attempt:", attemptError);
          toast.error("Failed to initialize exam attempt");
          return;
        }

        setAttemptId(newAttempt.id);
      } catch (attemptCreationError: any) {
        console.error("Attempt creation error:", attemptCreationError);
        toast.error("Failed to create exam attempt");
        return;
      }

      // Update registration status
      await supabase
        .from("mock_registrations" as any)
        .update({ exam_status: "started", exam_started_at: new Date().toISOString() } as any)
        .eq("id", login.registration_id);

    } catch (error: any) {
      console.error("Error loading exam:", error);
      toast.error("Failed to load exam");
      navigate(`${basePath}/mock-login`);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const submitExam = useCallback(async () => {
    if (submitting || !attemptId) return;
    setSubmitting(true);

    try {
      // Prepare answer records for insertion into attempt_answers
      const attemptAnswers = rawQuestions.map((q) => {
        const optionIndex = answers[q.id];
        let selectedAnswer: string | null = null;

        if (optionIndex !== undefined) {
          const cbtQ = questions.find(cq => cq.id === q.id);
          if (cbtQ) {
            // Map display index back to original DB index
            const originalIndex = cbtQ.originalIndexMap[optionIndex];
            // Convert to letter (A, B, C, D)
            selectedAnswer = String.fromCharCode(65 + originalIndex);
          }
        }

        return {
          attempt_id: attemptId,
          question_id: q.id,
          selected_answer: selectedAnswer,
        };
      });

      // Insert all answers into attempt_answers table
      const { error: answersError } = await supabase
        .from("attempt_answers")
        .insert(attemptAnswers);

      if (answersError) {
        throw answersError;
      }

      // Update attempt status to SUBMITTED - this triggers result computation via the trigger
      const { error: statusError } = await supabase
        .from("attempts")
        .update({ status: "SUBMITTED" })
        .eq("id", attemptId);

      if (statusError) {
        throw statusError;
      }

      // Redirect to mock-submitted page with registration number
      // Results will be computed in background and available in mock-results when checked later
      navigate(`${basePath}/mock-submitted?reg=${encodeURIComponent(regNumber)}`);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.message || "Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, submitting, answers, rawQuestions, questions, navigate, basePath, regNumber]);

  if (!regNumber) return null;

  if (showNotYetAvailableModal && notYetAvailableExam) {
    return (
      <ExamNotYetAvailableModal
        isOpen={showNotYetAvailableModal}
        examTitle={notYetAvailableExam.title}
        scheduledDate={notYetAvailableExam.scheduledDate}
        onClose={() => navigate(`${basePath}/mock-login`)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-lg">Loading mock exam...</p>
          <p className="text-sm text-muted-foreground">Preparing your 180 questions</p>
        </div>
      </div>
    );
  }

  return (
    <CleanCBTInterface
      questions={questions}
      answers={answers}
      onAnswerSelect={selectAnswer}
      onSubmit={submitExam}
      duration={examDuration}
      examTitle="AKBOY JAMB Mock Examination"
      submitting={submitting}
      bypassSubscription={true}
    />
  );
}
