import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SyllabusCoverage {
  id: string;
  subject_id: string;
  subject_name?: string;
  topic_name: string;
  coverage_percentage: number;
  mastery_percentage: number;
  attempted_questions: number;
  total_questions: number;
  correct_questions: number;
  last_practiced_at: string;
}

export const useSyllabusCoverage = () => {
  const { userProfile } = useAuth();
  const [coverage, setCoverage] = useState<SyllabusCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallCoverage, setOverallCoverage] = useState(0);

  useEffect(() => {
    if (userProfile?.id) {
      fetchCoverage();
    }
  }, [userProfile]);

  const fetchCoverage = async () => {
    if (!userProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('syllabus_coverage')
        .select(`
          *,
          subjects (
            name
          )
        `)
        .eq('user_id', userProfile.id)
        .order('coverage_percentage', { ascending: false });

      if (error) throw error;

      const coverageData = data?.map(item => ({
        id: item.id,
        subject_id: item.subject_id,
        subject_name: (item.subjects as any)?.name,
        topic_name: item.topic_name,
        coverage_percentage: item.coverage_percentage || 0,
        mastery_percentage: item.mastery_percentage || 0,
        attempted_questions: item.attempted_questions,
        total_questions: item.total_questions,
        correct_questions: item.correct_questions,
        last_practiced_at: item.last_practiced_at,
      })) || [];

      setCoverage(coverageData);

      // Calculate overall coverage
      if (coverageData.length > 0) {
        const avgCoverage = coverageData.reduce((sum, item) => sum + item.coverage_percentage, 0) / coverageData.length;
        setOverallCoverage(Math.round(avgCoverage));
      }
    } catch (error) {
      console.error('Error fetching syllabus coverage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoverageBySubject = (subjectId: string) => {
    return coverage.filter(c => c.subject_id === subjectId);
  };

  return {
    coverage,
    loading,
    overallCoverage,
    getCoverageBySubject,
    refetch: fetchCoverage,
  };
};
