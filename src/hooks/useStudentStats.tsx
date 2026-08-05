import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type StudentStats = {
  testsTaken: number;
  averageScore: number;
  studyHours: number;
  rank: number;
  totalStudents: number;
};

export type RecentTest = {
  attemptId: string;
  subject: string;
  score: number;
  date: string;
  duration: string;
};

export type SubjectProgress = { subject: string; progress: number; total: number };

const EMPTY_STATS: StudentStats = {
  testsTaken: 0,
  averageScore: 0,
  studyHours: 0,
  rank: 0,
  totalStudents: 0,
};

/**
 * Practice statistics for the signed-in student: shared by the unified Home
 * screen and the dedicated CBT hub so both always agree.
 */
export const useStudentStats = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<StudentStats>(EMPTY_STATS);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: schoolStudent } = await supabase
        .from("school_students")
        .select("school_id, schools(name, logo_url, school_code)")
        .eq("user_id", userProfile.id)
        .maybeSingle();
      if (schoolStudent?.schools) setSchoolInfo(schoolStudent.schools);

      const { data: allAttempts } = await supabase.rpc("get_student_exam_progress");
      const attempts = (allAttempts || [])
        .filter((a: any) => a.user_id === userProfile.id && a.status === "SUBMITTED")
        .sort(
          (a: any, b: any) =>
            new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );

      const attemptIds = attempts.map((a: any) => a.id);
      const { data: allResults } = await supabase
        .from("results")
        .select("*")
        .in("attempt_id", attemptIds);
      const resultsMap = new Map((allResults || []).map((r: any) => [r.attempt_id, r]));
      const withResults = attempts.map((attempt: any) => ({
        ...attempt,
        results: resultsMap.has(attempt.id) ? [resultsMap.get(attempt.id)] : [],
      }));

      const scored = withResults.filter((a: any) => a.results?.length > 0);
      const testsTaken = withResults.length;
      const averageScore = scored.length
        ? Math.round(
            scored.reduce((sum: number, a: any) => sum + (a.results[0]?.percentage || 0), 0) /
              scored.length
          )
        : 0;
      const studyHours = Math.round(
        scored.reduce((sum: number, a: any) => sum + (a.results[0]?.time_taken_minutes || 0), 0) / 60
      );

      let rank = 0;
      let totalStudents = 0;
      const latestAttemptId = scored[0]?.id;
      if (latestAttemptId) {
        try {
          const { data: rankData } = await supabase.functions.invoke("get-rank", {
            body: { attemptId: latestAttemptId },
          });
          rank = rankData?.rank || 0;
          totalStudents = rankData?.total || 0;
        } catch {
          /* rank is best-effort */
        }
      }

      setStats({ testsTaken, averageScore, studyHours, rank, totalStudents });

      setRecentTests(
        scored.slice(0, 4).map((attempt: any) => {
          const result = attempt.results[0];
          const timeTaken = result?.time_taken_minutes || 0;
          const proctoring = (attempt.proctoring_data as any) || {};
          return {
            attemptId: attempt.id,
            subject: proctoring.title || "Practice Test",
            score: Math.round(result?.percentage || 0),
            date: new Date(attempt.submitted_at).toLocaleDateString(),
            duration: `${Math.floor(timeTaken / 60)}h ${timeTaken % 60}m`,
          };
        })
      );

      const subjectScores: Record<string, number[]> = {};
      scored.forEach((attempt: any) => {
        const breakdown = attempt.results[0]?.subject_breakdown || {};
        if (typeof breakdown === "object" && breakdown !== null) {
          Object.entries(breakdown).forEach(([subject, data]: [string, any]) => {
            const key = subject.trim();
            const percentage =
              typeof data === "number" ? data : data?.percentage || data?.score || 0;
            (subjectScores[key] ||= []).push(percentage);
          });
        }
      });
      setSubjectProgress(
        Object.entries(subjectScores).map(([subject, scores]) => ({
          subject,
          progress: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
          total: 100,
        }))
      );
    } catch (error) {
      console.error("Error loading student stats", error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, recentTests, subjectProgress, schoolInfo, loading, reload: load };
};
