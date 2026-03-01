import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CleanCBTInterface } from "@/components/CleanCBTInterface";
import { CBTQuestion, CBTAnswers } from "@/hooks/useCBTExam";

export default function AkboyMockExam() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const regNumber = searchParams.get("reg");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  const [answers, setAnswers] = useState<CBTAnswers>({});
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [rawQuestions, setRawQuestions] = useState<any[]>([]);
  const [examDuration, setExamDuration] = useState(120);

  useEffect(() => {
    if (!regNumber) {
      navigate("/akboy/mock-login");
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
        navigate("/akboy/mock-login");
        return;
      }

      setRegistrationData(login);

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
        navigate("/akboy/mock-login");
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

      // Update registration status
      await supabase
        .from("mock_registrations" as any)
        .update({ exam_status: "started", exam_started_at: new Date().toISOString() } as any)
        .eq("id", login.registration_id);

    } catch (error: any) {
      console.error("Error loading exam:", error);
      toast.error("Failed to load exam");
      navigate("/akboy/mock-login");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const submitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Calculate scores per subject (JAMB-style: converted over 100 each)
      const subjectScores: Record<string, { correct: number; total: number }> = {};

      rawQuestions.forEach((q, index) => {
        const subjectName = q.subject_name || "Unknown";
        if (!subjectScores[subjectName]) {
          subjectScores[subjectName] = { correct: 0, total: 0 };
        }
        subjectScores[subjectName].total++;
        
        const userAnswerIndex = answers[q.id];
        if (userAnswerIndex !== undefined) {
          // Get the option text the user selected
          const cbtQ = questions[index];
          if (cbtQ) {
            const selectedOptionIndex = cbtQ.originalIndexMap[userAnswerIndex];
            const options = Array.isArray(q.options) ? q.options : 
              typeof q.options === 'object' ? Object.values(q.options) : [];
            
            // Check correct answer - could be letter (A, B, C, D) or index
            const correctAnswer = q.correct_answer;
            let isCorrect = false;
            
            if (typeof correctAnswer === 'string' && correctAnswer.length === 1) {
              // Letter-based: A=0, B=1, C=2, D=3
              const correctIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65;
              isCorrect = selectedOptionIndex === correctIndex;
            } else {
              isCorrect = String(selectedOptionIndex) === String(correctAnswer);
            }
            
            if (isCorrect) {
              subjectScores[subjectName].correct++;
            }
          }
        }
      });

      const subjectScoresArray = Object.entries(subjectScores).map(([name, data]) => ({
        subject_name: name,
        correct: data.correct,
        total: data.total,
        converted_score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }));

      const totalScore = subjectScoresArray.reduce((sum, s) => sum + s.converted_score, 0);
      const sorted = [...subjectScoresArray].sort((a, b) => b.converted_score - a.converted_score);
      const strengths = sorted.filter(s => s.converted_score >= 60).map(s => s.subject_name);
      const weaknesses = sorted.filter(s => s.converted_score < 50).map(s => s.subject_name);

      await supabase.from("mock_results" as any).insert({
        registration_id: registrationData.registration_id,
        registration_number: regNumber,
        total_score: totalScore,
        max_score: 400,
        subject_scores: subjectScoresArray,
        strengths,
        weaknesses,
        is_released: false,
        batch_id: registrationData.batch_id || null,
      } as any);

      await supabase.from("mock_registrations" as any)
        .update({ exam_status: "submitted", exam_submitted_at: new Date().toISOString() } as any)
        .eq("id", registrationData.registration_id);

      navigate("/akboy/mock-submitted");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [questions, answers, rawQuestions, registrationData, regNumber, navigate, submitting]);

  if (!regNumber) return null;

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
