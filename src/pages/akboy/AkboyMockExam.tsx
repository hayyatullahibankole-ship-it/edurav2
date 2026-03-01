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

      // Check if exam is scheduled for a future date/time
      if (login.batch_id) {
        const { data: batch, error: batchError } = await supabase
          .from("mock_batches" as any)
          .select("exam_date, title")
          .eq("id", login.batch_id)
          .single();
        
        if (!batchError && batch) {
          const batchData = batch as any;
          if (batchData?.exam_date) {
            const scheduledExamTime = new Date(batchData.exam_date);
            const currentTime = new Date();
            
            if (currentTime < scheduledExamTime) {
              // Show modal with the scheduled date/time
              setNotYetAvailableExam({
                title: batchData.title || "Mock Examination",
                scheduledDate: scheduledExamTime
              });
              setShowNotYetAvailableModal(true);
              setLoading(false);
              return;
            }
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

      // Create an attempt record for this mock exam (unauthenticated)
      // Using RPC function to bypass RLS constraints
      try {
        console.log("Creating mock exam attempt using RPC function...");

        const { data: rpcResult, error: rpcError } = await supabase
          .rpc("create_mock_exam_attempt" as any, {
            // pass null when there is no valid exam id to avoid inserting text into uuid column
            p_exam_id: (login?.mock_exam_id ?? null) as any,
            p_registration_id: login.registration_id,
            p_registration_number: regNumber,
            p_exam_duration_minutes: examDuration,
            p_exam_title: "AKBOY JAMB Mock Examination"
          });

        if (rpcError) {
          console.error("RPC call failed:", {
            message: rpcError.message,
            code: rpcError.code,
            details: rpcError.details,
            fullError: rpcError
          });
          toast.error("Failed to initialize exam: " + rpcError.message);
          return;
        }

        console.log("RPC result:", rpcResult);

        const rpcData = rpcResult as any;
        if (rpcData?.status !== 'success') {
          console.error("RPC returned error status:", rpcData?.message);
          toast.error("Failed to initialize exam: " + (rpcData?.message || "Unknown error"));
          return;
        }

        const newAttemptId = rpcData?.attempt_id;
        if (!newAttemptId) {
          console.error("No attempt ID returned from RPC");
          toast.error("Failed to initialize exam session");
          return;
        }

        console.log("Mock exam attempt created successfully:", newAttemptId);
        setAttemptId(newAttemptId);
      } catch (attemptCreationError: any) {
        console.error("Attempt creation try-catch error:", {
          message: attemptCreationError.message,
          stack: attemptCreationError.stack,
          fullError: attemptCreationError
        });
        toast.error("Failed to create exam attempt: " + attemptCreationError.message);
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
    // Prevent submission if already submitting or exam not ready
    if (submitting) return;
    
    if (!attemptId) {
      console.error("Attempt ID not available");
      toast.error("Exam session not initialized. Please reload the page.");
      return;
    }
    
    if (!regNumber) {
      console.error("Registration number not available");
      toast.error("Registration information missing. Please log in again.");
      return;
    }
    
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
          question_id: q.id,
          selected_answer: selectedAnswer,
        };
      });

      console.log(`Submitting ${attemptAnswers.length} answers for attempt ${attemptId}`);

      // Insert all answers using RPC function to bypass RLS
      const { data: answerResult, error: answersError } = await supabase
        .rpc("submit_mock_exam_answers" as any, {
          p_attempt_id: attemptId,
          p_answers: attemptAnswers
        });

      if (answersError) {
        console.error("Answers insert RPC error:", answersError);
        toast.error("Failed to submit answers: " + answersError.message);
        setSubmitting(false);
        return;
      }

      const answerData = answerResult as any;
      if (answerData?.status !== 'success') {
        console.error("Answers insert returned error status:", answerData?.message);
        toast.error("Failed to submit answers: " + (answerData?.message || "Unknown error"));
        setSubmitting(false);
        return;
      }

      console.log("Answers inserted successfully, updating attempt status...");

      // Update attempt status to SUBMITTED using RPC function
      const { data: submitResult, error: statusError } = await supabase
        .rpc("submit_mock_exam" as any, {
          p_attempt_id: attemptId
        });

      if (statusError) {
        console.error("Status update RPC error:", statusError);
        toast.error("Failed to finalize submission: " + statusError.message);
        setSubmitting(false);
        return;
      }

      const submitData = submitResult as any;
      if (submitData?.status !== 'success') {
        console.error("Status update returned error status:", submitData?.message);
        toast.error("Failed to finalize submission: " + (submitData?.message || "Unknown error"));
        setSubmitting(false);
        return;
      }

      console.log("Exam submitted successfully, redirecting...");
      toast.success("Exam submitted successfully!");

      // Redirect to mock-submitted page with registration number
      // Results will be computed in background and available in mock-results when checked later
      navigate(`${basePath}/mock-submitted?reg=${encodeURIComponent(regNumber)}`);
    } catch (error: any) {
      console.error("Submit error:", error);
      const errorMessage = error?.message || "Failed to submit exam. Please try again.";
      toast.error(errorMessage);
      setSubmitting(false);
    }
  }, [attemptId, answers, rawQuestions, questions, navigate, basePath, regNumber, submitting]);

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
      disableSubmit={!attemptId || loading}
    />
  );
}
